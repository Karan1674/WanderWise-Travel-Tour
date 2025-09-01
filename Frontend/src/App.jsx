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
import PackagesList from './components/admin/pages/PackagesList';
import PackageAdd from './components/admin/pages/PackageAdd';
import PackageEdit from './components/admin/pages/PackageEdit';
import PackageDetail from './components/admin/pages/PackageDetail';
import AdminAgentProfile from './components/admin/pages/AdminAgentProfile';
import PackageBookingList from './components/admin/pages/PackageBookingList';
import PackageBookingEdit from './components/admin/pages/PackageBookingEdit';
import CouponList from './components/admin/pages/CouponList';
import CouponAdd from './components/admin/pages/CouponAdd';
import CouponDetails from './components/admin/pages/CouponDetails';
import CouponEdit from './components/admin/pages/CouponEdit';
import CareerList from './components/admin/pages/CareerList';
import CareerAdd from './components/admin/pages/CareerAdd';
import CareerDetail from './components/admin/pages/CareerDetail';
import CareerEdit from './components/admin/pages/CareerEdit';

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
          <Route path="/db-package-dashboard" element={<PackagesList/>} />
          <Route path="/db-add-package" element={<PackageAdd/>} />
          <Route path="/edit-package/:id" element={<PackageEdit/>} />
          <Route path="/package-preview/:id" element={<PackageDetail/>} />
          <Route path="/admin-agent-profile" element={<AdminAgentProfile/>} />
          <Route path="/db-bookings" element={<PackageBookingList/>} />
          <Route path="/package-booking/edit/:id" element={<PackageBookingEdit/>} />
          <Route path="/coupon-list" element={<CouponList/>} />
          <Route path="/new-coupon" element={<CouponAdd/>} />
          <Route path="/coupon-details/:couponId" element={<CouponDetails/>} />
          <Route path="/edit-coupon/:couponId" element={<CouponEdit/>} />
          <Route path="/career-list" element={<CareerList/>} />
          <Route path="/add-career" element={<CareerAdd/>} />
          <Route path="/career-detail/:careerId" element={<CareerDetail/>} />
          <Route path="/edit-career/:editCareerId" element={<CareerEdit/>} />
          
          
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
