import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../core/application/context/AuthContext";
import { userRepository } from "../../../infrastructure/repositories/userRepository";

const CompleteRegistration: React.FC<{ setStep: (step: "signup" | "verify" | "complete") => void }> = () => {
  const navigate = useNavigate();
  const { email } = useContext(AuthContext) ?? { email: "" };
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    if (!email) {
      setError("Missing email. Please start signup again.");
      setLoading(false);
      return;
    }

    try {
      await userRepository.completeRegistration(email, { password });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Create your password</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          required
          minLength={6}
        />
        <button
          type="submit"
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? "Completing..." : "Complete Registration"}
        </button>
      </form>
    </div>
  );
};

export default CompleteRegistration;
