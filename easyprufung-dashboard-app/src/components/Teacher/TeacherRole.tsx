import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { IStateType } from "../../store/models/root.interface";
import { teacherApi } from "./api";
export type TeacherStatus =
  | "NOT_REGISTERED"
  | "ACTIVE"
  | "PENDING"
  | "SUSPENDED";
export const teacherRoleChanged = "smartpruefung:teacher-role-changed";
type Role = {
  loading: boolean;
  status: TeacherStatus | null;
  isTeacher: boolean;
  isPartner: boolean;
  refresh: () => Promise<void>;
};
const Context = createContext<Role>({
  loading: true,
  status: null,
  isTeacher: false,
  isPartner: false,
  refresh: async () => {},
});
export function TeacherRoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = useSelector((s: IStateType) => s.userAccount.user?.uuid);
  const [role, setRole] = useState<{
    userId: string | undefined;
    status: TeacherStatus | null;
    loading: boolean;
    partnerStatus?: string;
  }>({ userId: undefined, status: null, loading: true });
  const refresh = useCallback(async () => {
    if (!userId) {
      setRole({ userId, status: null, loading: false });
      return;
    }
    try {
      const p = await teacherApi<{
        status: TeacherStatus;
        partnerStatus?: string;
      }>("teacher/me");
      setRole({
        userId,
        status: p.status,
        partnerStatus: p.partnerStatus,
        loading: false,
      });
    } catch {
      setRole({ userId, status: null, loading: false });
    }
  }, [userId]);
  useEffect(() => {
    let active = true;
    setRole({ userId, status: null, loading: !!userId });
    if (userId)
      teacherApi<{ status: TeacherStatus; partnerStatus?: string }>(
        "teacher/me"
      )
        .then((p) => {
          if (active)
            setRole({
              userId,
              status: p.status,
              partnerStatus: p.partnerStatus,
              loading: false,
            });
        })
        .catch(() => {
          if (active) setRole({ userId, status: null, loading: false });
        });
    return () => {
      active = false;
    };
  }, [userId]);
  useEffect(() => {
    const update = () => {
      void refresh();
    };
    window.addEventListener(teacherRoleChanged, update);
    return () => window.removeEventListener(teacherRoleChanged, update);
  }, [refresh]);
  const current =
    role.userId === userId
      ? role
      : { status: null, partnerStatus: undefined, loading: true };
  return (
    <Context.Provider
      value={{
        loading: current.loading,
        status: current.status,
        isTeacher:
          current.status !== null && current.status !== "NOT_REGISTERED",
        isPartner: Boolean(
          current.partnerStatus && current.partnerStatus !== "NOT_REGISTERED"
        ),
        refresh,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useTeacherRole = () => useContext(Context);
