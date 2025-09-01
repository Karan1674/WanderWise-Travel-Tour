import { useState, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import JoditEditor from 'jodit-react';


function CareerAdd() {
  const { user, userType } = useSelector((state) => state.auth);

  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);


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
      if (!formData.careerPic) {
        toast.error('Image is required');
        return;
      }
      if (!formData.title || !formData.employmentType || !formData.shortDescription || !formData.description || !formData.overview || !formData.experience || !formData.requirements || !formData.vacancies || !formData.salary) {
        toast.error('All fields are required');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'careerPic') {
          formDataToSend.append('careerPic', formData.careerPic);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      try {
        setLoading(true);
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/add-career`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        const data = response.data;
        if (data.success) {
          toast.success(data.message || 'Career added successfully');

          navigate('/career-list');
        } else {
          toast.error(data.message || 'Failed to add career');
        }
      } catch (error) {
        console.error('Error adding career:', error);
        toast.error('Server error adding career');
      } finally {
        setLoading(false);
      }
    },
    [formData,navigate]
  );



  if (!['admin', 'agent'].includes(userType)) {
    toast.error('Unauthorized access');
    navigate('/');
    return null;
  }

  return (
    <div className="db-info-wrap">
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard-box" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>Add Career</h4>
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
                        <label>Image*</label>
                        <input
                          type="file"
                          name="careerPic"
                          onChange={handleFileChange}
                          className="form-control"
                          accept="image/*"
                          required
                          style={{height: '100%'}}

                        />
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
                    Add Career
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

export default CareerAdd;