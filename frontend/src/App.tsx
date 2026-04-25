import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import TrainingPage from './pages/TrainingPage';
import MissionsPage from './pages/MissionsPage';
import ShopPage from './pages/ShopPage';
import ChatPage from './pages/ChatPage';
import FriendsPage from './pages/FriendsPage';
import DuelsPage from './pages/DuelsPage';
import GuildsPage from './pages/GuildsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import GradesPage from './pages/GradesPage';
import PrivateChatPage from './pages/PrivateChatPage';
import BadgesPage from './pages/BadgesPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoutes() {
  const { isAdmin } = useAuth();
  return (
    <GameProvider>
      <Layout isAdmin={isAdmin} />
    </GameProvider>
  );
}

function AdminRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return (
    <GameProvider>
      <AdminPage />
    </GameProvider>
  );
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<ProtectedRoutes />}>
        <Route index element={<DashboardPage />} />
        <Route path="entrainement" element={<TrainingPage />} />
        <Route path="quiz/:chapterId" element={<QuizPage />} />
        <Route path="missions" element={<MissionsPage />} />
        <Route path="boutique" element={<ShopPage />} />
        <Route path="foyer" element={<ChatPage />} />
        <Route path="amis" element={<FriendsPage />} />
        <Route path="duels" element={<DuelsPage />} />
        <Route path="guildes" element={<GuildsPage />} />
        <Route path="classement" element={<LeaderboardPage />} />
        <Route path="profil/:name" element={<ProfilePage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="chat/:name" element={<PrivateChatPage />} />
        <Route path="admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
