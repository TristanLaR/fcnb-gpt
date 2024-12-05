"use client";

import React, { useRef, useCallback, useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VanishingInputProps {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (query: string) => void;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  inputClassName?: string;
  placeholderClassName?: string;
  isDarkMode?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

export function VanishingInput({
  placeholders,
  onChange,
  onSubmit,
  value,
  setValue,
  className,
  inputClassName,
  placeholderClassName,
  isDarkMode,
  disabled,
  isLoading = false
}: VanishingInputProps) {
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const newDataRef = useRef<any[]>([]);

  const draw = useCallback(() => {
    if (!inputRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    canvas.width = inputRect.width;
    canvas.height = inputRect.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    const paddingLeft = parseFloat(computedStyles.getPropertyValue("padding-left"));
    ctx.font = `${fontSize}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = computedStyles.color;
    ctx.fillText(value, paddingLeft, canvas.height / 2 + fontSize / 3);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;
    const newData: any[] = [];

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (pixelData[i + 3] > 0) {
          newData.push({
            x,
            y,
            color: [pixelData[i], pixelData[i + 1], pixelData[i + 2], pixelData[i + 3]],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255 * 0.9})`,
    }));
  }, [value]);

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, ctx.canvas.width, ctx.canvas.height);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.fill();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setAnimating(false);
          setValue('');
        }
      });
    };
    animateFrame(start);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled && !animating) {
      vanishAndSubmit();
    }
  };

  const vanishAndSubmit = () => {
    if (value.trim() && !disabled && !animating) {
      setAnimating(true);
      draw();
      onSubmit(value.trim());

      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value.trim() && !disabled && !animating) {
      vanishAndSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "w-full relative",
        className,
        isDarkMode ? "bg-[#0A1A2F] text-white" : "bg-white text-gray-900 border-2 border-gray-300"
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 pointer-events-none",
          animating ? "opacity-100" : "opacity-0"
        )}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || animating || isLoading}
        className={cn(
          "w-full bg-transparent focus:outline-none",
          inputClassName,
          (disabled || animating || isLoading) && "cursor-not-allowed opacity-50"
        )}
        style={{
          WebkitTextFillColor: animating ? 'transparent' : 'inherit',
        }}
        spellCheck={true}
      />

      <AnimatePresence mode="wait">
        {!value && (
          <motion.span
            key={placeholders[0]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn("absolute inset-y-0 flex items-center pointer-events-none text-gray-400", placeholderClassName)}
          >
            {placeholders[0]}
          </motion.span>
        )}
      </AnimatePresence>
      {isLoading ? (
        <div className="absolute right-6 top-1 -translate-y-1/2 p-1 rounded-full bg-transparent z-10">
          <span className={cn(
            "animate-ping absolute h-4 w-4 rounded-full opacity-60",
            isDarkMode ? "bg-blue-400" : "bg-gray-400"
          )}></span>
          <span className={cn(
            "relative rounded-full h-4 w-4",
            isDarkMode ? "bg-blue-500" : "bg-gray-500"
          )}></span>
        </div>
      ) : (
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-transparent focus:outline-none z-10"
          aria-label="Submit search"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-gray-400"
          >
            <motion.path
              d="M5 12l14 0"
              initial={{
                strokeDasharray: "50%",
                strokeDashoffset: "50%",
              }}
              animate={{
                strokeDashoffset: value ? 0 : "50%",
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
            />
            <path d="M13 18l6 -6" />
            <path d="M13 6l6 6" />
          </motion.svg>
        </button>
      )}
    </form>
  );
}
