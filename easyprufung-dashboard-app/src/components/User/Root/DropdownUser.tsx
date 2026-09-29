import React, { useEffect, useRef, useState,Dispatch } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {IStateType} from "../../../store/models/root.interface";
import {logout} from "../../../store/actions/user/userAccount.actions";
import {IUserAccount} from "../../../store/models/user/userAccount.interface";

const DropdownUser = () => {
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const userFirstName: string = useSelector((state: IStateType) => state.userAccount.user?.firstname);
    const userLastName: string = useSelector((state: IStateType) => state.userAccount.user?.lastname);
    let twoChars = "DF";
    if(userFirstName)
        twoChars = userFirstName.charAt(0);
    if(userLastName)
        twoChars = twoChars+userLastName.charAt(0);

    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    const isSubscriptionActive = (account.user?.subscription?.isActive);
    let isPayedSubscription = isSubscriptionActive;
    if(account.user?.subscription?.plan === "free")
    {
        isPayedSubscription = false;
    }

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const trigger = useRef<any>(null);
    const dropdown = useRef<any>(null);

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!dropdown.current) return;
            if (
                !dropdownOpen ||
                dropdown.current.contains(target) ||
                trigger.current.contains(target)
            )
                return;
            setDropdownOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }: KeyboardEvent) => {
            if (!dropdownOpen || keyCode !== 27) return;
            setDropdownOpen(false);
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
    });

    return (
        <div className="relative flex flex-col">
            <button
                ref={trigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex w-full items-center gap-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
            <span className="h-8 w-8 flex items-center justify-center rounded-full bg-black">
                <p className="font-semibold text-sm text-white">{twoChars.toUpperCase()}</p>
            </span>

                <svg
                    className={`fill-current transition-transform duration-300 ${
                        dropdownOpen ? 'rotate-180' : ''
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

            {/* Dropdown Menu (Now Opens to the Right) */}
            <div
                ref={dropdown}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
                className={`fixed bottom-0  transform -translate-x-1/2 z-50 w-48 flex flex-col rounded-md bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ${
                    dropdownOpen ? 'block' : 'hidden'
                }`}
            >
                <button
                    onClick={() => navigate("/settings")}
                    className="flex items-center gap-3 p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        >
                        <path
                            d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Settings
                </button>

                {(isPayedSubscription && account.user?.subscription?.plan !== "tester") && (
                    <button
                        onClick={() => {
                            window.open(
                                process.env.NODE_ENV === 'development'
                                    ? "https://billing.stripe.com/p/login/test_7sI5kT7bt48Ggy4288"
                                    : "https://billing.stripe.com/p/login/00gbKt5m9cU41fqcMM",
                                '_blank'
                            );
                            setDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                             stroke-linejoin="round">
                            <circle cx="8" cy="8" r="6"/>
                            <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
                            <path d="M7 6h1v4"/>
                            <path d="m16.71 13.88.7.71-2.82 2.82"/>
                        </svg>
                        Billing
                    </button>
                )}

                <button
                    onClick={() => dispatch(logout())}
                    className="flex items-center gap-3 p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" x2="9" y1="12" y2="12"/>
                    </svg>
                    Log Out
                </button>
            </div>
        </div>
    );

};

export default DropdownUser;
