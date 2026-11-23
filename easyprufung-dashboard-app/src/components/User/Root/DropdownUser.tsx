import { tr } from "../../../localization/feature-i18n";
import React, {
  useEffect,
  useRef,
  useState,
  Dispatch,
  useLayoutEffect,
  useId,
} from "react";
import { createPortal } from "react-dom";
import { sidebarLink } from "../../Shared/sidebar-style";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileNavigation from "./ProfileNavigation";
import { useDispatch, useSelector } from "react-redux";
import { IStateType } from "../../../store/models/root.interface";
import { logout } from "../../../store/actions/user/userAccount.actions";

interface DropdownUserProps {
  sidebarOpen?: boolean;
  variant?: "sidebar" | "header";
}

const DropdownUser = ({ sidebarOpen = true, variant = "sidebar" }: DropdownUserProps) => {
  const inHeader = variant === "header";

  const dispatch: Dispatch<any> = useDispatch();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const isRtl = (i18n.resolvedLanguage || i18n.language).startsWith("ar");
  const userFirstName: string = useSelector(
    (state: IStateType) => state.userAccount.user?.firstname || ""
  );
  const userLastName: string = useSelector(
    (state: IStateType) => state.userAccount.user?.lastname || ""
  );
  let twoChars = "DF";
  if (userFirstName) twoChars = userFirstName.charAt(0);
  if (userLastName) twoChars = twoChars + userLastName.charAt(0);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuId = useId();
  const { pathname } = useLocation();
  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  // The menu is portaled to document.body and would otherwise remain visible
  // after the sidebar is translated off-screen.
  useEffect(() => {
    if (!sidebarOpen) setDropdownOpen(false);
  }, [sidebarOpen]);

  const trigger = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const updateMenuPosition = () => {
    if (!trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const menuWidth = Math.min(inHeader ? 320 : 208, window.innerWidth - 16);
    const menuHeight = dropdown.current?.scrollHeight || 112;
    const margin = 8;
    const left = Math.max(
      margin,
      Math.min(
        inHeader
          ? (isRtl ? rect.left : rect.right - menuWidth)
          : (isRtl ? rect.right - menuWidth : rect.left),
        window.innerWidth - menuWidth - margin
      )
    );
    const below = rect.bottom + margin;
    const above = rect.top - menuHeight - margin;
    const top = inHeader
      ? (below + 120 <= window.innerHeight - margin ? below : margin)
      : (above >= margin ? above : below);
    setMenuPosition({ top: Math.max(margin, top), left });
  };

  useLayoutEffect(() => {
    if (!dropdownOpen) return;
    updateMenuPosition();
    if (inHeader) dropdown.current?.querySelector<HTMLElement>("a[href], button:not([disabled])")?.focus();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [dropdownOpen, isRtl, inHeader]);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current || !(target instanceof Node)) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current?.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler, true);
    return () => document.removeEventListener("click", clickHandler, true);
  });

  // Keep the popup usable with keyboard navigation and return focus on Escape.
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (!dropdownOpen) return;
      if (event.key === "Escape" || event.keyCode === 27) {
        event.preventDefault();
        setDropdownOpen(false);
        trigger.current?.focus();
        return;
      }
      if (!inHeader || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      if (!(event.target instanceof Node) || (!dropdown.current?.contains(event.target) && !trigger.current?.contains(event.target))) return;
      const items = Array.from(dropdown.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") || []);
      if (!items.length) return;
      event.preventDefault();
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
        : event.key === "ArrowUp" ? (current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length) : (current + 1) % items.length;
      items[next].focus();
    };
    const focusHandler = (event: FocusEvent) => {
      if (dropdownOpen && event.target instanceof Node && !dropdown.current?.contains(event.target) && !trigger.current?.contains(event.target)) setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("focusin", focusHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("focusin", focusHandler);
    };
  }, [dropdownOpen, inHeader]);

  return (
    <div className={`relative flex min-w-0 flex-col ${inHeader ? "w-auto" : "w-full"}`}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={dropdownOpen}
        aria-haspopup={inHeader ? "dialog" : "menu"}
        aria-controls={dropdownOpen ? menuId : undefined}
        aria-label={String(t("dropdown_user_account_menu"))}
        onClick={() => setDropdownOpen((open) => !open)}
        className={inHeader
          ? `inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-start text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-800 ${dropdownOpen ? "bg-gray-100 dark:bg-gray-800" : ""}`
          : sidebarLink(dropdownOpen)}
      >
        <span className={`flex shrink-0 items-center justify-center rounded-full bg-gray-900 dark:bg-gray-600 ${inHeader ? "h-8 w-8" : "h-6 w-6"}`}>
          <p className="text-xs font-semibold text-white">
            {twoChars.toUpperCase()}
          </p>
        </span>
        <span className={inHeader ? "hidden max-w-[10rem] truncate sm:block" : "min-w-0 flex-1 truncate"}>
          {[userFirstName, userLastName].filter(Boolean).join(" ") ||
            tr("My account")}
        </span>

        <svg
          aria-hidden="true"
          className={`shrink-0 fill-current transition-transform duration-300 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
          />
        </svg>
      </button>

      {/* Portal avoids clipping by the scrollable sidebar, especially in RTL. */}
      {dropdownOpen &&
        createPortal(
          <div
            ref={dropdown}
            id={menuId}
            role={inHeader ? "dialog" : "menu"}
            aria-label={String(t("dropdown_user_account_menu"))}
            data-sidebar-user-dropdown={inHeader ? undefined : "true"}
            data-header-user-dropdown={inHeader ? "true" : undefined}
            dir={isRtl ? "rtl" : "ltr"}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: inHeader ? 320 : 208,
              maxHeight: `calc(100dvh - ${menuPosition.top + 8}px)`,
              overflowY: "auto",
              overscrollBehavior: "contain",
              maxWidth: "calc(100vw - 16px)",
              zIndex: 9999,
            }}
            className="flex flex-col rounded-md border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            {inHeader && <>
              <ProfileNavigation onNavigate={() => setDropdownOpen(false)} />
              <h3 className="border-t border-gray-100 px-5 pb-1 pt-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">{tr("My account")}</h3>
            </>}
            <button
              type="button"
              role={inHeader ? undefined : "menuitem"}
              onClick={() => {
                setDropdownOpen(false);
                navigate("/settings");
              }}
              className="flex w-full items-center gap-3 rounded-md p-3 text-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {t("dropdown_user_settings")}
            </button>
            <button
              type="button"
              role={inHeader ? undefined : "menuitem"}
              onClick={() => {
                setDropdownOpen(false);
                dispatch(logout());
              }}
              className="flex w-full items-center gap-3 rounded-md p-3 text-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              {t("dropdown_user_logout")}
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};

export default DropdownUser;
