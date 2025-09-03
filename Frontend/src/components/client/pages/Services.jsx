
function Services() {

  return (
    <>
      <section className="inner-banner-wrap">
        <div className="inner-baner-container" style={{ backgroundImage: 'url(/assets/images/inner-banner.jpg)' }}>
          <div className="container">
            <div className="inner-banner-content">
              <h1 className="inner-title">Services</h1>
            </div>
          </div>
        </div>
        <div className="inner-shape"></div>
      </section>
      <div className="service-page-section">
        <div className="container">
          <div className="row">
            {[
              {
                count: '01.',
                title: 'Travel Insurance',
                desc: 'Porro ipsum amet eiusmod, quae voluptate, architecto posuere risus imperdiet gravida porttitor, penatibus nemo dictumst quasi habitant ut mollit.',
                img: '/assets/images/img30.jpg',
              },
              {
                count: '02.',
                title: 'Handpicked Hotels',
                desc: 'Porro ipsum amet eiusmod, quae voluptate, architecto posuere risus imperdiet gravida porttitor, penatibus nemo dictumst quasi habitant ut mollit.',
                img: '/assets/images/img31.jpg',
              },
              {
                count: '03.',
                title: 'Accessibility',
                desc: 'Porro ipsum amet eiusmod, quae voluptate, architecto posuere risus imperdiet gravida porttitor, penatibus nemo dictumst quasi habitant ut mollit.',
                img: '/assets/images/img32.jpg',
              },
              {
                count: '04.',
                title: '24/7 Support',
                desc: 'Porro ipsum amet eiusmod, quae voluptate, architecto posuere risus imperdiet gravida porttitor, penatibus nemo dictumst quasi habitant ut mollit.',
                img: '/assets/images/img33.jpg',
              },
            ].map((service, index) => (
              <div className="col-md-6" key={index}>
                <div className="service-content-wrap">
                  <div className="service-content">
                    <div className="service-header">
                      <span className="service-count">{service.count}</span>
                      <h3>{service.title}</h3>
                    </div>
                    <p>{service.desc}</p>
                  </div>
                  <figure className="service-img">
                    <img src={service.img} alt="" />
                  </figure>
                </div>
              </div>
            ))}
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

    </>
  );
}

export default Services;