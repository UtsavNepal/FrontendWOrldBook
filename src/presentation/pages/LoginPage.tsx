import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/application/context/AuthContext";
import { Modal } from "./modal/modal";
import { ResetPasswordForm } from "./ResetPasswordPage";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false); 
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const successMessage = location.state?.message; 

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/feed", { replace: true });
    }
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    
    return () => {
      // Cleanup when component unmounts
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.body.style.margin = '';
    };
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 
    setLoading(true);
    try {
      await login(email, password);
      
      navigate("/feed"); 
    } catch (error) {
      setError("Invalid email or password. Please try again."); 
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 flex flex-col items-center justify-center">
      {/* Container that changes layout based on screen size */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 m-0">
          {/* Left Section - Full width on mobile, half width on desktop */}
          <div className="w-full lg:w-1/2 text-center lg:text-left m-0">
            <h1 className="text-4xl sm:text-5xl font-bold text-blue-500 m-0">WorldBook</h1>
            <p className="text-base sm:text-lg mt-4 text-gray-700 m-0">
              Connect with friends, family, and the world around you
            </p>
          </div>

          {/* Right Section - Full width on mobile, half width on desktop */}
          <div className="w-full lg:w-1/2 m-0">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 m-0">
              {/* Success Message */}
              {successMessage && <p className="text-green-600 text-center m-0">{successMessage}</p>}

              {/* Error Message */}
              {error && <p className="text-red-600 text-center m-0">{error}</p>}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 m-0">
                <div className="m-0">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 m-0"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="m-0">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 m-0"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors m-0"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600 m-0">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-blue-500 hover:text-blue-600 m-0"
                >
                  Forgot password?
                </button>
              </p>
              <p className="mt-4 text-center text-sm text-gray-600 m-0">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-blue-500 hover:text-blue-600 m-0"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <ResetPasswordForm onClose={() => setIsResetModalOpen(false)} />
      </Modal>
    </div>
  );
};