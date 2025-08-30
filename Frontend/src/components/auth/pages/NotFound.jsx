import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className='client-layout'>
      <div className="no-content-section 404-page" style={{
        backgroundImage: `url(/assets/images/404-img.jpg)`,
        minHeight: "100vh"
      }} >

        <div className="container">
          <div className="no-content-wrap">
            <span>404</span>
            <h1>Oops! That page can't be found</h1>
            <h4>It looks like nothing was found at this location.</h4>
            <div className="form-group">
              <Link to="/" className="button-primary">Back to Home</Link>
            </div>
          </div>
        </div>
        <div className="overlay"></div>
      </div>
    </div>
  );
}

export default NotFound;