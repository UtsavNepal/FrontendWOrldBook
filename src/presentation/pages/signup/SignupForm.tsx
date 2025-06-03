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
    password: "",
  });
  const handleBack = () => {
     navigate("/"); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      await userRepository.signup(formData);
      setEmail(formData.email);
      setStep("verify");
    } catch (error: any) {
      alert(error.message || "Signup failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-1 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="w-full p-2 border rounded" required />
        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Sign Up
        </button>
      </form>
      <div className="space-y-1">
      <p className="py-2">Already have an account?</p>
      <button
          onClick={handleBack}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white  py-2 px-2 rounded space-y-1"
        >
          Go Back
        </button>
      </div>
    </div>
    
  );
};

export default SignupForm; 