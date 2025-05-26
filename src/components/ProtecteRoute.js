import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ usuario, children }) => {
  return usuario ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
