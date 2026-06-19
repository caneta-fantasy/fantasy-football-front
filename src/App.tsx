import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicRoute from './components/PublicRoute';
import ProtectedLayout from './components/ProtectedLayout';
import RequireAdmin from './components/RequireAdmin';
import Navbar from './components/Navbar';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Welcome from './pages/Welcome';
import Profile from './pages/Profile';
import FantasyLeague from './pages/FantasyLeague';
import AcceptInvite from './pages/AcceptInvite';
import DraftRoomPage from './pages/DraftRoomPage';
import AdminRoundFlowPage from './pages/admin/AdminRoundFlowPage';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : undefined;

  return (
    <Router>
      <Navbar />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/invite/accept" element={<AcceptInvite />} />
          </Route>

          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<div className="App" />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/join" element={<Welcome />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/fantasy-league/:fantasyLeagueId" element={<FantasyLeague currentUserId={currentUserId as number} />} />
            <Route path="/draft/:leagueId/:season/:draftId" element={<DraftRoomPage />} />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<Navigate to="/admin/round-flow" replace />} />
            <Route path="/admin/:tab" element={<AdminRoundFlowPage />} />
          </Route>

          {/* Accessible whether or not the user is logged in (clicked from email) */}
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </Router>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;