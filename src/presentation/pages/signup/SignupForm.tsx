import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../core/application/context/AuthContext";
import { userRepository } from "../../../infrastructure/repositories/userRepository";

const SignupForm: React.FC<{ setStep: (step: "signup" | "verify" | "complete") => void }> = ({ setStep }) => {
  const navigate = useNavigate();
  const { setEmail } = useContext(AuthContext)!; 
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    birthday: "",
    gender: "male",
    email: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate("/"); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.value });
    setErrors(prev => ({ ...prev, [name]: "", general: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }
    if (!formData.birthday) {
      newErrors.birthday = "Birthday is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await userRepository.signup(formData);
      if (response.message) {
        setEmail(formData.email);
        setStep("verify");
      }
    } catch (error: any) {
      const data = error.response?.data;
      if (typeof data === "object" && data !== null) {
        const fieldErrors: { [key: string]: string } = {};
        for (const key in data) {
          if (Array.isArray(data[key])) {
            fieldErrors[key] = data[key][0];
          } else if (typeof data[key] === "string") {
            if (key === "error") {
              const msg = data[key].toLowerCase();
              if (msg.includes("username")) fieldErrors.username = data[key];
              else if (msg.includes("email")) fieldErrors.email = data[key];
              else if (msg.includes("first name")) fieldErrors.firstname = data[key];
              else if (msg.includes("last name")) fieldErrors.lastname = data[key];
              else if (msg.includes("birthday")) fieldErrors.birthday = data[key];
              else if (msg.includes("gender")) fieldErrors.gender = data[key];
              else fieldErrors.general = data[key];
            } else {
              fieldErrors[key] = data[key];
            }
          }
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.message || "Signup failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input 
            type="text" 
            name="firstname" 
            placeholder="First Name" 
            value={formData.firstname} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          {errors.firstname && <div className="text-red-600 text-sm mt-1">{errors.firstname}</div>}
        </div>
        <div>
          <input 
            type="text" 
            name="lastname" 
            placeholder="Last Name" 
            value={formData.lastname} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          {errors.lastname && <div className="text-red-600 text-sm mt-1">{errors.lastname}</div>}
        </div>
        <div>
          <input 
            type="date" 
            name="birthday" 
            value={formData.birthday} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          {errors.birthday && <div className="text-red-600 text-sm mt-1">{errors.birthday}</div>}
        </div>
        <div>
          <select 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <div className="text-red-600 text-sm mt-1">{errors.gender}</div>}
        </div>
        <div>
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
        </div>
        <button 
          type="submit" 
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="py-2">Already have an account?</p>
        <button
          onClick={handleBack}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default SignupForm; 