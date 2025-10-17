import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/System/AuthContext";
import ProtectedRoute from "./components/System/ProtectedRoute";
import Dashboard from "./components/Pages/Dashboard/DashboardPage.tsx";
import Login from "./components/Pages/Login/LoginPage.tsx";

import "./global.css";

import UsersIndex from "./components/Pages/Users";
import UsersListPage from "./components/Pages/Users/UsersListPage.tsx";
import CreateUserPage from "./components/Pages/Users/CreateUserPage.tsx";
import UserDetailsPage from "./components/Pages/Users/UserDetailsPage.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>

                    <Route path="/users" element={<ProtectedRoute><UsersIndex /></ProtectedRoute>} />
                    <Route path="/users/list" element={<ProtectedRoute><UsersListPage /></ProtectedRoute>} />
                    <Route path="/users/add-user" element={<ProtectedRoute><CreateUserPage /></ProtectedRoute>} />
                    <Route path="/users/u/:id/details" element={<ProtectedRoute><UserDetailsPage /></ProtectedRoute>} />


                    <Route path="*" element={<div>404</div>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
