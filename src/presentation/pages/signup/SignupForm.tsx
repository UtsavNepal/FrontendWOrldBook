import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../core/application/context/AuthContext";
import { userRepository } from "../../../infrastructure/repositories/userRepository";
import { ERRORS } from "../../../constants/errors";

const fieldClass =
  "w-full min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

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
    navigate("/login");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setFormData({ ...formData, [name]: e.target.value });
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstname.trim()) {
      newErrors.firstname = ERRORS.signup.firstNameRequired;
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = ERRORS.signup.lastNameRequired;
    }
    if (!formData.birthday) {
      newErrors.birthday = ERRORS.signup.birthdayRequired;
    }
    if (!formData.email.trim()) {
      newErrors.email = ERRORS.signup.emailRequired;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = ERRORS.signup.emailInvalid;
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
      if (response?.message || response?.success) {
        setEmail(formData.email);
        setStep("verify");
      } else {
        setErrors({ general: response?.error || ERRORS.signup.failed });
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
        setErrors({ general: error.message || ERRORS.signup.failed });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="mb-4 text-center text-xl font-bold text-gray-800 sm:text-2xl">Sign Up</h2>
      {errors.general && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-sm text-red-700">
          {errors.general}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="firstname" className="mb-1 block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              id="firstname"
              type="text"
              name="firstname"
              placeholder="First name"
              value={formData.firstname}
              onChange={handleChange}
              className={fieldClass}
              autoComplete="given-name"
              required
            />
            {errors.firstname && <div className="mt-1 text-sm text-red-600">{errors.firstname}</div>}
          </div>
          <div>
            <label htmlFor="lastname" className="mb-1 block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              id="lastname"
              type="text"
              name="lastname"
              placeholder="Last name"
              value={formData.lastname}
              onChange={handleChange}
              className={fieldClass}
              autoComplete="family-name"
              required
            />
            {errors.lastname && <div className="mt-1 text-sm text-red-600">{errors.lastname}</div>}
          </div>
        </div>
        <div>
          <label htmlFor="birthday" className="mb-1 block text-sm font-medium text-gray-700">
            Birthday
          </label>
          <input
            id="birthday"
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className={`${fieldClass} [color-scheme:light]`}
            max={new Date().toISOString().slice(0, 10)}
            required
          />
          {errors.birthday && <div className="mt-1 text-sm text-red-600">{errors.birthday}</div>}
        </div>
        <div>
          <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`${fieldClass} appearance-auto`}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <div className="mt-1 text-sm text-red-600">{errors.gender}</div>}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={fieldClass}
            autoComplete="email"
            required
          />
          {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
        </div>
        <button
          type="submit"
          className="w-full min-h-11 rounded-lg bg-blue-500 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button type="button" onClick={handleBack} className="font-medium text-blue-500 hover:text-blue-600">
          Log in
        </button>
      </p>
    </>
  );
};

export default SignupForm;
