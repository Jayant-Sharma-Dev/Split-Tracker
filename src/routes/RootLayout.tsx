import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
const RootLayout = () => {
    const { user, logout } = useAuth();
    

    return (
        <>
         {user && (
            <header className="flex border-b items-center justify-between px-10 py-6">
                <span className="font-bold text-lg">SplitMint</span>
                <div className="flex gap-6 items-center">
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
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `hover:underline hover:scale-105 transform ease-in-out ${isActive ? "text-blue-500" : "text-black"
                            }`
                        }
                    >
                        Profile
                    </NavLink>
                     <button onClick={logout} className="hover:cursor-pointer">Logout</button>
                </div>

            </header>)}
            <Outlet />

            {/* Footer later */}

        </>
    );
};

export default RootLayout;