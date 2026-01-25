import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "@/core/auth/ProtectedRoute";

import Layout from "@/layouts/Layout";

// Auth
import LoginPage from "@/features/auth/LoginPage";
import AccountDeactivated from "@/features/auth/AccountDeactivated/AccountDeactivated";
import OfferAgreementPage from "@/features/auth/OfferAgreementPage/OfferAgreementPage";

// Dashboard
import DashboardPage from "@/features/dashboard/Dashboard";

// Users
import UsersListPage from "@/features/users/UsersListPage";
import UserDetailsPage from "@/features/users/UserDetails/UserDetailsPage";

// Events
import EventsListPage from "@/features/events/EventsListPage";
import CalendarTimeline from "@/features/events/CalendarTimeline/CalendarTimeline";
import PublicEventDetails from "@/features/events/EventDetails/PublicEventDetails";
import ModerateEventDetails from "@/features/events/EventDetails/ModerateEventDetails";

// Tasks
import BoardsListPage from "@/features/tasks/BoardsListPage";
import BoardPage from "@/features/tasks/Board/BoardPage/BoardPage";

// Knowledge
import KnowledgeLayout from "@/features/knowledge/KnowledgeLayout/KnowledgeLayout";

// Finance
import FinancePage from "@/features/finance/FinancePage";
import TransactionsList from "@/features/finance/TransactionsList";
import CreateTransaction from "@/features/finance/CreateTransaction";

// Salary
import SalaryPage from "@/features/salary/SalaryPage";

// Vision Bot
import ServersListPage from "@/features/vision-bot/ServersList/ServersListPage";
import ServerViewPage from "@/features/vision-bot/ServerView/ServerViewPage";
import ModuleEditorPage from "@/features/vision-bot/ModuleEditor/ModuleEditorPage";

// Vision Support
import SupportLayout from "@/features/vision-support/SupportLayout";
import ChatLayout from "@/features/vision-support/SupportChat/ChatLayout";

// Forms
import SubmitForm from "@/features/forms/SubmitForm/SubmitForm";
import FormResultsView from "@/features/forms/FormResultsView/FormResultsView";

// User Settings
import UserSettingsPage from "@/features/user-settings/UserSettingsPage";

// Drive
import DrivePage from "@/features/drive/Drive";

// Chat
import ChatPage from "@/features/chat/Chat";

// Layouts
import NotFound from "@/layouts/NotFound/NotFound";
import CreateEventPage from "@/features/events/CreateEventPage";

// Org Structure
import OrgStructurePage from "@/features/org-structure/OrgStructurePage";

export function AppRoutes() {
    return (
        <Routes>
            {/* PUBLIC */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/deactivated" element={<AccountDeactivated />} />
            <Route path="/offer-agreement" element={<OfferAgreementPage />} />
            <Route path="/public/boards/b/:id" element={<BoardPage is_public />} />

            {/* PROTECTED */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>

                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />

                    {/* me */}
                    <Route path="my">
                        <Route path="settings" element={<UserSettingsPage />} />
                        <Route path="salary" element={<SalaryPage />} />
                    </Route>

                    {/* users */}
                    <Route path="users">
                        <Route index element={<Navigate to="list" replace />} />
                        <Route path="list" element={<UsersListPage />} />
                        <Route path="u/:id" element={<UserDetailsPage />} />
                    </Route>

                    {/* org structure */}
                    <Route path="org-structure" element={<OrgStructurePage />} />

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
                    </Route>

                    {/* knowledge */}
                    <Route path="knowledge">
                        <Route index element={<KnowledgeLayout />} />
                        <Route path="d/:id" element={<KnowledgeLayout />} />
                        <Route path="d/:id/edit" element={<KnowledgeLayout />} />
                    </Route>

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
    );
}








