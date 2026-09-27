import React, {useEffect, useRef, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {IUserAccount} from "../../../store/models/user/userAccount.interface";
import {IProjectState, IStateType} from "../../../store/models/root.interface";
import SidebarLinkGroup from "../../Shared/SidebarLinkGroup";
import DarkModeSwitcher from "../../Shared/DarkModeSwitcher";
import DropdownUser from "./DropdownUser";
import {useSelector} from "react-redux";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
    setTheme: (arg0: string) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, setTheme }: SidebarProps) => {
    const location = useLocation();
    const { pathname } = location;

    const trigger = useRef<any>(null);
    const sidebar = useRef<any>(null);

    const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
    const [sidebarExpanded, setSidebarExpanded] = useState(
        storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
    );

    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!sidebar.current || !trigger.current) return;
            if (
                !sidebarOpen ||
                sidebar.current.contains(target) ||
                trigger.current.contains(target)
            )
                return;
            setSidebarOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }: KeyboardEvent) => {
            if (!sidebarOpen || keyCode !== 27) return;
            setSidebarOpen(false);
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
    });

    useEffect(() => {
        localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
        if (sidebarExpanded) {
            document.querySelector('body')?.classList.add('sidebar-expanded');
        } else {
            document.querySelector('body')?.classList.remove('sidebar-expanded');
        }
    }, [sidebarExpanded]);

    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    const isSubscriptionActive = (account.subscription?.isActive);
    let isPayedSubscription = isSubscriptionActive;
    if(account.subscription !== undefined && account.subscription !== null && ( account.subscription.plan === "free" ||  account.subscription.plan === "tester"))
    {
        isPayedSubscription = false;
    }

    return (
        <aside
            ref={sidebar}
            className={`absolute left-0 top-0 z-50 flex h-screen w-60 flex-col overflow-y-hidden rounded-xl bg-white bg-clip-border text-gray-700 shadow-xl shadow-gray-900/5 transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:bg-opacity-80 dark:backdrop-blur-lg dark:text-gray-200 dark:shadow-gray-600/50  ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="no-scrollbar  flex flex-col overflow-y-auto duration-300 ease-linear">
                {/* <!-- Sidebar Menu --> */}
                <nav className="pt-20 pb-5 px-4 flex flex-col h-screen lg:mt-2">
                    {/* <!-- Menu Group --> */}
                    <div>
                        <h3 className="text-left mb-4 ml-4 text-md font-bold text-gray-900 dark:text-gray-200">
                            Workspace
                        </h3>
                        <ul className="mb-6 flex flex-col gap-1.5">
                            {/* <!-- New Project --> */}
                            <li>
                                <NavLink
                                    to="/new"
                                    className={`group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                        pathname.includes('/new') ? 'bg-gray-100 dark:bg-gray-800' : ''
                                    }`}
                                >
                                    <svg  aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                         viewBox="0 0 24 24">
                                        <path fillRule="evenodd"
                                              d="M4.857 3A1.857 1.857 0 0 0 3 4.857v4.286C3 10.169 3.831 11 4.857 11h4.286A1.857 1.857 0 0 0 11 9.143V4.857A1.857 1.857 0 0 0 9.143 3H4.857Zm10 0A1.857 1.857 0 0 0 13 4.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 21 9.143V4.857A1.857 1.857 0 0 0 19.143 3h-4.286Zm-10 10A1.857 1.857 0 0 0 3 14.857v4.286C3 20.169 3.831 21 4.857 21h4.286A1.857 1.857 0 0 0 11 19.143v-4.286A1.857 1.857 0 0 0 9.143 13H4.857ZM18 14a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2v-2Z"
                                              clip-rule="evenodd"/>
                                    </svg>

                                    New exam
                                </NavLink>
                            </li>
                            {/* <!-- Exams --> */}
                            <SidebarLinkGroup
                                activeCondition={pathname === '/projects' || pathname.includes('projects/')}
                            >
                                {(handleClick, open) => {
                                    return (
                                        <React.Fragment>
                                            <NavLink
                                                to="#"
                                                className={`group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                                    (pathname === '/projects' || pathname.includes('projects/')) &&
                                                    'bg-gray-100 dark:bg-gray-800'
                                                }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    sidebarExpanded
                                                        ? handleClick()
                                                        : setSidebarExpanded(true);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path
                                                        d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                                                    <circle cx="12" cy="13" r="1"/>
                                                </svg>

                                                Exams
                                                <svg
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current transition-transform ${!open && 'rotate-90'}`}
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M7 5C7 4.44772 7.44772 4 8 4C8.26522 4 8.51957 4.10536 8.70711 4.29289L13.7071 9.29289C14.0976 9.68342 14.0976 10.3166 13.7071 10.7071L8.70711 15.7071C8.31658 16.0976 7.68342 16.0976 7.29289 15.7071C6.90237 15.3166 6.90237 14.6834 7.29289 14.2929L11.5858 10L7.29289 5.70711C7.10536 5.51957 7 5.26522 7 5Z"
                                                        fill=""
                                                    />
                                                </svg>
                                            </NavLink>
                                            {/* <!-- Dropdown Menu Start --> */}
                                            <div
                                                className={`translate transform overflow-hidden ${
                                                    open && 'hidden'
                                                }`}
                                            >
                                                <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                                                    {(projectState && projectState.projects && projectState.projects.filter(item => item.source !== "external").map((item, index) => (
                                                        <li>
                                                            <NavLink
                                                                to={`/projects/${item.uuid}`}
                                                                className={({ isActive }) =>
                                                                    'group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700' +
                                                                    (isActive && ' bg-gray-200 dark:bg-gray-800')
                                                                }
                                                            >
                                                                <div className="flex flex-row" key="1">
                                                                    {item.name? item.name : `Project [${index+1}]`}

                                                                </div>
                                                            </NavLink>
                                                        </li>
                                                    )))}
                                                </ul>
                                            </div>
                                            {/* <!-- Dropdown Menu End --> */}
                                        </React.Fragment>
                                    );
                                }}
                            </SidebarLinkGroup>
                            {/* <!-- End Exams --> */}

                        </ul>
                    </div>

                    {!isPayedSubscription && <div>
                        <h3 className="mb-4 ml-4 text-md font-bold text-gray-900 dark:text-gray-200">
                            Subscribe
                        </h3>
                        <ul className="mb-6 flex flex-col gap-1.5">

                            {/* <!-- Pricing --> */}
                            <li>
                                <NavLink
                                    to="/pricing"
                                    className={`group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                        pathname.includes('/pricing') &&
                                        'bg-gray-100 dark:bg-gray-800'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <circle cx="8" cy="8" r="6"/>
                                        <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
                                        <path d="M7 6h1v4"/>
                                        <path d="m16.71 13.88.7.71-2.82 2.82"/>
                                    </svg>

                                    Pricing
                                </NavLink>
                            </li>
                            {/* <!-- Pricing --> */}

                            {/* <!-- Redemption Code --> */}
                            { (account.subscription?.plan !== "tester" ) && <li>
                                <NavLink
                                    to="/code_redemption"
                                    className={`group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                        pathname.includes('/code_redemption') &&
                                        'bg-gray-100 dark:bg-gray-800'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path
                                            d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                                        <path d="m9 12 2 2 4-4"/>
                                    </svg>

                                    Redeem your code
                                </NavLink>
                            </li>}
                            {/* <!-- Redemption Cod --> */}

                        </ul>
                    </div>}
                    <div>
                        <h3 className="mb-4 ml-4 text-md font-bold text-gray-900 dark:text-gray-200">
                            Help
                        </h3>
                        <ul className="mb-6 flex flex-col gap-1.5">
                            {/* <!-- Support --> */}
                            <li>
                                <NavLink
                                    to="https://discord.gg/Gdm5TJ789H"
                                    target="_blank"
                                    className={`group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700`}
                                >
                                    <svg aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                         viewBox="0 0 24 24">
                                        <path
                                            d="M18.942 5.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.586 11.586 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3 17.392 17.392 0 0 0-2.868 11.662 15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.638 10.638 0 0 1-1.706-.83c.143-.106.283-.217.418-.331a11.664 11.664 0 0 0 10.118 0c.137.114.277.225.418.331-.544.328-1.116.606-1.71.832a12.58 12.58 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM8.678 14.813a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.929 1.929 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z"/>
                                    </svg>
                                    Support
                                </NavLink>
                            </li>
                            {/* <!-- Support --> */}

                            {/* <!-- Contact us--> */}
                            <li>
                                <NavLink
                                    to="/contact"
                                    className={`group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                                        pathname.includes('/contact') &&
                                        'bg-gray-100 dark:bg-gray-800'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                                        <path d="M8 12h.01"/>
                                        <path d="M12 12h.01"/>
                                        <path d="M16 12h.01"/>
                                    </svg>

                                    Contact us
                                </NavLink>
                            </li>
                            {/* <!-- Contact us--> */}
                        </ul>
                    </div>
                    <div className="flex mt-auto items-center justify-between">
                        <div>
                            <DarkModeSwitcher setTheme={setTheme} />
                        </div>
                        <DropdownUser />
                    </div>
                </nav>
                {/* <!-- Sidebar Menu --> */}

            </div>
        </aside>
    );
};

export default Sidebar;
