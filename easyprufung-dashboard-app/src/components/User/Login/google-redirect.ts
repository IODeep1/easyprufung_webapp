import {authenticateGoogleCode} from "../../../api/user/api-helper";
import {normalizeLanguage} from "../../../localization/languages";

export const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "1043535428900-78a6e5fcg3gvcj6rvlu52pfrebhmff41.apps.googleusercontent.com";
export const googleRedirectKey = "smartpruefung:google-redirect:v1";
const lifetime = 10 * 60 * 1000;
type Attempt = {state:string;verifier:string;redirectUri:string;language:string;createdAt:number};
function base64url(bytes:Uint8Array) {
    return btoa(Array.from(bytes,byte=>String.fromCharCode(byte)).join("")).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
export async function startGoogleRedirect(language:string) {
    const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64url(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier))));
    const redirectUri = window.location.origin + "/google/callback";
    const attempt:Attempt = {state,verifier,redirectUri,language:normalizeLanguage(language)||"en",createdAt:Date.now()};
    // Write before navigating: a blocked storage browser must never leave an unrecoverable attempt.
    sessionStorage.setItem(googleRedirectKey,JSON.stringify(attempt));
    const params = new URLSearchParams({client_id:googleClientId,redirect_uri:redirectUri,response_type:"code",scope:"openid email profile",state,code_challenge:challenge,code_challenge_method:"S256",prompt:"select_account"});
    window.location.assign("https://accounts.google.com/o/oauth2/v2/auth?"+params.toString());
}

// Scrub OAuth parameters before React mounts any third-party scripts or link elements.
const callback = typeof window!=="undefined" && window.location.pathname==="/google/callback" ? new URLSearchParams(window.location.search) : null;
if(callback) window.history.replaceState(window.history.state,"","/google/callback");
let completion:ReturnType<typeof authenticateGoogleCode>|null=null;
export function completeGoogleRedirect() {
    // One exchange across React StrictMode effect remounts. Authorization codes cannot be reused.
    if(completion)return completion;
    completion=(async()=>{
        const raw=sessionStorage.getItem(googleRedirectKey);
        sessionStorage.removeItem(googleRedirectKey);
        const attempt:Attempt|null=raw?JSON.parse(raw):null;
        if(!attempt || !callback || !attempt.state || callback.get("state")!==attempt.state ||
           !Number.isFinite(attempt.createdAt) || Date.now()-attempt.createdAt>lifetime || Date.now()<attempt.createdAt ||
           attempt.redirectUri!==window.location.origin+"/google/callback") throw new Error("Invalid or expired sign-in attempt");
        if(callback.has("error") || !callback.get("code"))throw new Error("Google sign-in was cancelled");
        return authenticateGoogleCode(callback.get("code")!,attempt.verifier,attempt.redirectUri,attempt.language);
    })();
    return completion;
}
