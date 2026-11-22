import GoogleCallback from "./components/User/Login/GoogleCallback";
import LegalPage from "./components/Shared/LegalPage";
import AppPrivacy from "./components/Shared/AppPrivacy";
import GuestExamRoute from "./components/User/Exam/guest/GuestExamRoute";
import { ExamCertificatePage } from "./components/User/Exam/ExamCertificatePage";
import React from "react";
import UserLanguagePreference from "./components/Shared/UserLanguagePreference";
import AppLanguage from "./components/Shared/AppLanguage";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import {Route} from "react-router";
import {PrivateRoute} from "./common/routes/PrivateRoute";
import Root from "./components/User/Root/Root";
import {DefaultRoute} from "./common/routes/DefaultRoute";
import Registration from "./components/User/Registration/Registration";
import ForgotPassword from "./components/User/Login/ForgotPassword";
import ResetPassword from "./components/User/Login/ResetPassword";

const App: React.FC = () => {
  return (
      <div className="App dark:bg-gray-900" id="wrapper">
          <AppLanguage />
          <UserLanguagePreference />
          <Router>
              <Routes>
                  <Route path="/google/callback" element={<GoogleCallback />} />
                  <Route path="/privacy" element={<LegalPage kind="privacy" />} />
                  <Route path="/privacy-policy" element={<LegalPage kind="privacy" />} />
                  <Route path="/terms" element={<LegalPage kind="terms" />} />
                  <Route path="/terms-of-use" element={<LegalPage kind="terms" />} />
                  <Route path="/guest-exam" element={<GuestExamRoute />} />
                  <Route path="/zertifikat/:token" element={<ExamCertificatePage />} />
                  <Route path="*"
                         element={
                             <PrivateRoute >
                                 <Root />
                             </PrivateRoute>}>
                  </Route>
                  <Route path="/login"
                         element={<DefaultRoute></DefaultRoute>}>
                  </Route>
                  <Route path="/register"
                         element={<Registration></Registration>}>
                  </Route>
                  <Route path="/forgot_password"
                         element={<ForgotPassword></ForgotPassword>}>
                  </Route>
                  <Route path="/reset_password"
                         element={<ResetPassword></ResetPassword>}>
                  </Route>
              </Routes>
              <AppPrivacy />
          </Router>
      </div>
  );
};
export default App;
