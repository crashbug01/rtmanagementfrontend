import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // TypeScript sekarang mengenali tipe string | null
  const isAuthenticated: string | null = localStorage.getItem("token");

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
