import { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";

const Home = () => {
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-gray-900">
      <div className={isAuthOpen ? "pointer-events-none blur-[1px]" : ""}>
      <header className="flex items-center justify-between px-7 py-6">
        <h1 className="text-xl  font-semibold ">Split-Mint</h1>

        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
          className="text-gray-600 transition hover:text-black"
          aria-label="GitHub"
        >
          <svg
            xmlns="https://github.com/Jayant-Sharma-Dev/Split-Tracker.git"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.01c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.1v3.11c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
        </a>
      </header>

      <main className="flex min-h-[calc(100vh-88px)] items-start justify-center px-6 pt-20 lg:items-center lg:pt-0">
        <div className="max-w-3xl text-center lg:-translate-y-8">
          <p className="mb-5 text-sm font-normal uppercase tracking-[0.2em] text-gray-600">
            Simple expense sharing
          </p>

          <h2 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
           Split the bill,
            <br />
            <span className="text-gray-400">not the friendship.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl font-medium text-lg leading-8 text-gray-600">
         Good times are better when everyone pays their fair share.
          </p>

          <button
            type="button"
            onClick={() => {
              setAuthView("login");
              setIsAuthOpen(true);
            }}
            className="mt-9 inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Get Started
            <span className="ml-2">→</span>
          </button>

          <p className="mt-5 text-sm font-medium text-gray-400">
            Less math. More memories.
          </p>
        </div>
      </main>
      </div>

      {isAuthOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-6 backdrop-blur-[1px] lg:items-center"
          onClick={() => setIsAuthOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAuthOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-700 shadow hover:bg-white"
            >
              Close
            </button>
            {authView === "login" ? (
              <Login onOpenSignUp={() => setAuthView("signup")} />
            ) : (
              <SignUp onOpenLogin={() => setAuthView("login")} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;