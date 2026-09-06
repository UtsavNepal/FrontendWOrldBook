import { useState, useEffect } from "react";
import { SignupForm, VerifyOTP, CompleteRegistration } from "./signup";
import { useAuth } from "../../core/application/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const SignupPage = () => {
  const [step, setStep] = useState<"signup" | "verify" | "complete">("signup");
  const { isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate("/feed", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  if (isAuthLoading || isAuthenticated) return null;

  return (
    <div>
      {step === "signup" && <SignupForm setStep={setStep} />}
      {step === "verify" && <VerifyOTP setStep={setStep} />}
      {step === "complete" && <CompleteRegistration setStep={setStep} />}
    </div>
  );
};