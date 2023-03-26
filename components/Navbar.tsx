import { IconSettings, IconSettingsOff } from "@tabler/icons-react";
import { FC, useState } from "react";

type NavbarProps = {
    showSettings: boolean;
    toggleSettings: () => void;
  };

function Navbar({ showSettings, toggleSettings }: NavbarProps) {

  return (
    <div className="flex h-[60px] border-b border-gray-300 py-2 px-8 items-center justify-between">
      <div></div>
      <div className="font-bold text-3xl flex items-center">
          <div className="ml-2">FCNB 🤝 GPT</div>
      </div>
      <div>
        <button onClick={toggleSettings}>
            {showSettings ? (<IconSettingsOff />) : (<IconSettings />)}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
