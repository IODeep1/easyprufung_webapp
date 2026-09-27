import React, {Fragment, useState} from "react";
import { Routes, Route } from "react-router";
import NotFound from "../../Shared/NotFound";
import Login from "../Login/Login";
import Registration from "../Registration/Registration";
import ForgotPassword from "../Login/ForgotPassword";
import ResetPassword from "../Login/ResetPassword";
import PaymentCheckOut from "../Pricing/PaymentCheckOut";
import {createTheme, ThemeProvider} from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Settings from "./Settings";
import Pricing from "../Pricing/Pricing";
import Contact from "../Contact/Contact";
import CodeRedemption from "../Pricing/CodeRedemption";
import PricingContact from "../Pricing/PricingContact";
import {StartPage} from "../Exam/StartPage.tsx";
import MainExamPage from "../Exam/MainExamPage.tsx";
import {PassedExamsPage} from "../Exam/PassedExamsPage.tsx";
import {PassedExamReviewRoute} from "../Exam/PassedExamReviewRoute.tsx";

const Root: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    //Theme
    const [theme, setTheme] = useState(localStorage.getItem("color-theme")?.replaceAll('"',''));
    let usedTheme = createTheme({
        palette: {
            mode: (theme === 'dark')?'dark' : 'light',
        },
    });

    //const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    /*useEffect(() => {
        const ExecuteIntercom = async () => {
            const hash = await requestIntercomHash();
            if (account.user?.email && hash) {
                Intercom({
                    app_id: 'gtocla5r',
                    user_id: account.user.email,
                    name: account.user.firstname,
                    created_at: Number(account.user.createdDate),
                    user_hash : hash,
                    hide_default_launcher: false,
                });
            } else {
                update({"hide_default_launcher": true});
            }
        }
        ExecuteIntercom()
            .catch(console.error);
    }, [account.user]);*/

    return (
        <Fragment>
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
                {/* <!-- ===== Page Wrapper Start ===== --> */}
                <div className="flex h-screen overflow-hidden">
                    {/* <!-- ===== Sidebar Start ===== --> */}
                    <Sidebar  sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setTheme={setTheme}/>
                    {/* <!-- ===== Sidebar End ===== --> */}

                    {/* <!-- ===== Content Area Start ===== --> */}
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        {/* <!-- ===== Header Start ===== --> */}
                        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setTheme={setTheme} />
                        {/* <!-- ===== Header End ===== --> */}

                        {/* <!-- ===== Main Content Start ===== --> */}
                        <main>
                            <div className="mx-auto"  onClick={(e) => {
                                e.stopPropagation();
                                setSidebarOpen(false);
                            }}>
                                <ThemeProvider theme={usedTheme}>
                                    <Routes>
                                        <Route path="/*"  element={<MainExamPage />}></Route>
                                        <Route path="/new"  element={<MainExamPage />}></Route>
                                        <Route path="/exams"  element={<PassedExamsPage />}></Route>
                                        <Route path="/exams/:sessionId/review" element={<PassedExamReviewRoute />}/>
                                        <Route path="/login"  element={<Login />}></Route>
                                        <Route path="/settings"  element={<Settings />}></Route>
                                        <Route path="/register"  element={<Registration />}></Route>
                                        <Route path="/forgot_password"  element={<ForgotPassword />}></Route>
                                        <Route path="/reset_password"  element={<ResetPassword />}></Route>
                                        <Route path="/pricing"  element={<Pricing />}></Route>
                                        <Route path="/pricing/contact"  element={<PricingContact />}></Route>
                                        <Route path="/payment_successful"  element={<PaymentCheckOut />}></Route>
                                        <Route path="/code_redemption"  element={<CodeRedemption />}></Route>
                                        <Route path='/contact' element={<Contact />}/>
                                        <Route path='*' element={<NotFound />}/>
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
