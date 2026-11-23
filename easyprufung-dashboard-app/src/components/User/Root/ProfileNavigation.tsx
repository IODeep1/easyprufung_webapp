import { useId, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { BookOpen, ChevronDown, FilePlus2, List, Mail, Tag, Ticket, Users, type LucideIcon } from "lucide-react";
import { tr, useFeatureLocale } from "../../../localization/feature-i18n";
import type { IStateType } from "../../../store/models/root.interface";
import { teacherLinks } from "../../Teacher/TeacherNavigation";
import { useTeacherRole } from "../../Teacher/TeacherRole";
import DarkModeSwitcher from "../../Shared/DarkModeSwitcher";

type LinkItem = { to: string; label: string; icon: LucideIcon; end?: boolean };
type Group = { title: string; links: LinkItem[]; practice?: boolean };

export default function ProfileNavigation({ onNavigate }: { onNavigate: () => void }) {
    const { locale, dir } = useFeatureLocale();
    const role = useTeacherRole();
    const { pathname } = useLocation();
    const subscription = useSelector((state: IStateType) => state.userAccount.user?.subscription);
    const plan = subscription?.plan?.toLowerCase?.() || "free";
    const end = subscription?.endDate ? new Date(subscription.endDate).getTime() : NaN;
    // Match the sidebar's plan visibility, including tester and expired access.
    const paid = plan === "tester" || ((plan === "b1" || plan === "b1_unlimited") &&
        (!Number.isFinite(end) || end > Date.now()) && subscription?.isActive !== false &&
        subscription?.status?.toLowerCase?.() !== "expired");
    const [historyOpen, setHistoryOpen] = useState(pathname === "/exams" || pathname.startsWith("/exams/"));
    const historyId = useId();
    const groups: Group[] = [];
    if (role.isTeacher) groups.push({ title: "Teacher workspace", links: teacherLinks.map(link => ({ ...link, end: link.to === "/teacher" })) });
    groups.push({ title: role.isTeacher ? "Personal practice" : "Practice", practice: true,
        links: [{ to: "/new", label: "New exam", icon: FilePlus2 }] });
    if (role.status === "NOT_REGISTERED") groups.push({ title: "Learning together", links: [{ to: "/my-classes", label: "My classes", icon: Users }] });
    if (!paid) groups.push({ title: "Plans", links: [
        { to: "/pricing", label: "Pricing", icon: Tag },
        ...(plan !== "tester" ? [{ to: "/code_redemption", label: "Redeem your code", icon: Ticket }] : [])
    ] });
    groups.push({ title: "Help", links: [{ to: "/contact", label: "Contact us", icon: Mail }] });
    const itemClass = (active: boolean) => `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-700 ${active ? "bg-gray-100 text-gray-950 dark:bg-gray-700 dark:text-white" : "text-gray-700 dark:text-gray-200"}`;
    const headingClass = "mb-1 px-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400";
    const historyActive = pathname === "/exams" || pathname.startsWith("/exams/");
    return <nav data-no-translate lang={locale} dir={dir} aria-label={tr("Main navigation")} className="space-y-3 px-2 py-3">
        {groups.map(group => <section key={group.title} aria-label={tr(group.title)}>
            <h3 className={headingClass}>{tr(group.title)}</h3>
            <ul className="space-y-0.5">
                {group.links.map(({ to, label, icon: Icon, end }) => <li key={to}>
                    <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => itemClass(to === "/new" ? pathname === "/" || pathname === "/new" : isActive)}>
                        <Icon size={20} strokeWidth={2} aria-hidden="true" className="shrink-0" />{tr(label)}
                    </NavLink>
                </li>)}
                {group.practice && <li>
                    <button type="button" aria-expanded={historyOpen} aria-controls={historyId} className={itemClass(historyActive)} onClick={() => setHistoryOpen(open => !open)}>
                        <BookOpen size={20} aria-hidden="true" className="shrink-0" />
                        <span className="flex-1">{tr("Exam history")}</span>
                        <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${historyOpen ? "rotate-180" : ""}`} />
                    </button>
                    {historyOpen && <ul id={historyId} className="ms-5 mt-1 border-s border-gray-200 ps-2 dark:border-gray-700"><li>
                        <NavLink to="/exams" onClick={onNavigate} className={({ isActive }) => itemClass(isActive)}>
                            <List size={20} aria-hidden="true" />{tr("All exams")}
                        </NavLink>
                    </li></ul>}
                </li>}
            </ul>
        </section>)}
        <section aria-label={tr("Appearance and account")} className="border-t border-gray-100 pt-3 dark:border-gray-700">
            <h3 className={headingClass}>{tr("Appearance and account")}</h3>
            <DarkModeSwitcher compact />
        </section>
    </nav>;
}
