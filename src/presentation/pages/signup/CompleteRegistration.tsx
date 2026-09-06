import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../core/application/context/AuthContext";
import { userRepository } from "../../../infrastructure/repositories/userRepository";
import { ERRORS } from "../../../constants/errors";

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
      setError(ERRORS.signup.passwordRequired);
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError(ERRORS.signup.passwordTooShort);
      setLoading(false);
      return;
    }
    if (!email) {
      setError(ERRORS.signup.missingEmail);
      setLoading(false);
      return;
    }

    try {
      await userRepository.completeRegistration(email, { password });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || ERRORS.signup.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="mb-4 text-center text-xl font-bold text-gray-800 sm:text-2xl">Create your password</h2>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="w-full min-h-11 rounded-lg bg-blue-500 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Completing..." : "Complete registration"}
        </button>
      </form>
    </>
  );
};

export default CompleteRegistration;
