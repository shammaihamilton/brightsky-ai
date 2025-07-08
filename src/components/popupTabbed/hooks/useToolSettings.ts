import { useState, useEffect, useCallback } from "react";
import { useChromeStorage } from "./useChromeStorage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setTools } from "../../../store/slices/settingsSlice";
// import { ToolCategory } from "../../../services/mcp/tools/interface/MCPTool";

const TOOL_SETTINGS_KEY = "toolSettings";

export const availableTools = [
  { id: "web_search", label: "Web Search" },
  { id: "calendar", label: "Calendar" },
  { id: "weather", label: "Weather" },
  // Add more tools here
];

export function useToolSettings() {
  const { loadChatSettings, saveChatSettings } = useChromeStorage();
  const dispatch = useAppDispatch();
  const reduxEnabledTools = useAppSelector((state) => state.settings.tools);
  const [enabledTools, setEnabledTools] = useState<string[]>(reduxEnabledTools);

  // Sync local state with Redux state
  useEffect(() => {
    setEnabledTools(reduxEnabledTools);
  }, [reduxEnabledTools]);
  // Load enabled tools from storage on mount
  useEffect(() => {
    const load = async () => {
      const settings = await loadChatSettings();
      if (settings && Array.isArray(settings[TOOL_SETTINGS_KEY])) {
        dispatch(setTools(settings[TOOL_SETTINGS_KEY] as string[]));
      }
    };
    load();
  }, [loadChatSettings, dispatch]);

  // Toggle a tool on/off
  const toggleTool = useCallback(
    async (toolId: string) => {
      let newEnabled: string[];
      if (enabledTools.includes(toolId)) {
        newEnabled = enabledTools.filter((id) => id !== toolId);
      } else {
        newEnabled = [...enabledTools, toolId];
      }
      setEnabledTools(newEnabled);
      dispatch(setTools(newEnabled));
      await saveChatSettings({ [TOOL_SETTINGS_KEY]: newEnabled });
    },
    [enabledTools, saveChatSettings, dispatch]
  );

  return {
    enabledTools,
    toggleTool,
    availableTools,
  };
} 