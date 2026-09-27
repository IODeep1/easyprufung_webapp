import React, {
    useEffect,
    useRef,
    useState
} from "react";
import {
    NavLink,
    useLocation
} from "react-router-dom";
import { useSelector } from "react-redux";

import type { IUserAccount } from "../../../store/models/user/userAccount.interface";
import type { IStateType } from "../../../store/models/root.interface";
import { getPassedUserExams } from "../../../api/exam/api-helper";

import SidebarLinkGroup from "../../Shared/SidebarLinkGroup";
import DarkModeSwitcher from "../../Shared/DarkModeSwitcher";
import DropdownUser from "./DropdownUser";

type PassedExam =
    Awaited<
        ReturnType<typeof getPassedUserExams>
    >[number];

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: string) => void;
}

const Sidebar = ({
                     sidebarOpen,
                     setSidebarOpen,
                     setTheme
                 }: SidebarProps) => {
    const { pathname } = useLocation();
    const sidebar = useRef<HTMLElement | null>(null);

    const storedSidebarExpanded =
        localStorage.getItem("sidebar-expanded");

    const [sidebarExpanded, setSidebarExpanded] =
        useState(
            storedSidebarExpanded === null
                ? false
                : storedSidebarExpanded === "true"
        );

    const [passedExams, setPassedExams] = useState<
        PassedExam[]
    >([]);

    const [examsLoading, setExamsLoading] =
        useState(false);

    const [examsError, setExamsError] = useState<
        string | null
    >(null);

    const account: IUserAccount = useSelector(
        (state: IStateType) => state.userAccount
    );

    const userId = account.user?.uuid;
    const subscriptionPlan =
        account.subscription?.plan;

    const isPaidSubscription =
        Boolean(account.subscription?.isActive) &&
        subscriptionPlan !== "free" &&
        subscriptionPlan !== "tester";

    useEffect(() => {
        const clickHandler = ({
                                  target
                              }: MouseEvent) => {
            if (!sidebarOpen || !sidebar.current) {
                return;
            }

            if (
                target instanceof Node &&
                sidebar.current.contains(target)
            ) {
                return;
            }

            setSidebarOpen(false);
        };

        document.addEventListener(
            "mousedown",
            clickHandler
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                clickHandler
            );
        };
    }, [sidebarOpen, setSidebarOpen]);

    useEffect(() => {
        const keyHandler = ({
                                key
                            }: KeyboardEvent) => {
            if (
                sidebarOpen &&
                key === "Escape"
            ) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener(
            "keydown",
            keyHandler
        );

        return () => {
            document.removeEventListener(
                "keydown",
                keyHandler
            );
        };
    }, [sidebarOpen, setSidebarOpen]);

    useEffect(() => {
        localStorage.setItem(
            "sidebar-expanded",
            sidebarExpanded.toString()
        );

        document.body.classList.toggle(
            "sidebar-expanded",
            sidebarExpanded
        );

        return () => {
            document.body.classList.remove(
                "sidebar-expanded"
            );
        };
    }, [sidebarExpanded]);

    useEffect(() => {
        let active = true;

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
                    cause instanceof Error
                        ? cause.message
                        : "Prüfungen konnten nicht geladen werden."
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
            className={`absolute left-0 top-0 z-50 flex h-screen w-60 flex-col overflow-y-hidden rounded-xl bg-white bg-clip-border text-gray-700 shadow-xl shadow-gray-900/5 transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:bg-opacity-80 dark:text-gray-200 dark:shadow-gray-600/50 dark:backdrop-blur-lg ${
                sidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full"
            }`}
        >
            <div className="no-scrollbar flex h-full flex-col overflow-y-auto duration-300 ease-linear">
                <nav className="flex h-full flex-col px-4 pb-5 pt-20 lg:mt-2">
                    <div>
                        <h3 className="mb-4 ml-4 text-left text-base font-bold text-gray-900 dark:text-gray-200">
                            Workspace
                        </h3>

                        <ul className="mb-6 flex flex-col gap-1.5">
                            <li>
                                <NavLink
                                    to="/new"
                                    onClick={() =>
                                        setSidebarOpen(false)
                                    }
                                    className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-2 font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                        pathname.includes(
                                            "/new"
                                        )
                                            ? "bg-gray-100 dark:bg-gray-800"
                                            : ""
                                    }`}
                                >
                                    <svg
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M4.857 3A1.857 1.857 0 0 0 3 4.857v4.286C3 10.169 3.831 11 4.857 11h4.286A1.857 1.857 0 0 0 11 9.143V4.857A1.857 1.857 0 0 0 9.143 3H4.857Zm10 0A1.857 1.857 0 0 0 13 4.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 21 9.143V4.857A1.857 1.857 0 0 0 19.143 3h-4.286Zm-10 10A1.857 1.857 0 0 0 3 14.857v4.286C3 20.169 3.831 21 4.857 21h4.286A1.857 1.857 0 0 0 11 19.143v-4.286A1.857 1.857 0 0 0 9.143 13H4.857ZM18 14a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2v-2Z"
                                        />
                                    </svg>

                                    New exam
                                </NavLink>
                            </li>

                            <li>
                                <SidebarLinkGroup
                                    activeCondition={
                                        pathname ===
                                        "/exams" ||
                                        pathname.startsWith(
                                            "/exams/"
                                        )
                                    }
                                >
                                    {(
                                        handleClick,
                                        open
                                    ) => (
                                        <React.Fragment>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        !sidebarExpanded
                                                    ) {
                                                        setSidebarExpanded(
                                                            true
                                                        );
                                                    }

                                                    handleClick();
                                                }}
                                                className={`group relative flex w-full items-center gap-2.5 rounded-xl px-4 py-2 text-left font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                                    pathname ===
                                                    "/exams" ||
                                                    pathname.startsWith(
                                                        "/exams/"
                                                    )
                                                        ? "bg-gray-100 dark:bg-gray-800"
                                                        : ""
                                                }`}
                                            >
                                                <svg
                                                    aria-hidden="true"
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
                                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                                                    <path d="m9 11 2 2 4-4" />
                                                </svg>

                                                <span className="min-w-0 flex-1">
                                                    Exams
                                                </span>

                                                {passedExams.length >
                                                    0 && (
                                                        <span className="rounded-full bg-black px-2 py-0.5 text-xs font-bold text-white dark:bg-white dark:text-black">
                                                        {
                                                            passedExams.length
                                                        }
                                                    </span>
                                                    )}

                                                <svg
                                                    aria-hidden="true"
                                                    className={`ml-1 shrink-0 fill-current transition-transform ${
                                                        open
                                                            ? "rotate-90"
                                                            : ""
                                                    }`}
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M7 5C7 4.44772 7.44772 4 8 4C8.26522 4 8.51957 4.10536 8.70711 4.29289L13.7071 9.29289C14.0976 9.68342 14.0976 10.3166 13.7071 10.7071L8.70711 15.7071C8.31658 16.0976 7.68342 16.0976 7.29289 15.7071C6.90237 15.3166 6.90237 14.6834 7.29289 14.2929L11.5858 10L7.29289 5.70711C7.10536 5.51957 7 5.26522 7 5Z"
                                                    />
                                                </svg>
                                            </button>

                                            <div
                                                className={`overflow-hidden ${
                                                    !open
                                                        ? "hidden"
                                                        : ""
                                                }`}
                                            >
                                                <ul className="no-scrollbar mb-5 mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto pl-4">
                                                    {examsLoading && (
                                                        <li className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                            Prüfungen
                                                            werden
                                                            geladen …
                                                        </li>
                                                    )}

                                                    {!examsLoading &&
                                                        examsError && (
                                                            <li className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                                                                {
                                                                    examsError
                                                                }
                                                            </li>
                                                        )}

                                                    {!examsLoading &&
                                                        !examsError &&
                                                        passedExams.length ===
                                                        0 && (
                                                            <li className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                                Noch
                                                                keine
                                                                bestandenen
                                                                Prüfungen
                                                            </li>
                                                        )}

                                                    {!examsLoading &&
                                                        !examsError &&
                                                        passedExams.map(
                                                            (
                                                                entry
                                                            ) => {
                                                                const {
                                                                    session,
                                                                    result
                                                                } =
                                                                    entry;

                                                                return (
                                                                    <li
                                                                        key={
                                                                            session.sessionId
                                                                        }
                                                                    >
                                                                        <NavLink
                                                                            to={`/exams/${session.sessionId}/review`}
                                                                            state={{
                                                                                session,
                                                                                result
                                                                            }}
                                                                            onClick={() =>
                                                                                setSidebarOpen(
                                                                                    false
                                                                                )
                                                                            }
                                                                            className={({
                                                                                            isActive
                                                                                        }) =>
                                                                                `group flex items-center gap-3 rounded-xl px-3 py-3 duration-300 ease-in-out ${
                                                                                    isActive
                                                                                        ? "bg-gray-200 text-black dark:bg-gray-800 dark:text-white"
                                                                                        : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                                                                                }`
                                                                            }
                                                                        >
                                                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gray-400 bg-white text-xs font-black text-black dark:border-gray-600 dark:bg-gray-900 dark:text-white">
                                                                                {
                                                                                    session.level
                                                                                }
                                                                            </span>

                                                                            <span className="min-w-0 flex-1">
                                                                                <span className="block truncate text-sm font-bold">
                                                                                    {
                                                                                        session.title
                                                                                    }
                                                                                </span>

                                                                                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                                                                    {
                                                                                        session.provider
                                                                                    }
                                                                                    {
                                                                                        " · "
                                                                                    }
                                                                                    {Math.round(
                                                                                        result.percentage
                                                                                    )}
                                                                                    %
                                                                                </span>
                                                                            </span>

                                                                            <svg
                                                                                aria-hidden="true"
                                                                                width="16"
                                                                                height="16"
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                className="shrink-0"
                                                                            >
                                                                                <path d="m9 18 6-6-6-6" />
                                                                            </svg>
                                                                        </NavLink>
                                                                    </li>
                                                                );
                                                            }
                                                        )}
                                                </ul>
                                            </div>
                                        </React.Fragment>
                                    )}
                                </SidebarLinkGroup>
                            </li>
                        </ul>
                    </div>

                    {!isPaidSubscription && (
                        <div>
                            <h3 className="mb-4 ml-4 text-base font-bold text-gray-900 dark:text-gray-200">
                                Subscribe
                            </h3>

                            <ul className="mb-6 flex flex-col gap-1.5">
                                <li>
                                    <NavLink
                                        to="/pricing"
                                        onClick={() =>
                                            setSidebarOpen(
                                                false
                                            )
                                        }
                                        className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-2 font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                            pathname.includes(
                                                "/pricing"
                                            )
                                                ? "bg-gray-100 dark:bg-gray-800"
                                                : ""
                                        }`}
                                    >
                                        <svg
                                            aria-hidden="true"
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
                                            <circle
                                                cx="8"
                                                cy="8"
                                                r="6"
                                            />
                                            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                                            <path d="M7 6h1v4" />
                                            <path d="m16.71 13.88.7.71-2.82 2.82" />
                                        </svg>

                                        Pricing
                                    </NavLink>
                                </li>

                                {subscriptionPlan !==
                                    "tester" && (
                                        <li>
                                            <NavLink
                                                to="/code_redemption"
                                                onClick={() =>
                                                    setSidebarOpen(
                                                        false
                                                    )
                                                }
                                                className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-2 font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                                    pathname.includes(
                                                        "/code_redemption"
                                                    )
                                                        ? "bg-gray-100 dark:bg-gray-800"
                                                        : ""
                                                }`}
                                            >
                                                <svg
                                                    aria-hidden="true"
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
                                                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                                                    <path d="m9 12 2 2 4-4" />
                                                </svg>

                                                Redeem
                                                your code
                                            </NavLink>
                                        </li>
                                    )}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h3 className="mb-4 ml-4 text-base font-bold text-gray-900 dark:text-gray-200">
                            Help
                        </h3>

                        <ul className="mb-6 flex flex-col gap-1.5">
                            <li>
                                <NavLink
                                    to="/contact"
                                    onClick={() =>
                                        setSidebarOpen(false)
                                    }
                                    className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-2 font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                        pathname.includes(
                                            "/contact"
                                        )
                                            ? "bg-gray-100 dark:bg-gray-800"
                                            : ""
                                    }`}
                                >
                                    <svg
                                        aria-hidden="true"
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
                                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                        <path d="M8 12h.01" />
                                        <path d="M12 12h.01" />
                                        <path d="M16 12h.01" />
                                    </svg>

                                    Contact us
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                    <div className="flex mt-auto items-center justify-between">
                        <div>
                            <DarkModeSwitcher setTheme={setTheme} />
                        </div>
                        <DropdownUser />
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;