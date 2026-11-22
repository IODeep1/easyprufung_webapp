import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {guestStateEvent,readGuest} from "./guest-api";

export default function SavedGuestExamNotice({userId,plan}:{userId?:string;plan?:string}) {
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const update=()=>{
   const guest=readGuest();
   const free=!plan || plan.toLowerCase()==="free";
   setVisible(!!userId && free && !!guest?.sessionId);
  };
  update();window.addEventListener(guestStateEvent,update);window.addEventListener('storage',update);
  return()=>{window.removeEventListener(guestStateEvent,update);window.removeEventListener('storage',update);};
 },[userId,plan]);
 return visible?<Link className="bg-blue-50 px-6 py-3 text-center text-blue-800" to="/guest-exam">Return to your saved exam</Link>:null;
}
