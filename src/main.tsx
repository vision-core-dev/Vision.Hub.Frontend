import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { AuthProvider } from "./components/System/AuthContext";
import ProtectedRoute from "./components/System/ProtectedRoute";
import Dashboard from "./components/Pages/Dashboard/DashboardPage.tsx";
import Login from "./components/Pages/auth/Login/LoginPage.tsx";

import UsersListPage from "./components/Pages/Users/UsersListPage.tsx";
import CreateUserPage from "./components/Pages/Users/CreateUserPage.tsx";
import UserDetailsPage from "./components/Pages/Users/UserDetails/UserDetailsPage.tsx";
import CreateEventPage from "./components/Pages/Events/CreateEventPage.tsx";
import EventsListPage from "./components/Pages/Events/EventsListPage.tsx";
import AccountDeactivated from "./components/Pages/auth/AccountDeactivated/AccountDeactivated.tsx";

import "./global.css";
import BoardsListPage from "./components/Pages/Tasks/BoardsListPage.tsx";
import BoardPage from "./components/Pages/Tasks/Board/BoardPage/BoardPage.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/deactivated" element={<AccountDeactivated />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>

                    {/*users*/}
                    <Route path="/users" element={<ProtectedRoute><Navigate to="/users/list" replace /></ProtectedRoute>} />
                    <Route path="/users/list" element={<ProtectedRoute><UsersListPage /></ProtectedRoute>} />
                    <Route path="/users/add-user" element={<ProtectedRoute><CreateUserPage /></ProtectedRoute>} />
                    <Route path="/users/u/:id" element={<ProtectedRoute><UserDetailsPage /></ProtectedRoute>} />

                    {/*events*/}
                    <Route path="/events" element={<ProtectedRoute><Navigate to="/events/list" replace /></ProtectedRoute>} />
                    <Route path="/events/list" element={<ProtectedRoute><EventsListPage /></ProtectedRoute>} />
                    <Route path="/events/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />

                    {/*boards*/}
                    <Route path="/boards" element={<ProtectedRoute><Navigate to="/boards/list" replace /></ProtectedRoute>} />
                    <Route path="/boards/list" element={<ProtectedRoute><BoardsListPage /></ProtectedRoute>} />
                    <Route path="/boards/b/:id" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />

                    <Route path="*" element={<div>404</div>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
