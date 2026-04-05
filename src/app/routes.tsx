import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

import ProtectedRoute from "@/core/auth/ProtectedRoute";
import Layout from "@/layouts/Layout";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

// Auth — LoginPage stays eager (first thing users see)
import LoginPage from "@/features/auth/LoginPage";

// Lazy-loaded pages
const AccountDeactivated = lazy(() => import("@/features/auth/AccountDeactivated/AccountDeactivated"));
const OfferAgreementPage = lazy(() => import("@/features/auth/OfferAgreementPage/OfferAgreementPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/Dashboard"));
const UsersListPage = lazy(() => import("@/features/users/UsersListPage"));
const UserDetailsPage = lazy(() => import("@/features/users/UserDetails/UserDetailsPage"));
const RolesPage = lazy(() => import("@/features/users/Roles/RolesPage"));
const UnifiedCalendarPage = lazy(() => import("@/features/events/UnifiedCalendarPage/UnifiedCalendarPage"));
const EventDetailRouter = lazy(() => import("@/features/events/EventDetails/EventDetailRouter"));
const CreateEventPage = lazy(() => import("@/features/events/CreateEventPage"));
const BoardsListPage = lazy(() => import("@/features/tasks/BoardsListPage"));
const BoardPage = lazy(() => import("@/features/tasks/Board/BoardPage/BoardPage"));
const KnowledgeLayout = lazy(() => import("@/features/knowledge/KnowledgeLayout/KnowledgeLayout"));
const FinancePage = lazy(() => import("@/features/finance/FinancePage"));
const TransactionsList = lazy(() => import("@/features/finance/TransactionsList"));
const CreateTransaction = lazy(() => import("@/features/finance/CreateTransaction"));
const SalaryPage = lazy(() => import("@/features/salary/SalaryPage"));
const ServersListPage = lazy(() => import("@/features/vision-bot/ServersList/ServersListPage"));
const ServerViewPage = lazy(() => import("@/features/vision-bot/ServerView/ServerViewPage"));
const ModuleEditorPage = lazy(() => import("@/features/vision-bot/ModuleEditor/ModuleEditorPage"));
const SupportLayout = lazy(() => import("@/features/vision-support/SupportLayout"));
const ChatLayout = lazy(() => import("@/features/vision-support/SupportChat/ChatLayout"));
const SubmitForm = lazy(() => import("@/features/forms/SubmitForm/SubmitForm"));
const FormResultsView = lazy(() => import("@/features/forms/FormResultsView/FormResultsView"));
const UserSettingsPage = lazy(() => import("@/features/user-settings/UserSettingsPage"));
const DrivePage = lazy(() => import("@/features/drive/Drive"));
const ChatPage = lazy(() => import("@/features/chat/Chat"));
const NotFound = lazy(() => import("@/layouts/NotFound/NotFound"));
const OrgStructurePage = lazy(() => import("@/features/org-structure/OrgStructurePage"));
const JobsPage = lazy(() => import("@/features/jobs/JobsPage"));
const OAuthCallbackPage = lazy(() => import("@/features/auth/OAuthCallbackPage"));

const EventRedirect = () => {
    const { id } = useParams();
    return <Navigate to={`/calendar/e/${id}`} replace />;
};

const SuspenseFallback = () => (
    <div className="flex items-center justify-center h-screen">
        <LoaderDots />
    </div>
);

export function AppRoutes() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <Routes>
                {/* PUBLIC */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/callback" element={<OAuthCallbackPage />} />
                <Route path="/deactivated" element={<AccountDeactivated />} />
                <Route path="/offer-agreement" element={<OfferAgreementPage />} />
                <Route path="/public/boards/b/:id" element={<BoardPage is_public />} />
                <Route path="/public/boards/b/:id/t/:taskId" element={<BoardPage is_public />} />
                <Route path="/jobs/:slug?" element={<JobsPage />} />

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
                            <Route path="roles" element={<RolesPage />} />
                            <Route path="u/:id" element={<UserDetailsPage />} />
                        </Route>

                        {/* org structure */}
                        <Route path="org-structure" element={<OrgStructurePage />} />

                        {/* calendar (unified) */}
                        <Route path="calendar">
                            <Route index element={<UnifiedCalendarPage />} />
                            <Route path="e/:id" element={<EventDetailRouter />} />
                            <Route path="create" element={<CreateEventPage />} />
                        </Route>

                        {/* legacy events redirects */}
                        <Route path="events">
                            <Route index element={<Navigate to="/calendar" replace />} />
                            <Route path="list" element={<Navigate to="/calendar" replace />} />
                            <Route path="e/:id" element={<EventRedirect />} />
                            <Route path="create-event" element={<Navigate to="/calendar/create" replace />} />
                        </Route>

                        {/* boards */}
                        <Route path="boards">
                            <Route index element={<Navigate to="list" replace />} />
                            <Route path="list" element={<BoardsListPage />} />
                            <Route path="b/:id" element={<BoardPage is_public={false} />} />
                            <Route path="b/:id/t/:taskId" element={<BoardPage is_public={false} />} />
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
                        <Route path="chat">
                            <Route index element={<ChatPage />} />
                            <Route path=":chatId" element={<ChatPage />} />
                        </Route>

                    </Route>
                </Route>

                {/* FALLBACK */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}








