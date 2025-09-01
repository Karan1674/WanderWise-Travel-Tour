import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import JoditEditor from 'jodit-react';

function CareerEdit() {
  const { user, userType } = useSelector((state) => state.auth);
  const { allCareers } = useSelector((state) => state.careers);
  const navigate = useNavigate();

  const {editCareerId} = useParams();
  const descriptionEditor = useRef(null);
  const overviewEditor = useRef(null);
  const experienceEditor = useRef(null);
  const requirementsEditor = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    employmentType: 'Full Time',
    shortDescription: '',
    description: '',
    overview: '',
    experience: '',
    requirements: '',
    vacancies: 1,
    salary: 'Negotiable',
    isActive: 'true',
    careerPic: null,
  });
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('');


  const joditConfig = useMemo(
    () => ({
      height: 300,
      toolbar: false, // Disable toolbar
      buttons: [], // No buttons
      removeButtons: ['image', 'video', 'file', 'source'],
      uploader: { insertImageAsBase64URI: true },
      beautyHTML: true,
      cleanHTML: { removeEmptyElements: true, fillEmptyParagraph: false },
      placeholder: 'Start typing...',
      events: {
        afterInit: (editor) => {
          console.log('Jodit Editor initialized:', editor.id);
        },
        error: (error) => {
          console.error('Jodit Editor error:', error);
        },
      },
    }),
    []
  );

  useEffect(() => {
    const fetchCareer = async () => {
      if (!editCareerId) {
        toast.error('No career ID provided');
        navigate('/career-list');
        return;
      }

      try {
        const storedCareer = allCareers.find((c) => c._id === editCareerId);
        if (storedCareer) {
          setFormData({
            title: storedCareer.title,
            employmentType: storedCareer.employmentType,
            shortDescription: storedCareer.shortDescription,
            description: storedCareer.description,
            overview: storedCareer.overview,
            experience: storedCareer.experience,
            requirements: storedCareer.requirements,
            vacancies: storedCareer.vacancies,
            salary: storedCareer.salary,
            isActive: storedCareer.isActive.toString(),
            careerPic: null,
          });
          setCurrentImage(storedCareer.image ? `${import.meta.env.VITE_API_URL}/Uploads/career/${storedCareer.image}` : '');
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/edit-career/edit/${editCareerId}`, {
          withCredentials: true,
        });
        const data = response.data;
        if (data.success && data.career) {
          setFormData({
            title: data.career.title,
            employmentType: data.career.employmentType,
            shortDescription: data.career.shortDescription,
            description: data.career.description,
            overview: data.career.overview,
            experience: data.career.experience,
            requirements: data.career.requirements,
            vacancies: data.career.vacancies,
            salary: data.career.salary,
            isActive: data.career.isActive.toString(),
            careerPic: null,
          });
          setCurrentImage(data.career.image ? `${import.meta.env.VITE_API_URL}/Uploads/career/${data.career.image}` : '');
          
        } else {
          toast.error(data.message || 'Career not found');
          navigate(-1);
        }
      } catch (error) {
        console.error('Error fetching career:', error);
        toast.error('Server error fetching career');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (['admin', 'agent'].includes(userType)) {
      fetchCareer();
    } else {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [editCareerId, userType, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(`Input changed: ${name}=${value}`);
  }, []);

  const handleFileChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, careerPic: e.target.files[0] }));
    console.log('File changed:', e.target.files[0]?.name);
  }, []);

  const handleJoditBlur = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(`JoditEditor blurred: ${name}=${value}`);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formData.title || !formData.employmentType || !formData.shortDescription || !formData.description || !formData.overview || !formData.experience || !formData.requirements || !formData.vacancies || !formData.salary) {
        toast.error('All fields are required');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'careerPic' && formData.careerPic) {
          formDataToSend.append('careerPic', formData.careerPic);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      try {
        setLoading(true);
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/edit-career/${editCareerId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          toast.success(data.message || 'Career updated successfully');
          navigate(-1);
        } else {
          toast.error(data.message || 'Failed to update career');
        }
      } catch (error) {
        console.error('Error updating career:', error);
        toast.error('Server error updating career');
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate, editCareerId]
  );

  if (loading) {
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

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>Edit Career</h4>
              <Link to="/career-list" className="btn btn-secondary" aria-label="Back to career list">
                Back to List
              </Link>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row">
                <div className="col-md-12">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Title*</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Employment Type*</label>
                        <select
                          name="employmentType"
                          value={formData.employmentType}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        >
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Full Time / Part Time">Full Time / Part Time</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Short Description*</label>
                        <input
                          type="text"
                          name="shortDescription"
                          value={formData.shortDescription}
                          onChange={handleInputChange}
                          className="form-control"
                          maxLength="200"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Vacancies*</label>
                        <input
                          type="number"
                          name="vacancies"
                          value={formData.vacancies}
                          onChange={handleInputChange}
                          className="form-control"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Salary*</label>
                        <input
                          type="text"
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Image</label>
                        <input
                          type="file"
                          name="careerPic"
                          onChange={handleFileChange}
                          className="form-control"
                          accept="image/*"
                          style={{height: '100%'}}
                        />
                        {currentImage && (
                          <img
                            src={currentImage}
                            alt="Current Career Image"
                            style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px', borderRadius: '4px' }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Description*</label>
                            <JoditEditor
                              ref={descriptionEditor}
                              value={formData.description}
                              config={joditConfig}
                              onBlur={(value) => handleJoditBlur('description', value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Overview*</label>
                            <JoditEditor
                              ref={overviewEditor}
                              value={formData.overview}
                              config={joditConfig}
                              onBlur={(value) => handleJoditBlur('overview', value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Experience*</label>
                            <JoditEditor
                              ref={experienceEditor}
                              value={formData.experience}
                              config={joditConfig}
                              onBlur={(value) => handleJoditBlur('experience', value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Requirements*</label>
                            <JoditEditor
                              ref={requirementsEditor}
                              value={formData.requirements}
                              config={joditConfig}
                              onBlur={(value) => handleJoditBlur('requirements', value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Active</label>
                        <select
                          name="isActive"
                          value={formData.isActive}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-primary">
                    Update Career
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerEdit;