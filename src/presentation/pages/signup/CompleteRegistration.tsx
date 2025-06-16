import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../core/application/context/AuthContext";
import { userRepository } from "../../../infrastructure/repositories/userRepository";

const CompleteRegistration: React.FC<{ setStep: (step: "signup" | "verify" | "complete") => void }> = ({ setStep }) => {
  const navigate = useNavigate();
  const { email } = useContext(AuthContext) ?? { email: "" }; 
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    birthday: "",
    gender: "male",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.firstname || !formData.lastname || !formData.password || !formData.birthday) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      await userRepository.completeRegistration(email, formData);
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
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          required
        />
        <input
          type="date"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          required
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
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