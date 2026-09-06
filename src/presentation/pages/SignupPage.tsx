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
    <div className="min-h-dvh bg-gray-200 px-4 py-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="mb-5 text-center sm:mb-6">
          <h1 className="text-3xl font-bold text-blue-500 sm:text-4xl">WorldBook</h1>
          <p className="mt-2 text-sm text-gray-700 sm:text-base">
            Create your account to connect with people
          </p>
        </div>
        <div className="w-full rounded-lg bg-white p-5 shadow-lg sm:p-8">
          {step === "signup" && <SignupForm setStep={setStep} />}
          {step === "verify" && <VerifyOTP setStep={setStep} />}
          {step === "complete" && <CompleteRegistration setStep={setStep} />}
        </div>
      </div>
    </div>
  );
};
