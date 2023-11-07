// import { OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import * as i18n from '../i18n/i18n';

export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo",
  GPT4 = "gpt-4",
  GPT4_TURBO = "gpt-4-1106-preview"
}

export const OpenAIStream = async (prompt: string, lang: string) => {
  const translate = lang === 'fr' ? 'Translate the output to french. ' : '';

  const instruction = "You are a helpful assistant that accurately answers queries about the Financial Commission of New Brunswick (FCNB) from it's website data. Use the text provided to form your answer, but avoid copying word-for-word from the original text. Try to use your own words when possible. Keep your answer under 5 sentences. Be accurate, helpful, concise, and clear."

  const apiKey = process.env.OPEN_AI_API_KEY;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    method: "POST",
    body: JSON.stringify({
      model: OpenAIModel.GPT4_TURBO,
      messages: [
        {
          role: "system",
          content: instruction
        },
        {
          role: "assistant",
          content: translate
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 256,
      temperature: 0.0,
      stream: true
    })
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    }
  });

  return stream;
};
