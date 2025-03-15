import {  Routes, Route } from "react-router-dom";
import { LoginPage } from "../presentation/pages/LoginPage";
import { SignupPage } from "../presentation/pages/SignupPage";
import { WelcomePage } from "../presentation/pages/WelcomePage";



export const AppRoutes = () => {
  return (
    
      <Routes>
        <Route path="*" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
       
      </Routes>
    
  );
};
