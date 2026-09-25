import React, {Dispatch, Fragment, useEffect, useState} from "react";
import { Routes, Route } from "react-router";
import {useDispatch} from "react-redux";
import {createTheme, ThemeProvider} from "@mui/material";
import AdminSideBar from "./AdminSideBar";
import AdminHeader from "./AdminHeader";
import {requestSubscriptionsList} from "../../../api/admin/api-helper";
import {loadSubscriptionsList} from "../../../store/actions/shared/subscription.actions";
import AdminDashBoard from "../DashBoard/AdminDashBoard";



const Root: React.FC = () => {
    const dispatch: Dispatch<any> = useDispatch();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    //Theme
    const [theme, setTheme] = useState(localStorage.getItem("color-theme")?.replaceAll('"',''));
    let usedTheme = createTheme({
        palette: {
            mode: (theme === 'dark')?'dark' : 'light',
        },
    });

    useEffect(() => {
        const fetchSubscriptions= async () => {
            const subscriptions = await requestSubscriptionsList(dispatch);
            if(subscriptions.length !== 0){
                dispatch(loadSubscriptionsList((subscriptions)));
            }
        }
        fetchSubscriptions()
            .catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Fragment>
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
                {/* <!-- ===== Page Wrapper Start ===== --> */}
                <div className="flex h-screen overflow-hidden">
                    {/* <!-- ===== Sidebar Start ===== --> */}
                    <AdminSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    {/* <!-- ===== Sidebar End ===== --> */}

                    {/* <!-- ===== Content Area Start ===== --> */}
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        {/* <!-- ===== Header Start ===== --> */}
                        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setTheme={setTheme} />
                        {/* <!-- ===== Header End ===== --> */}

                        {/* <!-- ===== Main Content Start ===== --> */}
                        <main>
                            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                                <ThemeProvider theme={usedTheme}>
                                    <Routes>
                                        <Route path='/*' element={<AdminDashBoard />}/>
                                    </Routes>
                                </ThemeProvider>
                            </div>
                        </main>
                        {/* <!-- ===== Main Content End ===== --> */}
                    </div>
                    {/* <!-- ===== Content Area End ===== --> */}
                </div>
                {/* <!-- ===== Page Wrapper End ===== --> */}
            </div>
        </Fragment>
    );
};

export default Root;
