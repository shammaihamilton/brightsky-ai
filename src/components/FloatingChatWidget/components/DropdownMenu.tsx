import React from "react";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  Cog6ToothIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";

interface DropdownMenuProps {
  onChatClick: () => void;
  onSettingsClick: () => void;
  onKeyboardShortcutsClick: () => void;
  onClearConversation: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  onChatClick,
  onSettingsClick,
  onKeyboardShortcutsClick,
  onClearConversation,
}) => {
  const menuItems = [
    {
      section: "chat",
      items: [
        {
          icon: ChatBubbleOvalLeftEllipsisIcon,
          label: "Open Chat",
          onClick: onChatClick,
          className: "hover:bg-blue-500 hover:text-white",
        },
      ],
    },
    {
      section: "settings",
      items: [
        {
          icon: Cog6ToothIcon,
          label: "Chat Settings",
          onClick: onSettingsClick,
          className: "hover:bg-blue-500 hover:text-white",
        },
        {
          icon: QuestionMarkCircleIcon,
          label: "Keyboard Shortcuts",
          onClick: onKeyboardShortcutsClick,
          className: "hover:bg-blue-500 hover:text-white",
        },
      ],
    },
    {
      section: "actions",
      items: [
        {
          icon: TrashIcon,
          label: "Clear Conversation",
          onClick: onClearConversation,
          className: "text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white",
        },
      ],
    },
  ];

  return (
    <div className="absolute top-full mt-2 w-56 bg-white text-black shadow-xl dark:bg-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
      {menuItems.map((section) => (
        <div key={section.section} className="px-1 py-1">
          {section.items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`group flex w-full items-center rounded-md px-2 py-2 text-sm ${item.className}`}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DropdownMenu;
