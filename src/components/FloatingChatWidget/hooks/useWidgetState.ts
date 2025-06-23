import { useState, useEffect, useRef, useCallback } from "react";

export const useWidgetState = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (!showMenu && !showChat) {
      setIsExpanded(false);
    }
  }, [showMenu, showChat]);

  const toggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
    setShowMenu(false);
    if (!showChat) {
      setIsExpanded(true);
    }
  }, [showChat]);

  const toggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev);
    setShowChat(false);
  }, []);

  const closeAll = useCallback(() => {
    setShowMenu(false);
    setShowChat(false);
    if (!isHovered) {
      setIsExpanded(false);
    }
  }, [isHovered]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideWidget = nodeRef.current && !nodeRef.current.contains(target);
      const isOutsideChat = chatPanelRef.current && !chatPanelRef.current.contains(target);

      if (isOutsideWidget && isOutsideChat) {
        closeAll();
      }
    };

    if (showMenu || showChat) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu, showChat, closeAll]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (showMenu || showChat || isHelpModalOpen)) {
        event.preventDefault();
        closeAll();
        setIsHelpModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showMenu, showChat, isHelpModalOpen, closeAll]);

  return {
    isExpanded,
    setIsExpanded,
    isHovered,
    showMenu,
    showChat,
    isHelpModalOpen,
    setIsHelpModalOpen,
    nodeRef,
    chatPanelRef,
    handleMouseEnter,
    handleMouseLeave,
    toggleChat,
    toggleMenu,
    closeAll,
  };
};
