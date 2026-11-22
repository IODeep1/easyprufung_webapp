import { Component, type ReactNode } from "react";
import { useSelector } from "react-redux";
import type { IStateType } from "../../../../store/models/root.interface";
import AcquisitionOnboarding from "../../Onboarding/AcquisitionOnboarding";
import { Navigate } from "react-router-dom";
import GuestExamPage from "./GuestExamPage";

class GuestExamBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
 state = {failed: false};
 static getDerivedStateFromError() { return {failed: true}; }
 render() {
  if (!this.state.failed) return this.props.children;
  return <Navigate to="/" replace />;
 }
}
export default function GuestExamRoute() {
 const user = useSelector((state: IStateType) => state.userAccount.user);
 return <GuestExamBoundary>
  {user?.email && user.acquisitionOnboardingCompleted === false
   ? <AcquisitionOnboarding returnTo="/guest-exam" />
   : <GuestExamPage />}
 </GuestExamBoundary>;
}
