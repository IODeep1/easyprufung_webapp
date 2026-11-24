import {classAuthDestination} from "../../Teacher/AuthIntent";
import React,{useEffect,useState} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {completeGoogleRedirect} from "./google-redirect";
import {login} from "../../../store/actions/user/userAccount.actions";
import {authDestination} from "../Exam/guest/guest-api";
import Logo from "../../../images/logo.png";

export default function GoogleCallback() {
    const dispatch=useDispatch(),navigate=useNavigate();
    const partnerMode=classAuthDestination()==="/partners";
    const [failed,setFailed]=useState(false);
    useEffect(()=>{
        let active=true;
        completeGoogleRedirect().then(user=>{
            if(!active)return;
            dispatch(login(user));
            navigate(authDestination(),{replace:true});
        }).catch(()=>{if(active)setFailed(true);});
        return()=>{active=false;};
    },[dispatch,navigate]);
    return <main data-no-translate={partnerMode?true:undefined} lang={partnerMode?"en":undefined} dir={partnerMode?"ltr":undefined} className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-black dark:text-white">
        <section className="w-full max-w-md rounded-2xl border border-gray-200 p-8 text-center shadow-xl dark:border-gray-700">
            <img src={Logo} alt="SmartPrüfung" className="mx-auto mb-5 h-14 w-14 rounded-lg"/>
            <h1 className="text-2xl font-semibold">SmartPrüfung</h1>
            {failed ? <><p role="alert" className="mt-4">{partnerMode ? "Google sign-in could not be completed. Please try again to access Partner Mode." : "Google sign-in could not be completed. Please try again. Your saved exam is still available."}</p><a href="/login" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white">Back to sign in</a></> : <p role="status" className="mt-4">Signing you in...</p>}
        </section>
    </main>;
}
