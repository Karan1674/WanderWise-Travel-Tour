import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Loader from './Loader.jsx';
import Footer from './Footer.jsx';
import '../../../styles/client.scss'


function Layout() {


  return (
    <div className='client-layout'>
      {/* <Loader /> */}
      <div id="page" className="full-page">
        <Header />
        <main id="content" className="site-main">
          <Outlet />
        </main>
        <Footer />
   
      </div>
    </div>
  );
}

export default Layout;