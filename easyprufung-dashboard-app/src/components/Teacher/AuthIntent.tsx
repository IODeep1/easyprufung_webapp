import { useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import { IStateType } from "../../store/models/root.interface";
import { useLocation } from "react-router-dom";
export const classReturnKey = "smartpruefung:class-auth-return";
export function classAuthDestination(): string | null {
  try {
    const p = sessionStorage.getItem(classReturnKey);
    return p &&
      (/^\/partners(?:\/|$)/.test(p) ||
        /^\/teacher(?:\/|$)/.test(p) ||
        /^\/class\/join\/[A-Za-z0-9_-]{43}$/.test(p) ||
        p === "/my-classes" ||
        /^\/purchase\?plan=b1(?:_unlimited)?$/.test(p))
      ? p
      : null;
  } catch {
    return null;
  }
}
export default function AuthIntent() {
  const { pathname, search } = useLocation();
  const signedIn = useSelector((state: IStateType) =>
    Boolean(state.userAccount.user?.email)
  );
  useLayoutEffect(() => {
    if (pathname === "/teacher/register") {
      try {
        sessionStorage.setItem("smartpruefung:teacher-signup", "1");
      } catch {}
    }
    if (
      pathname.startsWith("/partners") ||
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/class/join/") ||
      pathname === "/my-classes" ||
      pathname === "/purchase"
    ) {
      if (signedIn && pathname !== "/teacher/register" && pathname !== "/partners/register") {
        try {
          sessionStorage.removeItem(classReturnKey);
        } catch {}
        return;
      }
      try {
        sessionStorage.setItem(
          classReturnKey,
          pathname === "/partners/register"
            ? "/partners"
            : pathname === "/teacher/register"
            ? "/teacher"
            : pathname === "/purchase"
            ? pathname + search
            : pathname
        );
      } catch {}
    }
  }, [pathname, search, signedIn]);
  return null;
}
