import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useColorMode";
import { sidebarIcon, sidebarLink } from "./sidebar-style";

const DarkModeSwitcher = () => {
  useFeatureLocale();

  const { colorMode, setColorMode } = useTheme();
  const dark = colorMode === "dark";
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      className={sidebarLink(false)}
      onClick={() => setColorMode(dark ? "light" : "dark")}
      aria-label={dark ? tr("Switch to light mode") : tr("Switch to dark mode")}
    >
      <Icon {...sidebarIcon} />
      <span>{dark ? tr("Light mode") : tr("Dark mode")}</span>
    </button>
  );
};

export default DarkModeSwitcher;
