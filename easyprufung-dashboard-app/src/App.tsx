import React from "react";
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
          <Router>
              <Routes>
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
          </Router>
      </div>
  );
};
export default App;
