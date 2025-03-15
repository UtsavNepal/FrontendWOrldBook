import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/application/context/AuthContext";

import { Modal } from "./modal/modal";
import { ResetPasswordForm } from "./ResetPasswordPage";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false); // State to control modal visibility
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const successMessage = location.state?.message; // Get the success message from location.state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      await login(email, password);
    } catch (error) {
      setError("Invalid email or password. Please try again."); // Display error message
    }
    finally{
        setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-200 items-center justify-center">
      <div className="w-2/3 flex items-center">
        {/* Left Section */}
        <div className="w-1/2 p-8">
          <h1 className="text-5xl font-bold text-blue-500">WorldBook</h1>
          <p className="text-lg mt-4 text-gray-700">
            Connect with friends, family, and the world around you
          </p>
        </div>

        <div className="w-1/2 bg-gray-100 p-8 rounded-lg shadow-lg">
          
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}{" "}
          
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-1">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                className="w-2/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex space-x-1">
            <input
                type="password"
                placeholder="Password"
                value={password}
                className="w-2/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full p-2 text-white rounded transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600"
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-center text-sm mt-7">
            Forget password?{" "}
            <button className="text-blue-500 hover:underline" onClick={() => setIsResetModalOpen(true)}>Reset</button>{" "}
            {/* Open modal on click */}
            </p>
          <p className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <button className="text-blue-500 hover:underline" onClick={() => navigate("/signup")}>Signup</button>
            <br />
           </p>
           
        </div>
      </div>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <ResetPasswordForm onClose={() => setIsResetModalOpen(false)} />
      </Modal>
    </div>
  );
};

