import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";



import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/SignUp";
import Dashboard from "../pages/Dashboard";
import Group from "../pages/Group";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import RootLayout from "./RootLayout";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<RootLayout />}>

                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={<Login />} />

                    <Route path="/signup" element={<Signup />} />

                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/group/:id" element={<Group />} />

                    <Route path="/profile" element={<Profile />} />

                    <Route path="*" element={<NotFound />} />

                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;