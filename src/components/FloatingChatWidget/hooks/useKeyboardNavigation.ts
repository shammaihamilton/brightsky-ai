import { useCallback } from "react";

interface UseKeyboardNavigationProps {
  movePosition: (direction: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  closeAll: () => void;
  resetPosition?: () => void;
}

export const useKeyboardNavigation = ({
  movePosition,
  isExpanded,
  setIsExpanded,
  closeAll,
  resetPosition,
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          movePosition("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          movePosition("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          movePosition("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          movePosition("right");
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          setIsExpanded(!isExpanded);
          break;
        case "Escape":
          e.preventDefault();
          closeAll();
          (e.target as HTMLElement).blur();
          break;
        case "Home":
          if (resetPosition) {
            e.preventDefault();
            resetPosition();
          }
          break;
      }
    },
    [movePosition, isExpanded, setIsExpanded, closeAll, resetPosition]
  );

  return { handleKeyDown };
};
