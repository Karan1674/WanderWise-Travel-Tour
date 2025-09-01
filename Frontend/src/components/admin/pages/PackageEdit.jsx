import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../../styles/custom.scss';

const PackageEdit = () => {
  const { id } = useParams(); // Get package ID from URL
  const navigate = useNavigate();
  const { allPackages } = useSelector((state) => state.packages); // Access packages from Redux

  // Initialize formData with default values
  const [formData, setFormData] = useState({
    title: '',
    packageType: 'Adventure',
    description: '',
    groupSize: '',
    tripDuration: { days: '', nights: '' },
    category: 'Adult',
    regularPrice: '',
    salePrice: '',
    discount: '',
    itineraryDescription: '',
    programDescription: '',
    quote: '',
    difficultyLevel: 'Moderate',
    status: 'Pending',
    multipleDepartures: [{ location: '', dateTime: '' }],
    itineraryDays: [],
    programDays: [],
    inclusions: [''],
    exclusions: [''],
    activityTypes: [''],
    highlights: [''],
    additionalCategories: [],
    additionalCategoriesInput: '',
    showCategoryInput: false,
    keywords: '',
    latitude: '0',
    longitude: '0',
    destinationAddress: '',
    destinationCountry: '',
  });
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [featuredFile, setFeaturedFile] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // Fetch package data on mount
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        // Find package in Redux state
        const packageData = allPackages.find((pkg) => pkg._id === id);
        if (packageData) {
          setFormData({
            ...formData,
            title: packageData.title || '',
            packageType: packageData.packageType || 'Adventure',
            description: packageData.description || '',
            groupSize: packageData.groupSize || '',
            tripDuration: {
              days: packageData.tripDuration?.days || '',
              nights: packageData.tripDuration?.nights || '',
            },
            category: packageData.category || 'Adult',
            regularPrice: packageData.regularPrice || '',
            salePrice: packageData.salePrice || '',
            discount: packageData.discount || '',
            itineraryDescription: packageData.itineraryDescription || '',
            programDescription: packageData.programDescription || '',
            quote: packageData.quote || '',
            difficultyLevel: packageData.difficultyLevel || 'Moderate',
            status: packageData.status || 'Pending',
            multipleDepartures: Array.isArray(packageData.multipleDepartures) && packageData.multipleDepartures.length > 0
              ? packageData.multipleDepartures
              : [{ location: '', dateTime: '' }],
            itineraryDays: Array.isArray(packageData.itineraryDays) && packageData.itineraryDays.length > 0
              ? packageData.itineraryDays
              : [],
            programDays: Array.isArray(packageData.programDays) && packageData.programDays.length > 0
              ? packageData.programDays
              : [],
            inclusions: Array.isArray(packageData.inclusions) && packageData.inclusions.length > 0
              ? packageData.inclusions
              : [''],
            exclusions: Array.isArray(packageData.exclusions) && packageData.exclusions.length > 0
              ? packageData.exclusions
              : [''],
            activityTypes: Array.isArray(packageData.activityTypes) && packageData.activityTypes.length > 0
              ? packageData.activityTypes
              : [''],
            highlights: Array.isArray(packageData.highlights) && packageData.highlights.length > 0
              ? packageData.highlights
              : [''],
            additionalCategories: Array.isArray(packageData.additionalCategories) && packageData.additionalCategories.length > 0
              ? packageData.additionalCategories
              : [],
            keywords: packageData.keywords || '',
            latitude: packageData.latitude || '0',
            longitude: packageData.longitude || '0',
            destinationAddress: packageData.destinationAddress || '',
            destinationCountry: packageData.destinationCountry || '',
          });
          // Note: Existing gallery images are not set here; handle via API if needed
          console.log('Loaded package from Redux:', packageData);
        } else {
          // Fallback to API if not found in Redux
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/package/${id}`, { withCredentials: true });
          if (response.data.success) {
            const pkg = response.data.package;
            setFormData({
              ...formData,
              title: pkg.title || '',
              packageType: pkg.packageType || 'Adventure',
              description: pkg.description || '',
              groupSize: pkg.groupSize || '',
              tripDuration: {
                days: pkg.tripDuration?.days || '',
                nights: pkg.tripDuration?.nights || '',
              },
              category: pkg.category || 'Adult',
              regularPrice: pkg.regularPrice || '',
              salePrice: pkg.salePrice || '',
              discount: pkg.discount || '',
              itineraryDescription: pkg.itineraryDescription || '',
              programDescription: pkg.programDescription || '',
              quote: pkg.quote || '',
              difficultyLevel: pkg.difficultyLevel || 'Moderate',
              status: pkg.status || 'Pending',
              multipleDepartures: Array.isArray(pkg.multipleDepartures) && pkg.multipleDepartures.length > 0
                ? pkg.multipleDepartures
                : [{ location: '', dateTime: '' }],
              itineraryDays: Array.isArray(pkg.itineraryDays) && pkg.itineraryDays.length > 0
                ? pkg.itineraryDays
                : [],
              programDays: Array.isArray(pkg.programDays) && pkg.programDays.length > 0
                ? pkg.programDays
                : [],
              inclusions: Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0
                ? pkg.inclusions
                : [''],
              exclusions: Array.isArray(pkg.exclusions) && pkg.exclusions.length > 0
                ? pkg.exclusions
                : [''],
              activityTypes: Array.isArray(pkg.activityTypes) && pkg.activityTypes.length > 0
                ? pkg.activityTypes
                : [''],
              highlights: Array.isArray(pkg.highlights) && pkg.highlights.length > 0
                ? pkg.highlights
                : [''],
              additionalCategories: Array.isArray(pkg.additionalCategories) && pkg.additionalCategories.length > 0
                ? pkg.additionalCategories
                : [],
              keywords: pkg.keywords || '',
              latitude: pkg.latitude || '0',
              longitude: pkg.longitude || '0',
              destinationAddress: pkg.destinationAddress || '',
              destinationCountry: pkg.destinationCountry || '',
            });
            console.log('Loaded package from API:', pkg);
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

    fetchPackage();
  }, [id, allPackages, navigate]);

  // Initialize Leaflet map
  useEffect(() => {
    if (window.L && formData.latitude && formData.longitude) {
      const leafletMap = window.L.map('map').setView([formData.latitude, formData.longitude], 15);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMap);

      const initialMarker = window.L.marker([formData.latitude, formData.longitude], { draggable: true }).addTo(leafletMap);
      setMap(leafletMap);
      setMarker(initialMarker);

      leafletMap.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        initialMarker.setLatLng([lat, lng]);
        setFormData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            setFormData((prev) => ({
              ...prev,
              destinationAddress: data.results[0].formatted || '',
              destinationCountry: data.results[0].components.country || '',
            }));
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          toast.error('Error fetching location data');
        }
      });

      initialMarker.on('dragend', async (e) => {
        const { lat, lng } = e.target.getLatLng();
        setFormData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            setFormData((prev) => ({
              ...prev,
              destinationAddress: data.results[0].formatted || '',
              destinationCountry: data.results[0].components.country || '',
            }));
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          toast.error('Error fetching location data');
        }
      });

      return () => {
        leafletMap.remove();
      };
    }
  }, [formData.latitude, formData.longitude]);

  // Update itinerary and program days when days change
  useEffect(() => {
    updateItinerary();
  }, [formData.tripDuration.days]);

  // Toggle required fields based on status
  useEffect(() => {
    toggleRequiredFields();
  }, [formData.status, formData, galleryFiles, featuredFile]);

  const toggleRequiredFields = () => {
    const isPublish = formData.status === 'Active';
    const fields = [
      'groupSize',
      'tripDuration.days',
      'tripDuration.nights',
      'category',
      'regularPrice',
      'itineraryDescription',
      'programDescription',
      'keywords',
      'difficultyLevel',
      'destinationAddress',
      'quote',
    ];

    fields.forEach((field) => {
      const input = document.querySelector(`[name="${field}"]`);
      if (input) {
        input.required = isPublish;
        const label = document.querySelector(`label[for="${field.split('.')[0]}"]`);
        if (label) {
          label.classList.toggle('required-field', isPublish);
          input.classList.toggle('is-invalid', isPublish && !getNestedValue(formData, field));
        }
      }
    });

    // Handle featured image and gallery
    const featuredLabel = document.querySelector('label[for="featured-input"]');
    const galleryLabel = document.querySelector('label[for="gallery-input"]');
    if (featuredLabel) {
      featuredLabel.classList.toggle('required-field', isPublish);
      const featuredInput = document.querySelector('#featured-input');
      if (featuredInput) {
        featuredInput.required = isPublish;
        featuredInput.classList.toggle('is-invalid', isPublish && !featuredFile);
      }
    }
    if (galleryLabel) {
      galleryLabel.classList.toggle('required-field', isPublish);
      const galleryInput = document.querySelector('#gallery-input');
      if (galleryInput) {
        galleryInput.required = isPublish;
        galleryInput.classList.toggle('is-invalid', isPublish && galleryFiles.length === 0);
      }
    }

    // Handle dynamic arrays
    ['inclusions', 'exclusions', 'activityTypes', 'highlights'].forEach((container) => {
      const entries = document.querySelectorAll(`.${container.slice(0, -1)}-entry input`);
      entries.forEach((input, index) => {
        input.required = isPublish;
        input.classList.toggle('is-invalid', isPublish && !formData[container]?.[index]);
        const deleteBtn = input.closest(`.${container.slice(0, -1)}-entry`)?.querySelector(`.delete-${container.slice(0, -1)}`);
        if (deleteBtn) {
          deleteBtn.style.display = Array.isArray(formData[container]) && formData[container].length === 1 ? 'none' : 'inline-block';
        }
      });
    });

    // Handle itinerary days
    document.querySelectorAll('.itinerary-item').forEach((item) => {
      const inputs = item.querySelectorAll('input, select');
      inputs.forEach((input) => {
        input.required = isPublish;
        const inputLabel = input.closest('.form-group')?.querySelector('label');
        if (inputLabel) inputLabel.classList.toggle('required-field', isPublish);
        input.classList.toggle('is-invalid', isPublish && !input.value.trim());
      });
      const deleteBtn = item.querySelector('.delete-itinerary-row');
      if (deleteBtn) {
        deleteBtn.style.display = item.parentElement.querySelectorAll('.itinerary-item').length === 1 ? 'none' : 'inline-block';
      }
    });

    // Handle program days
    document.querySelectorAll('.program-day-entry').forEach((item) => {
      const inputs = item.querySelectorAll('input, textarea');
      inputs.forEach((input) => {
        input.required = isPublish;
        const inputLabel = input.closest('.form-group')?.querySelector('label');
        if (inputLabel) inputLabel.classList.toggle('required-field', isPublish);
        input.classList.toggle('is-invalid', isPublish && !input.value.trim());
      });
  
    });

    // Handle additional categories
    const categoryInputs = document.querySelectorAll('#category-list input[type="checkbox"]');
    const categoriesHeader = document.querySelector('.db-cat-field-wrap h4');
    if (isPublish && categoryInputs.length > 0) {
      const isChecked = Array.from(categoryInputs).some((input) => input.checked);
      categoryInputs.forEach((input) => {
        input.required = !isChecked;
      });
      if (categoriesHeader) categoriesHeader.classList.toggle('required-field', isPublish);
    } else {
      categoryInputs.forEach((input) => input.removeAttribute('required'));
      if (categoriesHeader) categoriesHeader.classList.remove('required-field');
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ''), obj);
  };

  const handleInputChange = (e, field, index = null, subField = null, arrayName = null) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    console.log('handleInputChange:', { field, index, subField, arrayName, value, name: e.target.name }); // Debug log
    setFormData((prev) => {
      const newState = { ...prev };

      if (arrayName) {
        // Handle array fields (inclusions, exclusions, activityTypes, highlights, multipleDepartures, etc.)
        const array = Array.isArray(newState[arrayName]) ? [...newState[arrayName]] : [''];
        if (subField) {
          // Handle nested objects in arrays (e.g., multipleDepartures[{location, dateTime}])
          array[index] = { ...array[index], [subField]: value };
        } else {
          // Handle simple array items (e.g., inclusions, exclusions)
          array[index] = value;
        }
        newState[arrayName] = array;
      } else if (field === 'additionalCategories') {
        // Handle additionalCategories checkboxes
        newState.additionalCategories = value
          ? [...newState.additionalCategories, e.target.value]
          : newState.additionalCategories.filter((cat) => cat !== e.target.value);
      } else if (field.includes('.')) {
        // Handle nested fields (e.g., tripDuration.days)
        const [parent, child] = field.split('.');
        newState[parent] = { ...newState[parent], [child]: value };
      } else if (field) {
        // Handle scalar fields (e.g., title, description)
        newState[field] = value;
      } else {
        console.error('Invalid handleInputChange call: no field or arrayName provided');
      }

      console.log('Updated formData:', JSON.stringify(newState, null, 2)); // Detailed debug log
      return newState;
    });
  };

  const handleAddArrayItem = (arrayName) => {
    setFormData((prev) => {
      const newArray = Array.isArray(prev[arrayName])
        ? [...prev[arrayName], arrayName === 'multipleDepartures' ? { location: '', dateTime: '' } : '']
        : [arrayName === 'multipleDepartures' ? { location: '', dateTime: '' } : ''];
      console.log(`Adding item to ${arrayName}:`, newArray); // Debug log
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleRemoveArrayItem = (arrayName, index) => {
    if (Array.isArray(formData[arrayName]) && formData[arrayName].length > 1) {
      setFormData((prev) => {
        const newArray = prev[arrayName].filter((_, i) => i !== index);
        console.log(`Removing item from ${arrayName} at index ${index}:`, newArray); // Debug log
        return { ...prev, [arrayName]: newArray };
      });
    }
  };

  const updateItinerary = () => {
    const days = parseInt(formData.tripDuration.days) || 0;
    if (days < 0) return;
    setFormData((prev) => {
      const newItineraryDays = Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        activities: prev.itineraryDays[i]?.activities || [{ title: '', sub_title: '', start_time: '', end_time: '', type: '' }],
      }));
      const newProgramDays = Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title: prev.programDays[i]?.title || '',
        description: prev.programDays[i]?.description || '',
      }));
      console.log('Updated itineraryDays:', newItineraryDays); // Debug log
      console.log('Updated programDays:', newProgramDays); // Debug log
      return { ...prev, itineraryDays: newItineraryDays, programDays: newProgramDays };
    });
  };

  const addActivity = (dayIndex) => {
    setFormData((prev) => {
      const newItineraryDays = [...prev.itineraryDays];
      newItineraryDays[dayIndex] = {
        ...newItineraryDays[dayIndex],
        activities: [
          ...newItineraryDays[dayIndex].activities,
          { title: '', sub_title: '', start_time: '', end_time: '', type: '' },
        ],
      };
      console.log('Added activity to day', dayIndex, ':', newItineraryDays[dayIndex]); // Debug log
      return { ...prev, itineraryDays: newItineraryDays };
    });
  };

  const removeActivity = (dayIndex, activityIndex) => {
    if (formData.itineraryDays[dayIndex].activities.length > 1) {
      setFormData((prev) => {
        const newItineraryDays = [...prev.itineraryDays];
        newItineraryDays[dayIndex] = {
          ...newItineraryDays[dayIndex],
          activities: newItineraryDays[dayIndex].activities.filter((_, i) => i !== activityIndex),
        };
        console.log('Removed activity from day', dayIndex, 'at index', activityIndex, ':', newItineraryDays[dayIndex]); // Debug log
        return { ...prev, itineraryDays: newItineraryDays };
      });
    }
  };

  const addProgramDay = () => {
    setFormData((prev) => {
      const newProgramDays = [
        ...prev.programDays,
        { day: prev.programDays.length + 1, title: '', description: '' },
      ];
      console.log('Added program day:', newProgramDays); // Debug log
      return { ...prev, programDays: newProgramDays };
    });
  };

  const removeProgramDay = (index) => {
    if (formData.programDays.length > 1) {
      setFormData((prev) => {
        const newProgramDays = prev.programDays
          .filter((_, i) => i !== index)
          .map((day, i) => ({ ...day, day: i + 1 }));
        console.log('Removed program day at index', index, ':', newProgramDays); // Debug log
        return { ...prev, programDays: newProgramDays };
      });
    }
  };

  const toggleCategoryInput = () => {
    setFormData((prev) => ({
      ...prev,
      showCategoryInput: !prev.showCategoryInput,
      additionalCategoriesInput: '',
    }));
  };

  const handleAddCategory = () => {
    const newCategory = formData.additionalCategoriesInput.trim();
    if (newCategory && !formData.additionalCategories.includes(newCategory)) {
      setFormData((prev) => ({
        ...prev,
        additionalCategories: [...prev.additionalCategories, newCategory],
        additionalCategoriesInput: '',
        showCategoryInput: false,
      }));
      console.log('Added category:', newCategory); // Debug log
    } else if (!newCategory) {
      toast.error('Please enter a category name');
    } else {
      toast.error('Category already exists');
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + galleryFiles.length > 8) {
      toast.error('Maximum 8 images allowed.');
      e.target.value = '';
      return;
    }
    setGalleryFiles((prev) => [...prev, ...files]);
    console.log('Updated gallery files:', files); // Debug log
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      return newFiles;
    });
  };

  const handleLocationSearch = async (e) => {
    const query = e.target.value;
    setFormData((prev) => ({ ...prev, destinationAddress: query }));
    if (query.length < 3) return;
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          destinationAddress: data.results[0].formatted || '',
          destinationCountry: data.results[0].components.country || '',
        }));
        if (map && marker) {
          map.setView([lat, lng], 15);
          marker.setLatLng([lat, lng]);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Error searching location');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      toast.error('Please fill all required fields');
      return;
    }

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'tripDuration') {
        submitData.append('tripDuration[days]', value.days);
        submitData.append('tripDuration[nights]', value.nights);
      } else if (Array.isArray(value)) {
        if (key === 'multipleDepartures' || key === 'itineraryDays' || key === 'programDays') {
          submitData.append(key, JSON.stringify(value));
        } else {
          value.forEach((item, index) => {
            submitData.append(`${key}[${index}]`, item);
          });
        }
      } else if (key !== 'showCategoryInput' && key !== 'additionalCategoriesInput') {
        submitData.append(key, value);
      }
    });
    galleryFiles.forEach((file) => submitData.append('gallery', file));
    if (featuredFile) submitData.append('featuredImage', featuredFile);

 
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/update-package/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success('Package updated successfully');
        navigate('/db-package-dashboard');
      } else {
        toast.error(response.data.error || 'Failed to update package');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update error: ' + err.message);
    }
  };

  // Ensure arrays are valid before rendering
  const ensureArray = (arr) => (Array.isArray(arr) ? arr : ['']);

  return (
    <div className="custom">
      <div className="db-info-wrap db-add-tour-wrap p-4">
      <form id="edit-package-form" onSubmit={handleSubmit} encType="multipart/form-data" className="needs-validation" noValidate>
        <div className="row">
          <div className="col-lg-8 col-xl-9">
            {/* Basic Information */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <h4 className="mb-3">Edit Package Information</h4>
                <div className="form-group mb-3">
                  <label htmlFor="title" className="form-label required-field">Title</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="packageType" className="form-label required-field">Package Type</label>
                  <select
                    name="packageType"
                    id="packageType"
                    className="form-control"
                    value={formData.packageType}
                    onChange={(e) => handleInputChange(e, 'packageType')}
                    required
                  >
                    <option value="Adventure">Adventure</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Family">Family</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Eco">Eco</option>
                  </select>
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="description" className="form-label required-field">Description</label>
                  <textarea
                    name="description"
                    id="description"
                    className="form-control"
                    rows="5"
                    value={formData.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Departures */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Departures</h4>
                  <span
                    className="btn btn-outline-success btn-sm rounded-0 px-3"
                    onClick={() => handleAddArrayItem('multipleDepartures')}
                  >
                    Add Departure
                  </span>
                </div>
                <div id="departures">
                  {(Array.isArray(formData.multipleDepartures) ? formData.multipleDepartures : [{ location: '', dateTime: '' }]).map((dep, index) => (
                    <div key={`departure-${index}`} className="departure-entry mb-3 d-flex align-items-center">
                      <div className="flex-grow-1 me-2">
                        <div className="form-group">
                          <label htmlFor={`departureLocation${index}`} className="form-label required-field">
                            Departure Location
                          </label>
                          <input
                            type="text"
                            name={`multipleDepartures[${index}][location]`}
                            id={`departureLocation${index}`}
                            className="form-control"
                            value={dep.location || ''}
                            onChange={(e) => handleInputChange(e, null, index, 'location', 'multipleDepartures')}
                            required
                          />
                        </div>
                      </div>
                      <div className="me-2">
                        <div className="form-group">
                          <label htmlFor={`departureDateTime${index}`} className="form-label required-field">
                            Departure Date and Time
                          </label>
                          <input
                            type="datetime-local"
                            name={`multipleDepartures[${index}][dateTime]`}
                            id={`departureDateTime${index}`}
                            className="form-control"
                            value={ dep.dateTime && new Date(dep?.dateTime)?.toISOString()?.slice(0, 16) || ''}
                            onChange={(e) => handleInputChange(e, null, index, 'dateTime', 'multipleDepartures')}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <i
                          className="fas fa-trash text-danger delete-departure"
                          style={{ fontSize: '18px', cursor: 'pointer', display: formData.multipleDepartures.length === 1 ? 'none' : 'inline-block' }}
                          onClick={() => handleRemoveArrayItem('multipleDepartures', index)}
                        ></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dates and Prices */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <h4 className="mb-3">Dates and Prices</h4>
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <div className="form-group">
                      <label htmlFor="groupSize" className="form-label">Group Size</label>
                      <input
                        type="number"
                        name="groupSize"
                        id="groupSize"
                        className="form-control"
                        placeholder="No of Pax"
                        value={formData.groupSize}
                        onChange={(e) => handleInputChange(e, 'groupSize')}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <div className="row">
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="days" className="form-label">Trip Duration(Days)</label>
                          <input
                            type="number"
                            name="tripDuration.days"
                            id="days"
                            className="form-control"
                            placeholder="Days"
                            value={formData.tripDuration.days}
                            onChange={(e) => handleInputChange(e, 'tripDuration.days')}
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-group">
                          <label htmlFor="nights" className="form-label">Trip Duration(Nights)</label>
                          <input
                            type="number"
                            name="tripDuration.nights"
                            id="nights"
                            className="form-control"
                            placeholder="Nights"
                            value={formData.tripDuration.nights}
                            onChange={(e) => handleInputChange(e, 'tripDuration.nights')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4 mb-3">
                    <div className="form-group">
                      <label htmlFor="category" className="form-label">Category</label>
                      <select
                        name="category"
                        id="category"
                        className="form-control"
                        value={formData.category}
                        onChange={(e) => handleInputChange(e, 'category')}
                      >
                        <option value="Adult">Adult</option>
                        <option value="Child">Child</option>
                        <option value="Couple">Couple</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-3 mb-3">
                    <div className="form-group">
                      <label htmlFor="regularPrice" className="form-label">Regular Price</label>
                      <input
                        type="number"
                        name="regularPrice"
                        id="regularPrice"
                        className="form-control"
                        value={formData.regularPrice}
                        onChange={(e) => handleInputChange(e, 'regularPrice')}
                      />
                    </div>
                  </div>
                  <div className="col-sm-3 mb-3">
                    <div className="form-group">
                      <label htmlFor="salePrice" className="form-label">Sale Price</label>
                      <input
                        type="number"
                        name="salePrice"
                        id="salePrice"
                        className="form-control"
                        value={formData.salePrice}
                        onChange={(e) => handleInputChange(e, 'salePrice')}
                      />
                    </div>
                  </div>
                  <div className="col-sm-2 mb-3">
                    <div className="form-group">
                      <label htmlFor="discount" className="form-label">Discount</label>
                      <input
                        type="number"
                        name="discount"
                        id="discount"
                        className="form-control"
                        value={formData.discount}
                        onChange={(e) => handleInputChange(e, 'discount')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">
                    Itinerary (<span id="total-days">{formData.tripDuration.days || 0}</span> days)
                  </h4>
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="itineraryDescription" className="form-label">Itinerary Description</label>
                  <textarea
                    name="itineraryDescription"
                    id="itineraryDescription"
                    className="form-control"
                    rows="4"
                    value={formData.itineraryDescription}
                    onChange={(e) => handleInputChange(e, 'itineraryDescription')}
                  ></textarea>
                </div>
                <div id="itinerary-days">
                  {(Array.isArray(formData.itineraryDays) ? formData.itineraryDays : []).map((day, dayIndex) => (
                    <div key={`itinerary-${dayIndex}`} className="d-flex flex-column mb-3">
                      <input type="hidden" name={`itineraryDays[${dayIndex}][day]`} value={day.day} />
                      <div className="d-flex justify-content-between align-items-center bg-dark p-3 text-white">
                        <strong style={{ fontSize: '18px' }}>Day {day.day}</strong>
                        <div className="d-flex align-items-center">
                          <span
                            className="btn btn-outline-light btn-sm rounded-0 px-3 itineraryAdd"
                            onClick={() => addActivity(dayIndex)}
                          >
                            Add Activity
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 itinerary-activities">
                        {(Array.isArray(day.activities) ? day.activities : [{ title: '', sub_title: '', start_time: '', end_time: '', type: '' }]).map((activity, actIndex) => (
                          <div
                            key={`itinerary-item-${dayIndex}-${actIndex}`}
                            className="w-100 mt-3 itinerary-item"
                          >
                            <div className="d-flex justify-content-between">
                              <strong>#{actIndex + 1}</strong>
                              <i
                                className="fas fa-trash text-danger delete-itinerary-row"
                                style={{
                                  fontSize: '18px',
                                  cursor: 'pointer',
                                  display: day.activities.length === 1 ? 'none' : 'inline-block',
                                }}
                                onClick={() => removeActivity(dayIndex, actIndex)}
                              ></i>
                            </div>
                            <div className="row mt-2">
                              <div className="form-group col-md-5">
                                <label>Title</label>
                                <input
                                  name={`itineraryDays[${dayIndex}][activities][${actIndex}][title]`}
                                  className="form-control itinerary-title"
                                  type="text"
                                  value={activity.title || ''}
                                  onChange={(e) =>
                                    handleInputChange(e, null, actIndex, 'title', `itineraryDays[${dayIndex}][activities]`)
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group col-md-7">
                                <label>Sub Title</label>
                                <input
                                  name={`itineraryDays[${dayIndex}][activities][${actIndex}][sub_title]`}
                                  className="form-control itinerary-sub-title"
                                  type="text"
                                  value={activity.sub_title || ''}
                                  onChange={(e) =>
                                    handleInputChange(e, null, actIndex, 'sub_title', `itineraryDays[${dayIndex}][activities]`)
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group col-md-4">
                                <label>Start Time</label>
                                <input
                                  name={`itineraryDays[${dayIndex}][activities][${actIndex}][start_time]`}
                                  className="form-control itinerary-start-time"
                                  type="time"
                                  value={activity.start_time || ''}
                                  onChange={(e) =>
                                    handleInputChange(e, null, actIndex, 'start_time', `itineraryDays[${dayIndex}][activities]`)
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group col-md-4">
                                <label>End Time</label>
                                <input
                                  name={`itineraryDays[${dayIndex}][activities][${actIndex}][end_time]`}
                                  className="form-control itinerary-end-time"
                                  type="time"
                                  value={activity.end_time || ''}
                                  onChange={(e) =>
                                    handleInputChange(e, null, actIndex, 'end_time', `itineraryDays[${dayIndex}][activities]`)
                                  }
                                  required
                                />
                              </div>
                              <div className="form-group col-md-4">
                                <label>Type</label>
                                <select
                                  name={`itineraryDays[${dayIndex}][activities][${actIndex}][type]`}
                                  className="form-control itinerary-type"
                                  value={activity.type || ''}
                                  onChange={(e) =>
                                    handleInputChange(e, null, actIndex, 'type', `itineraryDays[${dayIndex}][activities]`)
                                  }
                                  required
                                >
                                  <option value="" disabled>
                                    Select itinerary item type
                                  </option>
                                  {['sightseeing', 'activity', 'meal', 'transport', 'accommodation'].map((type) => (
                                    <option key={type} value={type}>
                                      {type.toUpperCase()}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Program */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">
                    Program (<span id="total-program-days">{formData.programDays.length}</span> days)
                  </h4>
                  <span className="btn btn-outline-success btn-sm rounded-0 px-3" onClick={addProgramDay}>
                    Add Program Day
                  </span>
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="programDescription" className="form-label">Program Description</label>
                  <textarea
                    name="programDescription"
                    id="programDescription"
                    className="form-control"
                    rows="4"
                    value={formData.programDescription}
                    onChange={(e) => handleInputChange(e, 'programDescription')}
                  ></textarea>
                </div>
                <div id="programDays">
                  {(Array.isArray(formData.programDays) ? formData.programDays : []).map((day, index) => (
                    <div key={`program-day-${index}`} className="program-day-entry mb-3">
                      <input type="hidden" name={`programDays[${index}][day]`} value={day.day} />
                      <div className="d-flex justify-content-between align-items-center bg-dark p-3 text-white">
                        <strong style={{ fontSize: '18px' }}>Day {day.day}</strong>
                        <i
                          className="fas fa-trash text-danger delete-program-day"
                          style={{
                            fontSize: '18px',
                            cursor: 'pointer',
                            display:'inline-block',
                          }}
                          onClick={() => removeProgramDay(index)}
                        ></i>
                      </div>
                      <div className="mt-3">
                        <div className="form-group mb-3">
                          <label htmlFor={`programDayTitle${index}`} className="form-label">Title</label>
                          <input
                            type="text"
                            name={`programDays[${index}][title]`}
                            id={`programDayTitle${index}`}
                            className="form-control"
                            placeholder="e.g., Ancient Rome Visit"
                            value={day.title || ''}
                            onChange={(e) => handleInputChange(e, null, index, 'title', 'programDays')}
                            required
                          />
                        </div>
                        <div className="form-group mb-3">
                          <label htmlFor={`programDayDescription${index}`} className="form-label">Description</label>
                          <textarea
                            name={`programDays[${index}][description]`}
                            id={`programDayDescription${index}`}
                            className="form-control"
                            rows="4"
                            placeholder="Enter day description"
                            value={day.description || ''}
                            onChange={(e) => handleInputChange(e, null, index, 'description', 'programDays')}
                            required
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inclusions */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Inclusions</h4>
                  <span
                    className="btn btn-outline-success btn-sm rounded-0 px-3"
                    onClick={() => handleAddArrayItem('inclusions')}
                  >
                    Add Inclusion
                  </span>
                </div>
                <div id="inclusions">
                  {ensureArray(formData.inclusions).map((inc, index) => (
                    <div key={`inclusion-${index}`} className="inclusion-entry mb-3 d-flex align-items-center">
                      <div className="flex-grow-1 me-2">
                        <input
                          type="text"
                          name={`inclusions[${index}]`}
                          className="form-control"
                          placeholder="e.g., Meals"
                          value={inc || ''}
                          onChange={(e) => handleInputChange(e, null, index, null, 'inclusions')}
                        />
                      </div>
                      <div>
                        <i
                          className="fas fa-trash text-danger delete-inclusion"
                          style={{ fontSize: '18px', cursor: 'pointer', display: formData.inclusions.length === 1 ? 'none' : 'inline-block' }}
                          onClick={() => handleRemoveArrayItem('inclusions', index)}
                        ></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exclusions */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Exclusions</h4>
                  <span
                    className="btn btn-outline-success btn-sm rounded-0 px-3"
                    onClick={() => handleAddArrayItem('exclusions')}
                  >
                    Add Exclusion
                  </span>
                </div>
                <div id="exclusions">
                  {ensureArray(formData.exclusions).map((exc, index) => (
                    <div key={`exclusion-${index}`} className="exclusion-entry mb-3 d-flex align-items-center">
                      <div className="flex-grow-1 me-2">
                        <input
                          type="text"
                          name={`exclusions[${index}]`}
                          className="form-control"
                          placeholder="e.g., Airfare"
                          value={exc || ''}
                          onChange={(e) => handleInputChange(e, null, index, null, 'exclusions')}
                        />
                      </div>
                      <div>
                        <i
                          className="fas fa-trash text-danger delete-exclusion"
                          style={{ fontSize: '18px', cursor: 'pointer', display: formData.exclusions.length === 1 ? 'none' : 'inline-block' }}
                          onClick={() => handleRemoveArrayItem('exclusions', index)}
                        ></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Types */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Activity Types</h4>
                  <span
                    className="btn btn-outline-success btn-sm rounded-0 px-3"
                    onClick={() => handleAddArrayItem('activityTypes')}
                  >
                    Add Activity Type
                  </span>
                </div>
                <div id="activityTypes">
                  {ensureArray(formData.activityTypes).map((act, index) => (
                    <div key={`activityType-${index}`} className="activityType-entry mb-3 d-flex align-items-center">
                      <div className="flex-grow-1 me-2">
                        <input
                          type="text"
                          name={`activityTypes[${index}]`}
                          className="form-control"
                          placeholder="e.g., Hiking"
                          value={act || ''}
                          onChange={(e) => handleInputChange(e, null, index, null, 'activityTypes')}
                        />
                      </div>
                      <div>
                        <i
                          className="fas fa-trash text-danger delete-activityType"
                          style={{ fontSize: '18px', cursor: 'pointer', display: formData.activityTypes.length === 1 ? 'none' : 'inline-block' }}
                          onClick={() => handleRemoveArrayItem('activityTypes', index)}
                        ></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Highlights</h4>
                  <span
                    className="btn btn-outline-success btn-sm rounded-0 px-3"
                    onClick={() => handleAddArrayItem('highlights')}
                  >
                    Add Highlight
                  </span>
                </div>
                <div id="highlights">
                  {ensureArray(formData.highlights).map((hig, index) => (
                    <div key={`highlight-${index}`} className="highlight-entry mb-3 d-flex align-items-center">
                      <div className="flex-grow-1 me-2">
                        <input
                          type="text"
                          name={`highlights[${index}]`}
                          className="form-control"
                          placeholder="e.g., Scenic views"
                          value={hig || ''}
                          onChange={(e) => handleInputChange(e, null, index, null, 'highlights')}
                        />
                      </div>
                      <div>
                        <i
                          className="fas fa-trash text-danger delete-highlight"
                          style={{ fontSize: '18px', cursor: 'pointer', display: formData.highlights.length === 1 ? 'none' : 'inline-block' }}
                          onClick={() => handleRemoveArrayItem('highlights', index)}
                        ></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <h4 className="mb-3">Gallery (Max 8 Images)</h4>
              <div className="custom-field-wrap">
                <div className="dragable-field border border-dashed p-4 text-center">
                  <div className="dragable-field-inner">
                    <p className="drag-drop-info">Drop Files To Upload (Max 8)</p>
                    <p>or</p>
                    <div className="upload-input">
                      <div className="form-group">
                        <label htmlFor="gallery-input" className="upload-btn btn btn-success">
                          Upload Images
                        </label>
                        <input
                          type="file"
                          id="gallery-input"
                          name="gallery"
                          multiple
                          accept="image/*"
                          className="d-none"
                          onChange={handleGalleryChange}
                        />
                      </div>
                    </div>
                    <div id="gallery-preview" className="mt-3 row">
                      {galleryFiles.map((file, index) => (
                        <div key={`gallery-${index}`} className="col-auto">
                          <img
                            src={URL.createObjectURL(file)}
                            className="gallery-img"
                            alt="Preview"
                          />
                          <i
                            className="fas fa-trash text-danger delete-gallery mt-1"
                            style={{ fontSize: '18px', cursor: 'pointer' }}
                            onClick={() => handleRemoveGalleryImage(index)}
                          ></i>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <h4 className="mb-3">Location</h4>
              <div className="custom-field-wrap">
                <div className="form-group mb-3">
                  <label htmlFor="location-search" className="form-label">Search Destination Address and Country</label>
                  <input
                    type="text"
                    id="location-search"
                    name="destinationAddress"
                    className="form-control"
                    placeholder="Search for a place"
                    value={formData.destinationAddress}
                    onChange={handleLocationSearch}
                  />
                </div>
                <input type="hidden" name="latitude" id="latitude" value={formData.latitude} />
                <input type="hidden" name="longitude" id="longitude" value={formData.longitude} />
                <input
                  type="hidden"
                  name="destinationCountry"
                  id="destinationCountry"
                  value={formData.destinationCountry}
                />
                <div id="map" style={{ height: '400px', width: '100%', marginTop: '20px' }} className="border rounded"></div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-xl-3">
            {/* Additional Categories */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap db-cat-field-wrap">
                <h4 className="mb-3">Additional Categories</h4>
                <div id="category-list">
                  {formData.additionalCategories.map((cat) => (
                    <div key={cat} className="form-group mb-2">
                      <label className="custom-input">
                        <input
                          type="checkbox"
                          name="additionalCategories[]"
                          value={cat}
                          checked={formData.additionalCategories.includes(cat)}
                          onChange={(e) => handleInputChange(e, 'additionalCategories', null, cat)}
                        />
                        <span className="custom-input-field"></span>
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
                <span
                  className="btn btn-outline-success btn-sm rounded-0 px-3 mt-2 d-inline-block"
                  onClick={toggleCategoryInput}
                >
                  {formData.showCategoryInput ? 'Cancel' : 'Add Category'}
                </span>
                <div id="new-category-input" className={formData.showCategoryInput ? '' : 'd-none'}>
                  <div className="form-group mt-2">
                    <input
                      type="text"
                      id="new-category"
                      className="form-control"
                      placeholder="New category"
                      value={formData.additionalCategoriesInput}
                      onChange={(e) => handleInputChange(e, 'additionalCategoriesInput')}
                    />
                    <button type="button" className="btn btn-primary mt-2" onClick={handleAddCategory}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap db-pop-field-wrap">
                <h4 className="mb-3">Keywords</h4>
                <div className="form-group">
                  <label htmlFor="keywords" className="form-label">Keywords</label>
                  <input
                    type="text"
                    name="keywords"
                    id="keywords"
                    className="form-control"
                    placeholder="Comma-separated keywords"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange(e, 'keywords')}
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap db-media-field-wrap">
                <h4 className="mb-3">Add Featured Image</h4>
                <div className="upload-input">
                  <div className="form-group">
                    <label htmlFor="featured-input" className="upload-btn btn btn-success">
                      Upload a Featured Image
                    </label>
                    <input
                      type="file"
                      id="featured-input"
                      name="featuredImage"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => setFeaturedFile(e.target.files[0])}
                    />
                  </div>
                </div>
                <div id="featured-file-name" className="mt-2 text-dark">
                  {featuredFile ? featuredFile.name : 'No file selected'}
                </div>
              </div>
            </div>

            {/* Quote and Difficulty Level */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <h4 className="mb-3">Quote</h4>
                <div id="quotes">
                  <div className="quote-entry mb-3">
                    <div className="form-group">
                      <label htmlFor="quote" className="form-label">Quote</label>
                      <input
                        type="text"
                        name="quote"
                        id="quote"
                        className="form-control"
                        placeholder="e.g., Explore the world"
                        value={formData.quote}
                        onChange={(e) => handleInputChange(e, 'quote')}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group mt-3">
                  <label htmlFor="difficultyLevel" className="form-label">Difficulty Level</label>
                  <select
                    name="difficultyLevel"
                    id="difficultyLevel"
                    className="form-control"
                    value={formData.difficultyLevel}
                    onChange={(e) => handleInputChange(e, 'difficultyLevel')}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Publish Status */}
            <div className="dashboard-box mb-4 border rounded p-4 bg-white">
              <div className="custom-field-wrap">
                <h4 className="mb-3">Publish Status</h4>
                <div className="form-group mb-3">
                  <label htmlFor="status" className="form-label required-field">Status</label>
                  <select
                    name="status"
                    id="status"
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => handleInputChange(e, 'status')}
                    required
                  >
                    <option value="Pending">Draft</option>
                    <option value="Active">Publish</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div className="form-group">
                  <button type="submit" className="btn btn-primary w-100">
                    Update Package
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    </div>
  );
};

export default PackageEdit;
