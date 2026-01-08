import React from "react";
import ReactDOM from "react-dom/client";

import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import { AuthProvider } from "./components/System/AuthContext";
import ProtectedRoute from "./components/System/ProtectedRoute";

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

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/deactivated" element={<AccountDeactivated />} />
                    <Route path="/offer-agreement" element={<OfferAgreementPage />} />

                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>

                    {/*profile*/}
                    {/*<Route path="/my/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />*/}

                    {/*users*/}
                    <Route path="/users" element={<ProtectedRoute><Navigate to="/users/list" replace /></ProtectedRoute>} />
                    <Route path="/users/list" element={<ProtectedRoute><UsersListPage /></ProtectedRoute>} />
                    <Route path="/users/add-user" element={<ProtectedRoute><CreateUserPage /></ProtectedRoute>} />
                    <Route path="/users/u/:id" element={<ProtectedRoute><UserDetailsPage /></ProtectedRoute>} />

                    {/*calendar*/}
                    <Route path="/calendar" element={<ProtectedRoute><CalendarTimeline /></ProtectedRoute>} />
                    <Route path="/calendar/e/:id" element={<ProtectedRoute><PublicEventDetails /></ProtectedRoute>} />

                    {/*events*/}
                    <Route path="/events" element={<ProtectedRoute><Navigate to="/events/list" replace /></ProtectedRoute>} />
                    <Route path="/events/list" element={<ProtectedRoute><EventsListPage /></ProtectedRoute>} />
                    <Route path="/events/e/:id" element={<ProtectedRoute><ModerateEventDetails /></ProtectedRoute>} />
                    <Route path="/events/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />

                    {/*boards*/}
                    <Route path="/boards" element={<ProtectedRoute><Navigate to="/boards/list" replace /></ProtectedRoute>} />
                    <Route path="/boards/list" element={<ProtectedRoute><BoardsListPage /></ProtectedRoute>} />
                    <Route path="/boards/b/:id" element={<ProtectedRoute><BoardPage is_public={false} /></ProtectedRoute>} />
                    <Route path="/boards/create-board" element={<ProtectedRoute><CreateBoardPage /></ProtectedRoute>} />

                    <Route path="/public/boards/b/:id" element={<BoardPage is_public={true} />} />

                    {/*knowledge*/}
                    <Route path="/knowledge" element={<ProtectedRoute><KnowledgeLayout /></ProtectedRoute>} />
                    <Route path="/knowledge/d/:id" element={<ProtectedRoute><KnowledgeLayout /></ProtectedRoute>} />
                    <Route path="/knowledge/d/:id/edit" element={<ProtectedRoute><KnowledgeLayout /></ProtectedRoute>} />

                    {/*salary*/}
                    <Route path="/salary" element={<ProtectedRoute><SalaryPage /></ProtectedRoute>} />

                    {/*finance*/}
                    <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
                    {/*transactions*/}
                    <Route path="/finance/transactions" element={<ProtectedRoute><Navigate to="/finance/transactions/list" replace /></ProtectedRoute>} />
                    <Route path="/finance/transactions/list" element={<ProtectedRoute><TransactionsList /></ProtectedRoute>} />
                    <Route path="/finance/transactions/create" element={<ProtectedRoute><CreateTransaction /></ProtectedRoute>} />

                    {/*vision-bot*/}
                    <Route path="/vision-bot" element={<ProtectedRoute><Navigate to="/vision-bot/servers" replace /></ProtectedRoute>} />
                    <Route path="/vision-bot/servers" element={<ProtectedRoute><ServersListPage /></ProtectedRoute>} />
                    <Route path="/vision-bot/s/:guildId" element={<ProtectedRoute><ServerViewPage /></ProtectedRoute>} />
                    <Route path="/vision-bot/s/:guildId/m/:moduleId" element={<ProtectedRoute><ModuleEditorPage /></ProtectedRoute>} />

                    {/* vision-support */}
                    <Route path="vision-support" element={<ProtectedRoute><SupportLayout /></ProtectedRoute>}>
                        {/* <Route index element={<EmptySupport />} /> */}
                        <Route path=":telegramUserId" element={<ChatLayout />} />
                    </Route>

                    {/* forms */}
                    <Route path="/forms/f/:formId/results" element={<ProtectedRoute><FormResultsView /></ProtectedRoute>} />
                    <Route path="/form/:formSlug">
                        <Route index element={<Navigate to="submit" replace />} />
                        <Route
                            path="submit"
                            element={
                                <ProtectedRoute>
                                    <SubmitForm />
                                </ProtectedRoute>
                            }
                        />
                    </Route>


                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
