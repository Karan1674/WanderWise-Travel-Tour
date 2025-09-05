import { NavLink } from 'react-router-dom';

function Footer() {
  return (
    <footer id="colophon" className="site-footer footer-primary">
      <div className="top-footer">
        <div className="container">
          <div className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="col-lg-3 col-md-6">
              <aside className="widget widget_text">
                <h3 className="widget-title">About Travel</h3>
                <div className="textwidget widget-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
                </div>
                <div className="award-img">
                  <NavLink to="#">
                    <img src="/assets/images/logo6.png" alt="" />
                  </NavLink>
                  <NavLink to="#">
                    <img src="/assets/images/logo2.png" alt="" />
                  </NavLink>
                </div>
              </aside>
            </div>
            <div className="col-lg-3 col-md-6">
              <aside className="widget widget_text">
                <h3 className="widget-title">CONTACT INFORMATION</h3>
                <div className="textwidget widget-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  <ul>
                    <li>
                      <NavLink to="#">
                        <i className="fas fa-phone-alt"></i> +01 (977) 2599 12
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="#">
                        <i className="fas fa-envelope"></i> company@domain.com
                      </NavLink>
                    </li>
                    <li>
                      <i className="fas fa-map-marker-alt"></i> 3146 Koontz, California
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
            <div className="col-lg-3 col-md-6">
              <aside className="widget widget_newslatter">
                <h3 className="widget-title">SUBSCRIBE US</h3>
                <div className="widget-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </div>
                <form className="newslatter-form" action="/signupUser" method="GET">
                  <input type="email" name="s" placeholder="Your Email.." />
                  <input type="submit" name="s" value="SUBSCRIBE NOW" />
                </form>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <div className="buttom-footer">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-5">
              <div className="footer-menu">
                <ul>
                  <li>
                    <NavLink to="#">Privacy Policy</NavLink>
                  </li>
                  <li>
                    <NavLink to="#">Term & Condition</NavLink>
                  </li>
                  <li>
                    <NavLink to="/faq">FAQ</NavLink>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-md-2 text-center">
              <div className="footer-logo">
                <NavLink to="/">
                  <img src="/assets/images/logoImage2.png" alt="" />
                </NavLink>
              </div>
            </div>
            <div className="col-md-5">
              <div className="copy-right text-right">Copyright © 2021 WanderWise. All rights reserved</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;