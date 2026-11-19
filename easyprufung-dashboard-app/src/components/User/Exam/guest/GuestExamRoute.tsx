import { Component, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import GuestExamPage from "./GuestExamPage";

class GuestExamBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
 state = {failed: false};
 static getDerivedStateFromError() { return {failed: true}; }
 render() {
  return this.state.failed ? <Navigate to="/register" replace state={{guestError: true}} /> : this.props.children;
 }
}
export default function GuestExamRoute() { return <GuestExamBoundary><GuestExamPage /></GuestExamBoundary>; }
