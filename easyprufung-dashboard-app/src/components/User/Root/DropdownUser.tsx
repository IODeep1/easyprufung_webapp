import React, { useEffect, useRef, useState, Dispatch, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {IStateType} from "../../../store/models/root.interface";
import {logout} from "../../../store/actions/user/userAccount.actions";
import {IUserAccount} from "../../../store/models/user/userAccount.interface";

interface DropdownUserProps {
    sidebarOpen: boolean;
}

const DropdownUser = ({ sidebarOpen }: DropdownUserProps) => {
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const { i18n, t } = useTranslation();
    const isRtl = (i18n.resolvedLanguage || i18n.language).startsWith("ar");
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
        const menuWidth = 208;
        const menuHeight = 112;
        const margin = 8;
        const left = Math.max(margin, Math.min(
            isRtl ? rect.right - menuWidth : rect.left,
            window.innerWidth - menuWidth - margin
        ));
        const top = rect.top >= menuHeight + margin
            ? rect.top - menuHeight - margin
            : Math.min(rect.bottom + margin, window.innerHeight - menuHeight - margin);
        setMenuPosition({ top: Math.max(margin, top), left });
    };

    useLayoutEffect(() => {
        if (!dropdownOpen) return;
        updateMenuPosition();
        window.addEventListener('resize', updateMenuPosition);
        window.addEventListener('scroll', updateMenuPosition, true);
        return () => {
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition, true);
        };
    }, [dropdownOpen, isRtl]);


    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!dropdown.current) return;
            if (
                !dropdownOpen ||
                dropdown.current.contains(target) ||
                trigger.current?.contains(target)
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
        <div className="relative flex flex-col min-w-0">
            <button
                ref={trigger}
                type="button"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-label={t("dropdown_user_account_menu")}
                onClick={() => setDropdownOpen((open) => !open)}
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

            {/* Portal avoids clipping by the scrollable sidebar, especially in RTL. */}
            {dropdownOpen && createPortal(
            <div
                ref={dropdown}
                role="menu"
                data-sidebar-user-dropdown="true"
                dir={isRtl ? "rtl" : "ltr"}
                style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left, width: 208, maxWidth: "calc(100vw - 16px)", zIndex: 9999 }}
                className="flex flex-col rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl"
            >
                <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                    className="flex w-full items-center gap-3 p-3 rounded-md text-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                        <path
                            d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {t("dropdown_user_settings")}
                </button>
                <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setDropdownOpen(false); dispatch(logout()); }}
                    className="flex w-full items-center gap-3 p-3 rounded-md text-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" x2="9" y1="12" y2="12"/>
                    </svg>
                    {t("dropdown_user_logout")}
                </button>
            </div>, document.body)}
        </div>
    );

};

export default DropdownUser;
