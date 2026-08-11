import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

type LoginProps = {
  onOpenSignUp?: () => void;
};

const LogIn = ({ onOpenSignUp }: LoginProps) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitMessage("");
  };
  const navigate = useNavigate();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { error } = await login(formData.email, formData.password);

    if (error) {
      setSubmitMessage(error);
      return;
    }

    toast.success("Logged in successfully!");

    navigate("/dashboard");
  };
  return (
    <div>
      <div className="flex items-center justify-center bg-neutral-secondary-medium px-4 pt-8 scrollbar-none">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-4xl border border-default-medium bg-white px-6 pt-6 shadow"
        >

          <div className="mb-5">
            <label htmlFor="email" className="mb-2.5 block text-sm px-2  font-medium text-heading">
              Your email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className=" rounded-4xl block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-3 font-extralight py-2.5 text-sm text-heading shadow placeholder:text-body focus:border-brand focus:ring-brand"
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
                className="block w-full rounded-4xl border border-default-medium bg-neutral-secondary-medium px-3 py-2.5 pr-10 text-sm text-heading shadow placeholder:text-body focus:border-brand font-extralight focus:ring-brand"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-body"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div
              className="flex items-center px-2 pt-3">
              <NavLink
                to={`/forgetPass`}
                className=
                "hover:underline transform ease-in-out text-blue-600" >
                Forget Passsword
              </NavLink>
            </div>
          </div>



          <div
            className="flex justify-center items-center pb-6">

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
              Log In

            </button>
          </div>

          {submitMessage && (
            <p className="mt-3 text-sm text-red-600">{submitMessage}</p>
          )}

          <div className="mx-auto mt-4 flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="whitespace-nowrap text-sm text-black">
              Don&apos;t have an account?
            </span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>

          <div className="pt-3 pb-4 flex justify-center">
            <div className="text-s border px-4 py-0.5 rounded-3xl hover:cursor-pointer transition transform ease-in-out hover:bg-gray-100 active:scale-97 active:bg-blue-100 active:border-blue-300 w-fit">
              {onOpenSignUp ? (
                <button
                  className="block cursor-pointer" type="button" onClick={onOpenSignUp}>
                  Sign Up
                </button>
              ) : (
                <NavLink to="/signup" className="block cursor-pointer">
                  Sign Up
                </NavLink>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LogIn;
