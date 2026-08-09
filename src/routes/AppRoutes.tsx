import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import ForgetPass from "../pages/ForgetPass";
import ProtectedRoute from "../components/context/ProtectedRoutes";
import ResetPass from "../pages/ResetPass";
import GroupPage from "../pages/GroupPage";
import Home from "../pages/Home";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>



        <Route path="/" element={<Home />} />

                    <Route path="/home" element={<Navigate to="/" replace />} />

                    <Route path="/login" element={<Navigate to="/" replace />} />

                    <Route path="/signup" element={<Navigate to="/" replace />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route
          path="/group/:id"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
        <Route path="/forgetPass" element={<ForgetPass />} />
        <Route path="/resetPass" element={<ResetPass />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;