import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  supabase,
  isSupabaseConfigured,
} from "../lib/supabase";
import { useNavigate } from "react-router-dom";


const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const passwordsMatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const showPasswordError = formData.confirmPassword.length > 0 && !passwordsMatch;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitMessage("");
  };
  const navigate = useNavigate();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!passwordsMatch) {
    console.log("3. Passwords don't match");
    setSubmitMessage("Passwords do not match.");
    return;
  }

  if (!isSupabaseConfigured || !supabase) {
    console.log("6. Supabase not configured");
    setSubmitMessage("Supabase is not configured.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  console.log("Data:", data);
  console.log("Error:", error);

  if (error) {
  setSubmitMessage(error.message);
  return;
}

setSubmitMessage("Account created successfully.");

setTimeout(() => {
  navigate("/login");
}, 1500);

};
 
  return (
    <div className="flex items-center justify-center bg-neutral-secondary-medium px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-4xl border border-default-medium bg-white px-6 py-6 shadow "
        >

        <div className="mb-5">
          <label htmlFor="fullName" className="mb-2.5 block text-sm font-medium text-heading px-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-3 py-2.5 text-sm text-heading shadow placeholder:text-body focus:border-brand focus:ring-brand font-extralight rounded-4xl"
            placeholder="John Dev"
            required
          />
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="mb-2.5 block text-sm font-medium text-heading px-2">
            Your email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-3 py-2.5 text-sm text-heading shadow placeholder:text-body focus:border-brand focus:ring-brand rounded-4xl font-extralight"
            placeholder="name@flowbite.com"
            required
          />
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="mb-2.5 block text-sm font-medium text-heading px-2">
            Your password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-3 py-2.5 pr-10 text-sm text-heading shadow placeholder:text-body focus:border-brand focus:ring-brand rounded-4xl font-extralight"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-body"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="confirmPassword" className="mb-2.5 block text-sm font-medium text-heading px-2">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-3 py-2.5 pr-10 text-sm text-heading shadow placeholder:text-body focus:border-brand focus:ring-brand rounded-4xl font-extralight"
              placeholder="••••••••"
              required
            />
          </div>
          {showPasswordError && (
            <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
          )}
        </div>

       <div
className="flex justify-center items-center py-1">

 <button
className="
          px-20 py-2 
          border 
          text-s
          rounded-4xl
          transition-all
          duration-250
          ease-in-out
          hover:bg-gray-100
          active:bg-blue-100
          active:border-blue-300
          active:scale-97
          hover:cursor-pointer
          hover:shadow-lg">
            Create account

</button>
          </div>

        {submitMessage && (
          <p className="mt-3 text-sm text-red-600">{submitMessage}</p>
        )}
      </form>
    </div>
  );
};

export default SignUp;
