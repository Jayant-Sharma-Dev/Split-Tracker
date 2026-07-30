import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
const ResetPass = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const navigate = useNavigate();

  const passwordsMatch =
    formData.newPassword.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.newPassword === formData.confirmPassword;

  const showPasswordError =
    formData.confirmPassword.length > 0 && !passwordsMatch;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordsMatch) {
      setSubmitMessage("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: formData.newPassword,
    });

    if (error) {
      setSubmitMessage(error.message);
      return;
    }

toast.success("Password updated successfully. Please login..");

navigate("/login");
  };

  return (
    <div>
      <div className="flex items-center justify-center bg-neutral-secondary-medium px-4 pt-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-4xl border border-default-medium bg-white px-6 pt-6 shadow "
        >
          <div className="mb-5">
            <label htmlFor="newPassword" className="mb-2.5 block text-sm px-2 font-medium text-heading">
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="rounded-4xl block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-3 font-extralight py-2.5 text-sm text-heading shadow placeholder:text-body focus:border-brand focus:ring-brand"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="confirmPassword" className="mb-2.5 block text-sm px-2 font-medium text-heading">
              Confirm new password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="rounded-4xl block w-full rounded-base border border-default-medium bg-neutral-secondary-medium px-3 font-extralight py-2.5 text-sm text-heading shadow placeholder:text-body focus:border-brand focus:ring-brand"
              placeholder="••••••••"
              required
            />
            {showPasswordError && (
              <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
            )}
          </div>

          <div className="flex justify-center items-center pb-6">
            <button
              type="submit"
              disabled={!passwordsMatch}
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
          hover:shadow-lg"
            >
              Submit
            </button>
          </div>

          {submitMessage && (
            <p className="mt-3 text-sm text-red-600">{submitMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPass;