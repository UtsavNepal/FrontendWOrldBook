import { useState } from "react";
import { useAuth } from "../../core/application/context/AuthContext";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"signup" | "verify" | "complete">("signup");
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    password: "",
    birthday: "",
    gender: "",
  });
  const { signup, verifyOTP, completeRegistration } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(email);
    setStep("verify");
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOTP(email, otp);
    setStep("complete");
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeRegistration({ email, ...userData });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Signup</h1>

        {/* Step 1: Email and Send OTP */}
        {step === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Send OTP
            </Button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Verify OTP
            </Button>
          </form>
        )}

        {/* Step 3: Complete Registration */}
        {step === "complete" && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <Input
              type="text"
              placeholder="First Name"
              value={userData.firstname}
              onChange={(e) => setUserData({ ...userData, firstname: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={userData.lastname}
              onChange={(e) => setUserData({ ...userData, lastname: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="password"
              placeholder="Password"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="date"
              placeholder="Birthday"
              value={userData.birthday}
              onChange={(e) => setUserData({ ...userData, birthday: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={userData.gender}
              onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <Button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Complete Registration
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};