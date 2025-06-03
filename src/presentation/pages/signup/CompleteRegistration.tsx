import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../core/application/context/AuthContext";
import { userRepository } from "../../../infrastructure/repositories/userRepository";

const CompleteRegistration: React.FC<{ setStep: (step: "signup" | "verify" | "complete") => void }> = ({ setStep }) => {
  const navigate = useNavigate();
  const { email } = useContext(AuthContext) ?? { email: "" }; 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!firstName || !lastName || !password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      await userRepository.completeRegistration(email, firstName, lastName, password);
      navigate("/login");
    } catch (error: any) {
      setError(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Complete Registration</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          required
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