import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/SignUp";
import Dashboard from "../pages/Dashboard";
import Group from "../pages/Group";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import RootLayout from "./RootLayout";
import ForgetPass from "../pages/ForgetPass";
import ProtectedRoute from "../components/context/ProtectedRoutes";
import ResetPass from "../pages/ResetPass";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<RootLayout />}>
                    
                    <Route path="/" element={<Login />} />

                    <Route path="/signup" element={<Signup />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                    <Route path="/group/:id" element={<ProtectedRoute><Group/></ProtectedRoute>} />

                    <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />

                    <Route path="*" element={<NotFound />} />
                    <Route path="/forgetPass" element={<ForgetPass/>} />
                    <Route path="/resetPass" element={<ResetPass/>} />

                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;