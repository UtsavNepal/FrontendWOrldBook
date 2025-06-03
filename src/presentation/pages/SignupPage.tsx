import { useState } from "react";
import { SignupForm, VerifyOTP, CompleteRegistration } from "./signup";

export const SignupPage = () => {
  const [step, setStep] = useState<"signup" | "verify" | "complete">("signup");

  return (
    <div>
      {step === "signup" && <SignupForm setStep={setStep} />}
      {step === "verify" && <VerifyOTP setStep={setStep} />}
      {step === "complete" && <CompleteRegistration setStep={setStep} />}
    </div>
  );
};