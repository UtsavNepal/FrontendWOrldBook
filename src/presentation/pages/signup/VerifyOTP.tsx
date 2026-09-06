import { useState, useContext } from "react";
import { AuthContext } from "../../../core/application/context/AuthContext";
import { userRepository } from "../../../infrastructure/repositories/userRepository";
import { ERRORS } from "../../../constants/errors";

const VerifyOTP: React.FC<{ setStep: (step: "signup" | "verify" | "complete") => void }> = ({ setStep }) => {
  const { email } = useContext(AuthContext)!;
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userRepository.verifyOtp(email, otp);
      setStep("complete");
    } catch (error: any) {
      alert(error.message || ERRORS.signup.otpFailed);
    }
  };

  return (
    <>
      <h2 className="mb-2 text-center text-xl font-bold text-gray-800 sm:text-2xl">Verify email</h2>
      <p className="mb-4 text-center text-sm text-gray-600">
        Enter the code we sent to {email || "your email"}.
      </p>
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div>
          <label htmlFor="otp" className="mb-1 block text-sm font-medium text-gray-700">
            Code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter the 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full min-h-11 rounded-lg bg-blue-500 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-600"
        >
          Verify
        </button>
      </form>
    </>
  );
};

export default VerifyOTP;
