import React from "react";
import { Bars3Icon } from "@heroicons/react/24/solid";

interface MenuButtonProps {
  onClick: () => void;
  wasDragged: React.MutableRefObject<boolean>;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, wasDragged }) => {
  const handleClick = () => {
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="w-10 flex items-center justify-center hover:bg-gray-700 transition-colors rounded-r-lg"
      aria-label="Open chat menu"
    >
      <Bars3Icon className="w-4 h-4" />
    </button>
  );
};

export default MenuButton;
