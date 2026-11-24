import { tr } from "../../../localization/feature-i18n";
import {
  sidebarTitle,
  sidebarList,
  sidebarLink,
  sidebarIcon,
} from "../../Shared/sidebar-style";
import {
  Users,
  FilePlus2,
  BookOpen,
  Tag,
  Ticket,
  Mail,
  ChevronRight,
  List,
} from "lucide-react";
import { useTeacherRole } from "../../Teacher/TeacherRole";
import TeacherNavigation from "../../Teacher/TeacherNavigation";
import React, { Dispatch, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import type { IUserAccount } from "../../../store/models/user/userAccount.interface";
import type { IStateType } from "../../../store/models/root.interface";
import { getPassedUserExams } from "../../../api/exam/api-helper";

import SidebarLinkGroup from "../../Shared/SidebarLinkGroup";
import { useTranslation } from "react-i18next";
import DarkModeSwitcher from "../../Shared/DarkModeSwitcher";
import DropdownUser from "./DropdownUser";
import { requestGetUser } from "../../../api/user/api-helper.ts";
import { updateUser } from "../../../store/actions/user/userAccount.actions.ts";

type PassedExam = Awaited<ReturnType<typeof getPassedUserExams>>[number];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: string) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { pathname } = useLocation();
  const teacherRole = useTeacherRole();
  const { i18n } = useTranslation();
  const isRtl = (i18n.resolvedLanguage || i18n.language).startsWith("ar");
  const sidebar = useRef<HTMLElement | null>(null);
  const dispatch: Dispatch<any> = useDispatch();

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");

  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  const [passedExams, setPassedExams] = useState<PassedExam[]>([]);

  const [examsLoading, setExamsLoading] = useState(false);

  const [examsError, setExamsError] = useState<string | null>(null);

  const account: IUserAccount = useSelector(
    (state: IStateType) => state.userAccount
  );

  const userId = account.user?.uuid;
  const subscription = account.user?.subscription;
  const subscriptionPlan = subscription?.plan?.toLowerCase?.() || "free";

  const isTesterSubscription = subscriptionPlan === "tester";

  const isB1Subscription = subscriptionPlan === "b1";

  const isUnlimitedSubscription = subscriptionPlan === "b1_unlimited";

  const endDate = subscription?.endDate ? new Date(subscription.endDate) : null;

  const hasValidEndDate = !!endDate && !Number.isNaN(endDate.getTime());

  const isExpiredSubscription =
    !isTesterSubscription &&
    hasValidEndDate &&
    endDate!.getTime() <= Date.now();

  const isPaidSubscription =
    isTesterSubscription ||
    ((isB1Subscription || isUnlimitedSubscription) &&
      !isExpiredSubscription &&
      subscription?.isActive !== false &&
      subscription?.status?.toLowerCase?.() !== "expired");

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (
        target instanceof Element &&
        target.closest('[data-sidebar-toggle="true"]')
      )
        return;
      if (!sidebarOpen || !sidebar.current) {
        return;
      }

      // DropdownUser renders its menu in a portal under document.body.
      // Treat that menu as part of the sidebar so its buttons receive
      // their click events before the sidebar is closed/unmounted.
      if (
        target instanceof Node &&
        (sidebar.current.contains(target) ||
          (target instanceof Element &&
            target.closest('[data-sidebar-user-dropdown="true"]')) ||
          (target.parentElement &&
            target.parentElement.closest(
              '[data-sidebar-user-dropdown="true"]'
            )))
      ) {
        return;
      }

      setSidebarOpen(false);
    };

    document.addEventListener("mousedown", clickHandler);

    return () => {
      document.removeEventListener("mousedown", clickHandler);
    };
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (sidebarOpen && key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", keyHandler);

    return () => {
      document.removeEventListener("keydown", keyHandler);
    };
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());

    document.body.classList.toggle("sidebar-expanded", sidebarExpanded);

    return () => {
      document.body.classList.remove("sidebar-expanded");
    };
  }, [sidebarExpanded]);

  useEffect(() => {
    let active = true;

    const processApi = async () => {
      const user = await requestGetUser(dispatch);
      if (user !== null && user !== undefined) {
        dispatch(updateUser(user));
      }
    };
    processApi();

    if (!userId?.trim()) {
      setPassedExams([]);
      setExamsLoading(false);
      setExamsError(null);
      return;
    }

    setExamsLoading(true);
    setExamsError(null);

    getPassedUserExams(userId.trim())
      .then((entries) => {
        if (active) {
          setPassedExams(entries);
        }
      })
      .catch((cause) => {
        if (!active) {
          return;
        }

        setPassedExams([]);

        setExamsError(
          cause instanceof Error ? cause.message : tr("Could not load exams.")
        );
      })
      .finally(() => {
        if (active) {
          setExamsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <aside
      ref={sidebar}
      dir={isRtl ? "rtl" : "ltr"}
      className={`absolute ${
        isRtl ? "right-0" : "left-0"
      } top-0 z-50 flex h-screen w-60 flex-col overflow-y-hidden rounded-xl bg-white bg-clip-border text-gray-700 shadow-xl shadow-gray-900/5 transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:bg-opacity-80 dark:text-gray-200 dark:shadow-gray-600/50 dark:backdrop-blur-lg ${
        sidebarOpen
          ? "translate-x-0"
          : isRtl
          ? "translate-x-full"
          : "-translate-x-full"
      }`}
    >
      <div className="flex h-full min-h-0 flex-col">
        <nav
          aria-label={tr("Main navigation")}
          className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2 pt-20 lg:mt-2"
        >
          {(teacherRole.isTeacher || teacherRole.isPartner) && (
            <>
              {teacherRole.isPartner && (
                <section
                  data-no-translate
                  lang="en"
                  dir="ltr"
                  className="mb-6"
                  aria-label="Partner workspace"
                >
                  <h3 className={sidebarTitle}>Partner workspace</h3>
                  <ul className={sidebarList}>
                    <li>
                      <NavLink
                        to="/partners"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => sidebarLink(isActive)}
                      >
                        <Users {...sidebarIcon} />
                        {teacherRole.isPartner
                          ? "Partner Mode"
                          : "Become a partner"}
                      </NavLink>
                    </li>
                  </ul>
                </section>
              )}
              <TeacherNavigation onNavigate={() => setSidebarOpen(false)} />
              {!teacherRole.isPartner && (
                <section
                  data-no-translate
                  lang="en"
                  dir="ltr"
                  className="mb-6"
                  aria-label="Partner workspace"
                >
                  <h3 className={sidebarTitle}>Partner workspace</h3>
                  <ul className={sidebarList}>
                    <li>
                      <NavLink
                        to="/partners"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => sidebarLink(isActive)}
                      >
                        <Users {...sidebarIcon} />
                        {teacherRole.isPartner
                          ? "Partner Mode"
                          : "Become a partner"}
                      </NavLink>
                    </li>
                  </ul>
                </section>
              )}
            </>
          )}

          <section className="mb-6" aria-label={tr("Personal practice")}>
            <h3 className={sidebarTitle}>{tr("Personal practice")}</h3>
            <ul className={sidebarList}>
              <li>
                <NavLink
                  to="/new"
                  onClick={() => setSidebarOpen(false)}
                  className={() =>
                    sidebarLink(pathname === "/" || pathname === "/new")
                  }
                >
                  <FilePlus2 {...sidebarIcon} />
                  {tr("New exam")}
                </NavLink>
              </li>
              {!teacherRole.isTeacher && (
                <li>
                  <NavLink
                    to="/my-classes"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => sidebarLink(isActive)}
                  >
                    <Users {...sidebarIcon} />
                    {tr("My classes")}
                  </NavLink>
                </li>
              )}
              <SidebarLinkGroup
                activeCondition={
                  pathname === "/exams" || pathname.startsWith("/exams/")
                }
              >
                {(handleClick, open) => (
                  <>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls="sidebar-exam-history"
                      onClick={() => {
                        if (!sidebarExpanded) setSidebarExpanded(true);
                        handleClick();
                      }}
                      className={sidebarLink(
                        pathname === "/exams" || pathname.startsWith("/exams/")
                      )}
                    >
                      <BookOpen {...sidebarIcon} />
                      <span className="min-w-0 flex-1">
                        {tr("Exam history")}
                      </span>
                      {passedExams.length > 0 && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          {passedExams.length}
                        </span>
                      )}
                      <ChevronRight
                        size={17}
                        aria-hidden="true"
                        className={`shrink-0 transition-transform ${
                          open ? "rotate-90" : isRtl ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div id="sidebar-exam-history" hidden={!open}>
                      <ul
                        className={`${sidebarList} ms-4 mt-2 border-s border-gray-200 ps-3 dark:border-gray-700`}
                      >
                        <li>
                          <NavLink
                            to="/exams"
                            end
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => sidebarLink(isActive)}
                          >
                            <List {...sidebarIcon} />
                            {tr("All exams")}
                          </NavLink>
                        </li>
                        {examsLoading && (
                          <li
                            role="status"
                            className="px-4 py-2 text-xs text-gray-500"
                          >
                            {tr("Loading exams…")}
                          </li>
                        )}
                        {!examsLoading && examsError && (
                          <li
                            role="alert"
                            className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300"
                          >
                            {examsError}
                          </li>
                        )}
                        {!examsLoading &&
                          !examsError &&
                          !passedExams.length && (
                            <li className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                              {tr("No passed exams yet.")}
                            </li>
                          )}
                      </ul>
                    </div>
                  </>
                )}
              </SidebarLinkGroup>
            </ul>
          </section>
          <section className="mb-6" aria-label={tr("Pricing")}>
            <h3 className={sidebarTitle}>{tr("Pricing")}</h3>
            <ul className={sidebarList}>
              <li>
                <NavLink
                  to="/pricing"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => sidebarLink(isActive)}
                >
                  <Tag {...sidebarIcon} />
                  {tr("Pricing")}
                </NavLink>
              </li>
              {!isPaidSubscription && subscriptionPlan !== "tester" && (
                <li>
                  <NavLink
                    to="/code_redemption"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => sidebarLink(isActive)}
                  >
                    <Ticket {...sidebarIcon} />
                    {tr("Redeem your code")}
                  </NavLink>
                </li>
              )}
            </ul>
          </section>
          <section className="mb-6" aria-label={tr("Help")}>
            <h3 className={sidebarTitle}>{tr("Help")}</h3>
            <ul className={sidebarList}>
              <li>
                <NavLink
                  to="/contact"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => sidebarLink(isActive)}
                >
                  <Mail {...sidebarIcon} />
                  {tr("Contact us")}
                </NavLink>
              </li>
            </ul>
          </section>
        </nav>
        <div
          aria-label={tr("Appearance and account")}
          className="mx-4 flex shrink-0 flex-col gap-1.5 border-t border-gray-100 py-4 dark:border-gray-800"
        >
          <DarkModeSwitcher />
          <DropdownUser sidebarOpen={sidebarOpen} />
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
