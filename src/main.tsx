import React from "react";
import ReactDOM from "react-dom/client";

import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import { AuthProvider } from "./components/System/AuthContext";
import ProtectedRoute from "./components/System/ProtectedRoute";

import Layout from "@/components/Layout/Layout";

import Login from "./components/Pages/auth/Login/LoginPage.tsx";

import UsersListPage from "./components/Pages/Users/UsersListPage.tsx";
import CreateUserPage from "./components/Pages/Users/CreateUserPage.tsx";
import UserDetailsPage from "./components/Pages/Users/UserDetails/UserDetailsPage.tsx";
import CreateEventPage from "./components/Pages/Events/CreateEventPage.tsx";
import EventsListPage from "./components/Pages/Events/EventsListPage.tsx";
import AccountDeactivated from "./components/Pages/auth/AccountDeactivated/AccountDeactivated.tsx";

import BoardsListPage from "./components/Pages/Tasks/BoardsListPage.tsx";
import BoardPage from "./components/Pages/Tasks/Board/BoardPage/BoardPage.tsx";
import CalendarTimeline from "./components/Pages/Events/CalendarTimeline/CalendarTimeline.tsx";
import PublicEventDetails from "./components/Pages/Events/EventDetails/PublicEventDetails.tsx";
import CreateBoardPage from "./components/Pages/Tasks/CreateBoardPage.tsx";
import DashboardPage from "./components/Pages/Dashboard/Dashboard.tsx";
import KnowledgeLayout from "./components/Pages/Knowledge/KnowledgeLayout/KnowledgeLayout.tsx";
import ModerateEventDetails from "./components/Pages/Events/EventDetails/ModerateEventDetails.tsx";
import OfferAgreementPage from "./components/Pages/auth/OfferAgreementPage/OfferAgreementPage.tsx";
import SalaryPage from "./components/Pages/Salary/SalaryPage.tsx";
import NotFound from "./components/Layout/NotFound/NotFound.tsx";
import FinancePage from "./components/Pages/Finance/FinancePage.tsx";
import TransactionsList from "./components/Pages/Finance/TransactionsList.tsx";
import CreateTransaction from "./components/Pages/Finance/CreateTransaction.tsx";
import ServersListPage from "./components/Pages/vision-bot/ServersList/ServersListPage.tsx";
import ServerViewPage from "./components/Pages/vision-bot/ServerView/ServerViewPage.tsx";
import ModuleEditorPage from "./components/Pages/vision-bot/ModuleEditor/ModuleEditorPage.tsx";
import SupportLayout from "./components/Pages/vision-support/SupportLayout.tsx";
import ChatLayout from "./components/Pages/vision-support/SupportChat/ChatLayout.tsx";
import SubmitForm from "./components/Pages/forms/SubmitForm/SubmitForm.tsx";
import FormResultsView from "./components/Pages/forms/FormResultsView/FormResultsView.tsx";

import "./styles/globals.css";
import UserSettingsPage from "@/components/Pages/UserSettings/UserSettingsPage.tsx";
import DrivePage from "@/components/Pages/Drive/Drive.tsx";
import ChatPage from "@/components/Pages/Chat/Chat.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>

                    {/* PUBLIC */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/deactivated" element={<AccountDeactivated />} />
                    <Route path="/offer-agreement" element={<OfferAgreementPage />} />
                    <Route path="/public/boards/b/:id" element={<BoardPage is_public />} />

                    {/* PROTECTED */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>

                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardPage />} />

                            {/* me */}
                            <Route path="me">
                                <Route path="settings" element={<UserSettingsPage />} />
                            </Route>

                            {/* users */}
                            <Route path="users">
                                <Route index element={<Navigate to="list" replace />} />
                                <Route path="list" element={<UsersListPage />} />
                                <Route path="add-user" element={<CreateUserPage />} />
                                <Route path="u/:id" element={<UserDetailsPage />} />
                            </Route>

                            {/* calendar */}
                            <Route path="calendar" element={<CalendarTimeline />} />
                            <Route path="calendar/e/:id" element={<PublicEventDetails />} />

                            {/* events */}
                            <Route path="events">
                                <Route index element={<Navigate to="list" replace />} />
                                <Route path="list" element={<EventsListPage />} />
                                <Route path="e/:id" element={<ModerateEventDetails />} />
                                <Route path="create-event" element={<CreateEventPage />} />
                            </Route>

                            {/* boards */}
                            <Route path="boards">
                                <Route index element={<Navigate to="list" replace />} />
                                <Route path="list" element={<BoardsListPage />} />
                                <Route path="b/:id" element={<BoardPage is_public={false} />} />
                                <Route path="create-board" element={<CreateBoardPage />} />
                            </Route>

                            {/* knowledge */}
                            <Route path="knowledge">
                                <Route index element={<KnowledgeLayout />} />
                                <Route path="d/:id" element={<KnowledgeLayout />} />
                                <Route path="d/:id/edit" element={<KnowledgeLayout />} />
                            </Route>

                            {/* salary */}
                            <Route path="salary" element={<SalaryPage />} />

                            {/* finance */}
                            <Route path="finance">
                                <Route index element={<FinancePage />} />
                                <Route path="transactions">
                                    <Route index element={<Navigate to="list" replace />} />
                                    <Route path="list" element={<TransactionsList />} />
                                    <Route path="create" element={<CreateTransaction />} />
                                </Route>
                            </Route>

                            {/* vision-bot */}
                            <Route path="vision-bot">
                                <Route index element={<Navigate to="servers" replace />} />
                                <Route path="servers" element={<ServersListPage />} />
                                <Route path="s/:guildId" element={<ServerViewPage />} />
                                <Route path="s/:guildId/m/:moduleId" element={<ModuleEditorPage />} />
                            </Route>

                            {/* vision-support */}
                            <Route path="vision-support" element={<SupportLayout />}>
                                <Route path=":telegramUserId" element={<ChatLayout />} />
                            </Route>

                            {/* forms */}
                            <Route path="forms/f/:formId/results" element={<FormResultsView />} />
                            <Route path="form/:formSlug/submit" element={<SubmitForm />} />

                            {/* drive */}
                            <Route path="drive/*" element={<DrivePage />} />

                            {/* chat */}
                            <Route path="chat" element={<ChatPage />} />

                        </Route>
                    </Route>

                    {/* FALLBACK */}
                    <Route path="*" element={<NotFound />} />

                </Routes>
            </AuthProvider>
        </BrowserRouter>

    </React.StrictMode>
);
