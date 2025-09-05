import { NavLink } from "react-router-dom";


function About() {
  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">About Us</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <section className="about-section about-page-section">
        <div className="about-service-wrap">
          <div className="container">
            <div className="section-heading">
              <div className="row align-items-end">
                <div className="col-lg-6">
                  <h5 className="dash-style">OUR TOUR GALLERY</h5>
                  <h2>HELLO. OUR AGENCY HAS BEEN PRESENT BEST IN THE MARKET</h2>
                </div>
                <div className="col-lg-6">
                  <div className="section-disc">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                      ullamcorper mattis, pulvinar dapibus leo. Placeat nostrud natus tempora justo.
                      Laboriosam, eget mus nostrud natus tempora.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consec tetur adipiscing eliting dolor sit amet. Placeat
                      nostrud natus tempora justo nostrud natus tempora.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-service-container">
              <div className="row">
                <div className="col-lg-4">
                  <div className="about-service">
                    <div className="about-service-icon">
                      <img src="/assets/images/icon15.png" alt="" />
                    </div>
                    <div className="about-service-content">
                      <h4>AFFORDABLE PRICE</h4>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="about-service">
                    <div className="about-service-icon">
                      <img src="/assets/images/icon16.png" alt="" />
                    </div>
                    <div className="about-service-content">
                      <h4>BEST DESTINATION</h4>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="about-service">
                    <div className="about-service-icon">
                      <img src="/assets/images/icon17.png" alt="" />
                    </div>
                    <div className="about-service-content">
                      <h4>PERSONAL SERVICE</h4>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-video-wrap" style={{ backgroundImage: 'url(/assets/images/img25.jpg)' }}>
              <div className="video-button">
                <NavLink id="video-container" data-video-id="IUN664s7N-c">
                  <i className="fas fa-play"></i>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
        <div className="client-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                <div className="section-heading text-center">
                  <h5 className="dash-style">OUR ASSOCIATES</h5>
                  <h2>PARTNER'S AND CLIENTS</h2>
                  <p>
                    Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid
                    blandit, blandit torquent, odit placeat. Adipiscing repudiandae eius cursus? Nostrum
                    magnis maxime curae placeat.
                  </p>
                </div>
              </div>
            </div>
            <div className="client-wrap client-slider">
              {['logo7.png', 'logo8.png', 'logo9.png', 'logo10.png', 'logo11.png', 'logo8.png'].map(
                (logo, index) => (
                  <div className="client-item" key={index}>
                    <figure>
                      <img src={`/assets/images/${logo}`} alt="" />
                    </figure>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        <div className="fullwidth-callback" style={{ backgroundImage: 'url(/assets/images/img26.jpg)' }}>
          <div className="container">
            <div className="section-heading section-heading-white text-center">
              <div className="row">
                <div className="col-lg-8 offset-lg-2">
                  <h5 className="dash-style">CALLBACK FOR MORE</h5>
                  <h2>GO TRAVEL. DISCOVER. REMEMBER US!!</h2>
                  <p>
                    Mollit voluptatem perspiciatis convallis elementum corporis quo veritatis aliquid
                    blandit, blandit torquent, odit placeat. Adipiscing repudiandae eius cursus? Nostrum
                    magnis maxime curae placeat.
                  </p>
                </div>
              </div>
            </div>
            <div className="callback-counter-wrap">
              {[
                { icon: 'icon1.png', count: '500', text: 'Satisfied Clients' },
                { icon: 'icon2.png', count: '250', text: 'Awards Achieve' },
                { icon: 'icon3.png', count: '15', text: 'Active Members' },
                { icon: 'icon4.png', count: '10', text: 'Tour Destination' },
              ].map((item, index) => (
                <div className="counter-item" key={index}>
                  <div className="counter-item-inner">
                    <div className="counter-icon">
                      <img src={`/assets/images/${item.icon}`} alt="" />
                    </div>
                    <div className="counter-content">
                      <span className="counter-no">
                        <span className="counter">{item.count}</span>K+
                      </span>
                      <span className="counter-text">{item.text}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

export default About;