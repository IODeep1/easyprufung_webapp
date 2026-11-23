import { tr, useFeatureLocale } from "../../localization/feature-i18n";
import {
  sidebarTitle,
  sidebarList,
  sidebarLink,
  sidebarIcon,
} from "../Shared/sidebar-style";
import React from "react";
import { useTeacherRole } from "./TeacherRole";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Ticket, Receipt } from "lucide-react";
export const teacherLinks = [
  { to: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { to: "/teacher/classes", label: "Classes", icon: Users },
  { to: "/teacher/seats", label: "Exam seats", icon: Ticket },
  { to: "/teacher/billing", label: "Billing", icon: Receipt },
];
export default function TeacherNavigation({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const { locale, dir } = useFeatureLocale();

  const role = useTeacherRole();
  if (!role.isTeacher) return null;
  return (
    <section
      data-no-translate
      lang={locale}
      dir={dir}
      className="mb-6"
      aria-label={tr("Teacher workspace")}
    >
      <h3 className={sidebarTitle}>{tr("Teacher workspace")}</h3>
      <ul className={sidebarList}>
        {teacherLinks.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              end={to === "/teacher"}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) => sidebarLink(isActive)}
            >
              <Icon {...sidebarIcon} />
              {tr(label)}
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StudentClassesNavigation({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const { locale, dir } = useFeatureLocale();

  const role = useTeacherRole();
  if (role.status !== "NOT_REGISTERED") return null;
  return (
    <section data-no-translate lang={locale} dir={dir} className="mb-6" aria-label={tr("Learning together")}>
      <h3 className={sidebarTitle}>{tr("Learning together")}</h3>
      <ul className={sidebarList}>
      <li>
      <NavLink
        to="/my-classes"
        onClick={onNavigate}
        className={({ isActive }) => sidebarLink(isActive)}
      >
        <Users {...sidebarIcon} />
        {tr("My classes")}
      </NavLink>
      </li>
      </ul>
    </section>
  );
}
