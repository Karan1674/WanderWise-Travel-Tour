import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function RestrictedRoute({ children }) {
  const { user, userType } = useSelector((state) => state.auth);

  if (user && userType) {
    return <Navigate to={userType === 'User' ? '/' : '/dashboard'} />;
  }

  return children;
}

export default RestrictedRoute;