import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';


const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allPackages } = useSelector((state) => state.packages);
  const [packageData, setPackageData] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const pkg = allPackages.find((p) => p._id === id);
        if (pkg) {
          setPackageData(pkg);
          console.log('Loaded package from Redux:', pkg);
        } else {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/package/${id}`, { withCredentials: true });
          if (response.data.success) {
            setPackageData(response.data.package);
            console.log('Loaded package from API:', response.data.package);
          } else {
            toast.error('Failed to load package data');
            navigate('/db-package-dashboard');
          }
        }
      } catch (err) {
        console.error('Error fetching package:', err);
        toast.error('Error loading package data');
        navigate('/db-package-dashboard');
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/package-bookings/${id}`, { withCredentials: true });
        if (response.data.success) {
          setBookings(response.data.bookings);
          console.log('Loaded bookings:', response.data.bookings);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        toast.error('Error loading booking data');
      }
    };

    fetchPackage();
    fetchBookings();
  }, [id, allPackages, navigate]);

  if (!packageData) {
    return (
      <div className="db-info-wrap">
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{ height: '100vh', backgroundColor: '#f9f9f9' }}
        >
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mt-3 fw-semibold text-dark fs-5">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  const imageContainerStyle = {
    position: 'relative',
    padding: '15px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    width: '150px',
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const imageContainerHoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  };

  const imagePreviewStyle = {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    opacity: '0.7',
    transition: 'opacity 0.3s ease',
  };

  const imagePreviewHoverStyle = {
    opacity: '0.9',
  };

  return (
    <div className="db-info-wrap" style={{ padding: '30px' }}>
      <div className="row">
        <div className="col-lg-12">
          <div
            className="dashboard-box"
            style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              padding: '30px',
            }}
          >
            <h4 style={{ margin: '0 0 25px', color: '#2c3e50', fontSize: '1.8rem', fontWeight: 600 }}>
              Package Details
            </h4>
            {/* Container 1: Basic Information */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Basic Information
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Title
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.title || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Package Type
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.packageType || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Category
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.category || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Group Size
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.groupSize || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Regular Price
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        ${packageData.regularPrice ? Number(packageData.regularPrice).toFixed(2) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Sale Price
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        ${packageData.salePrice ? Number(packageData.salePrice).toFixed(2) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Discount
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.discount ? `${packageData.discount}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Trip Duration
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.tripDuration ? `${packageData.tripDuration.days} days, ${packageData.tripDuration.nights} nights` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 2: Additional Details */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Additional Details
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Additional Categories
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.additionalCategories?.length > 0 ? packageData.additionalCategories.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Keywords
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.keywords?.length > 0 ? packageData.keywords.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Activity Types
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.activityTypes?.length > 0 ? packageData.activityTypes.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Highlights
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.highlights?.length > 0 ? packageData.highlights.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Difficulty Level
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.difficultyLevel || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 3: Descriptions */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Descriptions
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Description
                  </label>
                  <div
                    className="form-control-static"
                    style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50', border: '1px solid #e9ecef', borderRadius: '6px' }}
                    dangerouslySetInnerHTML={{ __html: packageData.description || 'N/A' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Itinerary Description
                  </label>
                  <div
                    className="form-control-static"
                    style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50', border: '1px solid #e9ecef', borderRadius: '6px' }}
                    dangerouslySetInnerHTML={{ __html: packageData.itineraryDescription || 'N/A' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Program Description
                  </label>
                  <div
                    className="form-control-static"
                    style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50', border: '1px solid #e9ecef', borderRadius: '6px' }}
                    dangerouslySetInnerHTML={{ __html: packageData.programDescription || 'N/A' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Quote
                  </label>
                  <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                    {packageData.quote || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            {/* Container 4: Inclusions & Exclusions */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Inclusions & Exclusions
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Inclusions
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.inclusions?.length > 0 ? packageData.inclusions.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Exclusions
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.exclusions?.length > 0 ? packageData.exclusions.join(', ') : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 5: Itinerary & Program */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Itinerary & Program
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Itinerary Days
                  </label>
                  {packageData.itineraryDays?.length > 0 ? (
                    packageData.itineraryDays.map((day, index) => (
                      <div key={`itinerary-${index}`} className="mb-3">
                        <p
                          className="form-control-static"
                          style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}
                        >
                          <strong>Day {day.day}</strong>
                        </p>
                        {day.activities?.map((activity, actIndex) => (
                          <p
                            key={`activity-${actIndex}`}
                            className="form-control-static"
                            style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}
                          >
                            {activity.title} ({activity.type}) - {activity.start_time} to {activity.end_time}: {activity.sub_title}
                          </p>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                      None
                    </p>
                  )}
                </div>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Program Days
                  </label>
                  {packageData.programDays?.length > 0 ? (
                    packageData.programDays.map((day, index) => (
                      <div key={`program-${index}`} className="mb-3">
                        <p
                          className="form-control-static"
                          style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}
                        >
                          <strong>Day {day.day}: {day.title}</strong>
                        </p>
                        <p
                          className="form-control-static"
                          style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}
                          dangerouslySetInnerHTML={{ __html: day.description || 'N/A' }}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                      None
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Container 6: Multiple Departures */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Multiple Departures
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Departure Details
                  </label>
                  {packageData.multipleDepartures?.length > 0 ? (
                    packageData.multipleDepartures.map((departure, index) => (
                      <p
                        key={`departure-${index}`}
                        className="form-control-static"
                        style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}
                      >
                        Location: {departure.location}, Date: {departure.dateTime ? new Date(departure.dateTime).toLocaleString() : 'N/A'}
                      </p>
                    ))
                  ) : (
                    <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                      None
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Container 7: Images & Status */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Images & Status
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Featured Image
                  </label>
                  {packageData.featuredImage ? (
                    <div
                      className="image-container"
                      style={imageContainerStyle}
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, imageContainerHoverStyle)}
                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, imageContainerStyle)}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}/Uploads/gallery/${packageData.featuredImage}`}
                        className="image-preview-img"
                        alt="Featured Image"
                        style={imagePreviewStyle}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, imagePreviewHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, imagePreviewStyle)}
                      />
                    </div>
                  ) : (
                    <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                      No featured image
                    </p>
                  )}
                </div>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    All Images
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                    {packageData.gallery?.length > 0 ? (
                      packageData.gallery.map((image, index) => (
                        <div
                          key={`image-${index}`}
                          className="image-container"
                          style={imageContainerStyle}
                          onMouseEnter={(e) => Object.assign(e.currentTarget.style, imageContainerHoverStyle)}
                          onMouseLeave={(e) => Object.assign(e.currentTarget.style, imageContainerStyle)}
                        >
                          <img
                            src={`${import.meta.env.VITE_API_URL}/Uploads/gallery/${image}`}
                            className="image-preview-img"
                            alt={`Package Image ${index + 1}`}
                            style={imagePreviewStyle}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, imagePreviewHoverStyle)}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, imagePreviewStyle)}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        No images
                      </p>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Status
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.status ? packageData.status.charAt(0).toUpperCase() + packageData.status.slice(1) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 8: Location */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Location
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Destination Address
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.destinationAddress || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Destination Country
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.destinationCountry || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Latitude
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.latitude || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Longitude
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.longitude || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 9: Reviews */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Reviews
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                    Reviews
                  </label>
                  {packageData.reviews?.length > 0 ? (
                    packageData.reviews.map((review, index) => (
                      <p
                        key={`review-${index}`}
                        className="form-control-static"
                        style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}
                      >
                        Review ID: {review._id} (Details not populated)
                      </p>
                    ))
                  ) : (
                    <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                      No reviews
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Container 10: Audit Information */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Audit Information
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Created By
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.createdBy
                          ? `${packageData.createdBy.firstName} ${packageData.createdBy.lastName} (${packageData.createdBy.email}, ${packageData.createdByModel})`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Created At
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.createdAt ? new Date(packageData.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Updated By
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.updatedBy
                          ? `${packageData.updatedBy.firstName} ${packageData.updatedBy.lastName} (${packageData.updatedBy.email}, ${packageData.updatedByModel})`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label style={{ fontWeight: 600, marginBottom: '0.6rem', color: '#2c3e50', fontSize: '0.95rem' }}>
                        Updated At
                      </label>
                      <p className="form-control-static" style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}>
                        {packageData.updatedAt ? new Date(packageData.updatedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Container 11: Package Booking Details */}
            <div className="card mb-4" style={{ borderRadius: '10px', border: '1px solid #e9ecef' }}>
              <div
                className="card-header"
                style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa', fontWeight: 600, color: '#2c3e50' }}
              >
                Package Booking Details
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                {bookings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table" style={{ whiteSpace: 'nowrap' }}>
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Booking ID</th>
                          <th>User Details</th>
                          <th>Total Cost</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking, index) => (
                          <tr key={booking._id}>
                            <td>{index + 1}.</td>
                            <td>{booking._id}</td>
                            <td>
                              {booking.userDetails
                                ? `${booking.userDetails.firstName} ${booking.userDetails.lastName} (${booking.userDetails.email})`
                                : 'N/A'}
                            </td>
                            <td>${booking.total ? Number(booking.total).toFixed(2) : 'N/A'}</td>
                            <td>
                              {booking.status === 'approved' ? (
                                <span className="badge badge-success">Approved</span>
                              ) : booking.status === 'rejected' ? (
                                <span className="badge badge-danger">Rejected</span>
                              ) : (
                                <span className="badge badge-primary">Pending</span>
                              )}
                            </td>
                            <td>
                              <span
                                className="badge badge-info"
                                style={{ fontSize: '15px', cursor: 'pointer' }}
                                onClick={() => navigate(`/user-booking/${booking._id}`)}
                              >
                                <i className="far fa-edit"></i>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p
                    className="form-control-static text-center"
                    style={{ padding: '0.6rem', fontSize: '1rem', color: '#2c3e50' }}
                  >
                    No bookings found for this package
                  </p>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="form-group text-right" style={{ marginBottom: '1.75rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/edit-package/${packageData._id}`)}
              >
                Edit Package
              </button>
              <button
                className="btn btn-danger"
                onClick={() => navigate('/db-package-dashboard')}
                style={{ marginLeft: '10px' }}
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;
