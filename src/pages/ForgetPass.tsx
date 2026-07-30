import { useState, type ChangeEvent, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
const ForgetPass = () => {
    const [formData, setFormData] = useState({
        email: "",
    });
    const [submitMessage, setSubmitMessage] = useState("");

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
  const {error} = await supabase.auth.resetPasswordForEmail(formData.email, {
  redirectTo: "http://localhost:5173/resetPass",
});

  if (error) {
    setSubmitMessage(error.message);
    return;
  }
  setSubmitMessage("Check your email for the password reset link.");
};
    return (
        <div>
            <div className="flex items-center justify-center bg-neutral-secondary-medium px-4 pt-8">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm rounded-4xl border border-default-medium bg-white px-6 pt-6 shadow "
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
                            Submit

                        </button>
                    </div>

                    {submitMessage && (
                        <p className="mb-3 flex items-center justify-center text-sm text-red-600">{submitMessage}</p>
                    )}

                </form>
            </div>
        </div>
    );
};

export default ForgetPass;