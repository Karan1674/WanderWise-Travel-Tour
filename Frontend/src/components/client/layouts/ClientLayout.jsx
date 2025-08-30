import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Loader from './Loader.jsx';
import Footer from './Footer.jsx';
import '../../../styles/client.scss'
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();

  useEffect(() => {
    if (window.runCustomInit) {
      window.runCustomInit();
    }
  }, [location]);


  return (
    <div className='client-layout'>
      {/* <Loader /> */}
      <div id="page" className="full-page">
        <Header />
        <main id="content" className="site-main">
          <Outlet />
        </main>
        <Footer />
        <a id="backTotop" href="#" className="to-top-icon">
          <i className="fas fa-chevron-up"></i>
        </a>
        <div className="header-search-form">
          <div className="container">
            <div className="header-search-container">
              <form className="search-form" role="search" method="get">
                <input type="text" name="s" placeholder="Enter your text..." />
              </form>
              <a href="#" className="search-close">
                <i className="fas fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;