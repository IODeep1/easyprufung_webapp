import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useColorMode";
import { sidebarIcon, sidebarLink } from "./sidebar-style";

const DarkModeSwitcher = () => {
  const { colorMode, setColorMode } = useTheme();
  const dark = colorMode === "dark";
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      className={sidebarLink(false)}
      onClick={() => setColorMode(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon {...sidebarIcon} />
      <span>{dark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
};

export default DarkModeSwitcher;
