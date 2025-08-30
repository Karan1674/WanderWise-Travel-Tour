import './App.css'
import { Routes, Route } from 'react-router-dom';
import ClientLayout from './components/client/layouts/ClientLayout';
import AuthLayout from './components/auth/layouts/AuthLayout';
import Home from './components/client/pages/Home';
import Login from './components/auth/pages/Login';
import Signup from './components/auth/pages/Signup';
import ForgotPassword from './components/auth/pages/ForgotPassword';
import ForgotConfirmation from './components/auth/pages/ForgotConfirmation';
import ResetPassword from './components/auth/pages/ResetPassword';
import NotFound from './components/auth/pages/NotFound';
import RestrictedRoute from './components/auth/RestrictedRoute';
import AdminLayout from './components/admin/layouts/AdminLayout';
import Dashboard from './components/admin/pages/Dashboard';
import UserDashboard from './components/admin/pages/UserDashboard';
import AgentList from './components/admin/pages/AgentList';
import AgentAdd from './components/admin/pages/AgentAdd';
import AgentEdit from './components/admin/pages/AgentEdit';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SignedInUsers from './components/admin/pages/SignedInUsers';


function App() {


  return (
    <>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
        </Route>


        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/db-user-dashboard" element={<UserDashboard />} />
          <Route path="/db-admin-created-agents" element={<AgentList />} />
          <Route path="/new-agent" element={<AgentAdd />} />
          <Route path="/edit-agent" element={<AgentEdit />} />
          <Route path="/db-signed-in-users" element={<SignedInUsers />} />
        </Route>



        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <RestrictedRoute>
                <Login />
              </RestrictedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <RestrictedRoute>
                <Signup />
              </RestrictedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RestrictedRoute>
                <ForgotPassword />
              </RestrictedRoute>
            }
          />
          <Route
            path="/forgot-confirmation"
            element={
              <RestrictedRoute>
                <ForgotConfirmation />
              </RestrictedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <RestrictedRoute>
                <ResetPassword />
              </RestrictedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>



      </Routes>
    </>
  )
}

export default App
