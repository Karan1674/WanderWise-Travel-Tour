import { Outlet } from 'react-router-dom';
import '../../../styles/client.scss'
import '../../../styles/admin.scss'


function AuthLayout() {
  return (
    <div className="admin-layout">
      <Outlet />
    </div>
  );
}

export default AuthLayout;