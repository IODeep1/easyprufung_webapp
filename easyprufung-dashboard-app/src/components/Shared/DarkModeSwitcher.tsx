import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useColorMode";
import { sidebarIcon, sidebarLink } from "./sidebar-style";

const DarkModeSwitcher = ({ compact = false }: { compact?: boolean }) => {
  useFeatureLocale();

  const { colorMode, setColorMode } = useTheme() as { colorMode: string; setColorMode: (mode: string) => void };
  const dark = colorMode === "dark";
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      className={compact ? "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-700" : sidebarLink(false)}
      onClick={() => setColorMode(dark ? "light" : "dark")}
      aria-label={dark ? tr("Switch to light mode") : tr("Switch to dark mode")}
    >
      <Icon {...sidebarIcon} size={compact ? 20 : sidebarIcon.size} />
      <span>{dark ? tr("Light mode") : tr("Dark mode")}</span>
    </button>
  );
};

export default DarkModeSwitcher;
