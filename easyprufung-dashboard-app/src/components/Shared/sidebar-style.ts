/** Shared sidebar typography and states, based on the Personal practice group. */
export const sidebarTitle =
  "mb-4 px-4 text-start text-base font-bold text-gray-900 dark:text-gray-200";
export const sidebarList = "flex flex-col gap-1.5";
export const sidebarLink = (active: boolean) =>
  `group relative flex w-full items-center gap-2.5 rounded-xl px-4 py-2 text-start text-base font-normal text-gray-700 transition-colors duration-200 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-700 ${
    active ? "bg-gray-100 dark:bg-gray-800" : ""
  }`;
export const sidebarIcon = {
  size: 24,
  strokeWidth: 2,
  "aria-hidden": true as const,
  className: "shrink-0",
};
