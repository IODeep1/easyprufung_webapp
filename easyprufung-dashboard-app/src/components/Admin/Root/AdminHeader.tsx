import {Link} from 'react-router-dom';
import React from "react";
import Logo from "../../../images/logo.png";
import DropdownAdmin from "./DropdownAdmin";
import DarkModeSwitcher from "../../Shared/DarkModeSwitcher";

const AdminHeader = (props: {
    sidebarOpen: string | boolean | undefined;
    setSidebarOpen: (arg0: boolean) => void;
    setTheme: (arg0: string) => void;
}) => {
    return (
        <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
            <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-2 md:px-6 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    {/* <!-- Hamburger Toggle BTN --> */}
                    <button
                        aria-controls="sidebar"
                        onClick={(e) => {
                            e.stopPropagation();
                            props.setSidebarOpen(!props.sidebarOpen);
                        }}
                        className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
                    >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                        !props.sidebarOpen && '!w-full delay-300'
                    }`}
                ></span>
                <span
                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                        !props.sidebarOpen && 'delay-400 !w-full'
                    }`}
                ></span>
                <span
                    className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                        !props.sidebarOpen && '!w-full delay-500'
                    }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                    className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                        !props.sidebarOpen && '!h-0 !delay-[0]'
                    }`}
                ></span>
                <span
                    className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                        !props.sidebarOpen && '!h-0 !delay-200'
                    }`}
                ></span>
              </span>
            </span>
                    </button>
                    {/* <!-- Hamburger Toggle BTN --> */}

                    <Link to="/crm_private_access" className="flex items-center ml- text-2xl font-semibold text-gray-900 dark:text-white">
                        <div className="mr-2">
                            <img alt="logo" width="44" height="44" src={Logo}/>
                        </div>
                        <span className="text-black dark:text-white">EasyPrüfung</span>
                    </Link>
                </div>

                <div className="hidden sm:block">

                </div>

                <div className="flex items-center gap-3 2xsm:gap-7">
                    <ul className="flex items-center gap-2 2xsm:gap-4">
                        {/* <!-- Dark Mode Toggler --> */}
                        <DarkModeSwitcher setTheme={props.setTheme} />
                        {/* <!-- Dark Mode Toggler --> */}
                    </ul>

                    {/* <!-- User Area --> */}
                    <DropdownAdmin />
                    {/* <!-- User Area --> */}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
