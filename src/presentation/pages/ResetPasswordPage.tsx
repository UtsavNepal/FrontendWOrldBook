import { useState } from "react";
import { useAuth } from "../../core/application/context/AuthContext";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";


export const ResetPasswordForm = ({ onClose }: { onClose: () => void }) => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState<"request" | "verify" | "reset">("request");
    const { requestPasswordReset, verifyResetOTP, resetPassword } = useAuth();
  
    const handleRequestReset = async (e: React.FormEvent) => {
      e.preventDefault();
      await requestPasswordReset(email);
      setStep("verify");
    };
  
    const handleVerifyOTP = async (e: React.FormEvent) => {
      e.preventDefault();
      await verifyResetOTP(email, otp);
      setStep("reset");
    };
  
    const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      await resetPassword(email, newPassword);
      alert("Password reset successfully!");
      onClose();
    };
  
    return (
      <div>
        <h1 className="text-xl font-bold mb-4 text-center">Reset Password</h1>
        {step === "request" && (
          <form onSubmit={handleRequestReset}>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Request OTP</Button>
          </form>
        )}
        {step === "verify" && (
          <form onSubmit={handleVerifyOTP}>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Verify OTP</Button>
          </form>
        )}
        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600" type="submit">Reset Password</Button>
          </form>
        )}
      </div>
    );
  };