import { useLocation, Link } from 'react-router-dom';

function ErrorPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const status = params.get('status') || '500';
  const message = params.get('message') || 'Something Went Wrong';

  return (
    <div className="error-page" style={{ backgroundImage: `url(/assets/images/bg.jpg)` }}>
      <div className="error-from-wrap">
        <div className="error-content text-center">
          <h1 className="site-title">
            <Link to="/">
              <img src="/assets/images/logoImage1.png" alt="Site Logo" />
            </Link>
          </h1>
          <h2 className="error-code">{status}</h2>
          <h3 className="error-message">{message}</h3>
          <p>Sorry, an error has occurred. Please try again or return to the home page.</p>
          <div className="form-group">
            <Link to="/" className="button-primary w-100">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;