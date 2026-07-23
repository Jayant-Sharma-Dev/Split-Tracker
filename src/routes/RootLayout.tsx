import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
const RootLayout = () => {
    return (
        <>
            <header className="flex justify-between px-10 py-6">
                <div className="flex gap-4">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `hover:underline hover:scale-105 transform ease-in-out ${isActive ? "text-blue-500" : "text-black"
                            }`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `hover:underline hover:scale-105 transform ease-in-out ${isActive ? "text-blue-500" : "text-black"
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to={`/group/1`}
                        className={({ isActive }) =>
                            `hover:underline hover:scale-105 transform ease-in-out ${isActive ? "text-blue-500" : "text-black"
                            }`
                        }
                    >
                        Group
                    </NavLink>
                </div>
                <div className="flex gap-4">
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            `hover:underline hover:scale-105 transform ease-in-out ${isActive ? "text-blue-500" : "text-black"
                            }`
                        }
                    >
                        Login
                    </NavLink>
                    <NavLink
                        to="/signup"
                        className={({ isActive }) =>
                            `hover:underline hover:scale-105 transform ease-in-out ${isActive ? "text-blue-500" : "text-black"
                            }`
                        }
                    >
                        Sign Up
                    </NavLink>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `hover:underline hover:scale-105 transform ease-in-out ${isActive ? "text-blue-500" : "text-black"
                            }`
                        }
                    >
                        Profile
                    </NavLink>
                </div>

            </header>
            <Outlet />

            {/* Footer later */}

        </>
    );
};

export default RootLayout;