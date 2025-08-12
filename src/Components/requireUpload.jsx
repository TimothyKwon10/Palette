import { Navigate, Outlet } from "react-router-dom";

export default function RequireUpload() {
  const ok = !!sessionStorage.getItem("uploadPreviewURL");
  return ok ? <Outlet /> : <Navigate to="/create" replace />;
}