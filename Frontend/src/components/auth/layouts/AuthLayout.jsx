import { Outlet } from 'react-router-dom';
import '../../../styles/admin.scss'
import '../../../styles/client.scss'
function AuthLayout() {
  return (
    <div className="admin-layout">
      <Outlet />
    </div>
  );
}

export default AuthLayout;