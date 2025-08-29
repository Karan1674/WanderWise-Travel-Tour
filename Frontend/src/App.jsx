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
import ErrorPage from './components/auth/pages/ErrorPage';
import NotFound from './components/auth/pages/NotFound';
import RestrictedRoute from './components/auth/RestrictedRoute';
import UserDashboard from './components/client/pages/UserDashboard';
import AdminLayout from './components/admin/layouts/AdminLayout';
import Dashboard from './components/admin/pages/Dashboard';

function App() {
  return (
    <>
     <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/UserDashboard" element={<UserDashboard/>} />
      </Route>


      <Route element={<AdminLayout/>}>
        <Route path="/dashboard" element={<Dashboard/>} />
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
        <Route
          path="/error"
          element={
              <ErrorPage />
          }
        />
      <Route path="*" element={<NotFound />} />
      </Route>

      {/* <Route element={<AdminLayout />}>
        <Route path="/UserDashboard" element={<Dashboard/>} />
      </Route> */}

    </Routes>
    </>
  )
}

export default App
