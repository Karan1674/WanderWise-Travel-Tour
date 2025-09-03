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
import ApplicationList from './components/admin/pages/ApplicationList';
import ApplicationDetail from './components/admin/pages/ApplicationDetail';
import EnquiryDashboard from './components/admin/pages/EnquiryDashboard';
import FaqEnquiry from './components/admin/pages/FaqEnquiry';
import ContactEnquiry from './components/admin/pages/ContactEnquiry';

import Destination from './components/client/pages/Destination.jsx';
import TourPackages from './components/client/pages/TourPackages.jsx';
import TourDetail from './components/client/pages/TourDetail.jsx';
import WishlistPage from './components/client/pages/WishlistPage.jsx';
import PackageOfferPage from './components/client/pages/PackageOfferPage';
import PackageCartPage from './components/client/pages/PackageCartPage';
import BookingPage from './components/client/pages/BookingPage';
import BookingConfirmation from './components/client/pages/BookingConfirmation';
import UserPackageBookings from './components/client/pages/UserPackageBookings';
import UserProfile from './components/client/pages/UserProfile';
import Services from './components/client/pages/Services';
import About from './components/client/pages/About';
import Careers from './components/client/pages/Careers';
import CareerDetailSingle from './components/client/pages/CareerDetailSIngle';
import AppliedCareers from './components/client/pages/AppliedCareers';
import ContinueReading from './components/client/pages/ContinueReading';
import Faq from './components/client/pages/Faq';
import Testimonials from './components/client/pages/Testimonials';
import Contact from './components/client/pages/Contact';


function App() {


  return (
    <>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
            <Route path="/destination" element={<Destination />} />
            <Route path="/tour-packages" element={<TourPackages />} />
            <Route path="/package-offer" element={<PackageOfferPage/>} />
            <Route path="/package-detail/:id" element={<TourDetail />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/package-cart" element={<PackageCartPage/>} />
            <Route path="/packageCart/checkout" element={<BookingPage/>} />
            <Route path="/bookPackage/:packageId" element={<BookingPage/>} />
            <Route path="/confirmation/:bookingId" element={<BookingConfirmation/> } />
            <Route path="/userBookingPage" element={<UserPackageBookings/> } />
            <Route path="/user-profile" element={<UserProfile/> } />
            <Route path="/about" element={<About/> } />
            <Route path="/services" element={<Services/> } />
            <Route path="/careers" element={<Careers/> } />
            <Route path="/careers/:id" element={<CareerDetailSingle/> } />
            <Route path="/applied-careers" element={<AppliedCareers/> } />
            <Route path="/continueReading" element={<ContinueReading/> } />
            <Route path="/faq" element={<Faq/> } />
            <Route path="/testimonials" element={<Testimonials/> } />
            <Route path="/contact" element={<Contact/> } />
        </Route>


        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/db-user-dashboard" element={<UserDashboard />} />
          <Route path="/db-admin-created-agents" element={<AgentList />} />
          <Route path="/new-agent" element={<AgentAdd />} />
          <Route path="/edit-agent" element={<AgentEdit />} />
          <Route path="/db-signed-in-users" element={<SignedInUsers />} />
          <Route path="/db-package-dashboard" element={<PackagesList />} />
          <Route path="/db-add-package" element={<PackageAdd />} />
          <Route path="/edit-package/:id" element={<PackageEdit />} />
          <Route path="/package-preview/:id" element={<PackageDetail />} />
          <Route path="/admin-agent-profile" element={<AdminAgentProfile />} />
          <Route path="/db-bookings" element={<PackageBookingList />} />
          <Route path="/package-booking/edit/:bookingId" element={<PackageBookingEdit />} />
          <Route path="/coupon-list" element={<CouponList />} />
          <Route path="/new-coupon" element={<CouponAdd />} />
          <Route path="/coupon-details/:couponId" element={<CouponDetails />} />
          <Route path="/edit-coupon/:couponId" element={<CouponEdit />} />
          <Route path="/career-list" element={<CareerList />} />
          <Route path="/add-career" element={<CareerAdd />} />
          <Route path="/career-detail/:careerId" element={<CareerDetail />} />
          <Route path="/edit-career/:editCareerId" element={<CareerEdit />} />
          <Route path="/application-list" element={<ApplicationList />} />
          <Route path="/application-detail/:id" element={<ApplicationDetail />} />
          <Route path="/enquiryDashboard" element={<EnquiryDashboard />} />
          <Route path="/faq-enquiry" element={<FaqEnquiry />} />
          <Route path="/contact-enquiry" element={<ContactEnquiry />} />
        </Route>


        <Route element={<AuthLayout />}>
          <Route path="/login" element={<RestrictedRoute><Login /></RestrictedRoute>} />
          <Route path="/signup" element={<RestrictedRoute><Signup /></RestrictedRoute>} />
          <Route path="/forgot-password" element={<RestrictedRoute> <ForgotPassword /> </RestrictedRoute>} />
          <Route path="/forgot-confirmation" element={<RestrictedRoute><ForgotConfirmation /></RestrictedRoute>} />
          <Route path="/reset-password" element={<RestrictedRoute><ResetPassword /></RestrictedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
    </>
  )
}

export default App
