import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, userType } = useSelector((state) => state.auth);

  if (!user || !userType) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userType)) {
    return <Navigate to="/error" />;
  }

  return children;
}

export default ProtectedRoute;