export const privacyKey='smartpruefung.privacy.v1';
export const privacyEvent='smartpruefung:privacy-choice';
export const privacyOpenEvent='smartpruefung:privacy-open';
export type PrivacyChoice={version:1;analytics:boolean;expiresAt:number};
let memory:PrivacyChoice|null=null;
let memoryOnly=false;
export const privacyCookie='smartpruefung_privacy_v1';
const lifetime=180*86400000;
function valid(value:PrivacyChoice|null):value is PrivacyChoice {
 return value?.version===1 && typeof value.analytics==='boolean' && Number.isFinite(value.expiresAt) && value.expiresAt>Date.now() && value.expiresAt<=Date.now()+lifetime+60000;
}
function sharedChoice():PrivacyChoice|null {
 try {
  const item=document.cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith(privacyCookie+'='));
  const value=item?JSON.parse(decodeURIComponent(item.slice(privacyCookie.length+1))):null;
  return valid(value)?value:null;
 }catch{return null;}
}
function shareChoice(choice:PrivacyChoice) {
 try {
  const host=window.location.hostname;
  const domain=host==='smartpruefung.com' || host.endsWith('.smartpruefung.com')?'; Domain=smartpruefung.com':'';
  const secure=window.location.protocol==='https:'?'; Secure':'';
  document.cookie=privacyCookie+'='+encodeURIComponent(JSON.stringify(choice))+'; Path=/; SameSite=Lax; Max-Age='+Math.max(0,Math.floor((choice.expiresAt-Date.now())/1000))+domain+secure;
 }catch{}
}
export function readPrivacyChoice():PrivacyChoice|null {
 if(typeof window==='undefined')return null;
 let local:PrivacyChoice|null=null;
 try {const value=JSON.parse(localStorage.getItem(privacyKey)||'null');if(valid(value))local=value;}catch{}
 if(memoryOnly && valid(memory))local=memory;
 const shared=sharedChoice();
 // All choices have the same lifetime, so the later expiry identifies the newer decision.
 // On a timestamp tie, rejection wins. Migration never extends the original expiry.
 const choice=!local?shared:!shared?local:shared.expiresAt>local.expiresAt?shared:local.expiresAt>shared.expiresAt?local:shared.analytics?local:shared;
 if(!choice)return null;
 if(!local || local.expiresAt!==choice.expiresAt || local.analytics!==choice.analytics){
  memory=choice;
  try{localStorage.setItem(privacyKey,JSON.stringify(choice));memoryOnly=false;}catch{memoryOnly=true;}
  applyAnalytics(choice.analytics);
 }
 if(!shared || shared.expiresAt!==choice.expiresAt || shared.analytics!==choice.analytics)shareChoice(choice);
 return choice;
}
export function analyticsAllowed(){return readPrivacyChoice()?.analytics===true;}
export function savePrivacyChoice(analytics:boolean){
 memory={version:1,analytics,expiresAt:Date.now()+lifetime};
 try{localStorage.setItem(privacyKey,JSON.stringify(memory));memoryOnly=false;}catch{memoryOnly=true;}
 shareChoice(memory);
 applyAnalytics(analytics);
 window.dispatchEvent(new Event(privacyEvent));
}
function applyAnalytics(analytics:boolean){
 const w=window as Window & {'ga-disable-G-B09ESXCTDF'?:boolean;gtag?:(...args:unknown[])=>void};
 w['ga-disable-G-B09ESXCTDF']=!analytics;
 try{w.gtag?.('consent','update',{analytics_storage:analytics?'granted':'denied'});}catch{}
 if(!analytics){
  try{localStorage.removeItem('smartpruefung.website.visitor');}catch{}
  // Remove existing GA cookies for this host and its parent domain where accessible.
  try{document.cookie.split(';').map(c=>c.trim().split('=')[0]).filter(n=>/^_ga(?:_|$)|^_gid$|^_gat/.test(n)).forEach(n=>{
   const host=window.location.hostname.split('.');
   document.cookie=`${n}=; Max-Age=0; Path=/`;
   for(let i=0;i<host.length-1;i++)document.cookie=`${n}=; Max-Age=0; Path=/; Domain=.${host.slice(i).join('.')}`;
  });}catch{}
 }
}
