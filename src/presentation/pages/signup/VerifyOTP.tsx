import { useState, useContext } from "react";
import { AuthContext } from "../../../core/application/context/AuthContext";
import { userRepository } from "../../../infrastructure/repositories/userRepository";

const VerifyOTP: React.FC<{ setStep: (step: "signup" | "verify" | "complete") => void }> = ({ setStep }) => {
  const { email } = useContext(AuthContext)!;
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userRepository.verifyOtp(email, otp);
      setStep("complete"); 
    } catch (error: any) {
      alert(error.message || "OTP verification failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleVerifyOTP} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
        <button type="submit" className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition">
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP; 