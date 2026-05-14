import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Globe, 
  Type, 
  FileText, 
  Image as ImageIcon, 
  X, 
  ArrowLeft,
  Save,
  Plus
} from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { createSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import SubmitButton from '../components/auth/SubmitButton';

const categoryOptions = [
  { value: 'Natural', label: 'Natural' },
  { value: 'Cultural Landscape', label: 'Cultural Landscape' },
  { value: 'Historic Monument', label: 'Historic Monument' },
  { value: 'Religious Site', label: 'Religious Site' },
  { value: 'Mixed Site', label: 'Mixed Site' },
];

const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: 'var(--color-card)',
    borderColor: 'var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    padding: '2px 6px',
    fontSize: '13px',
    boxShadow: 'none',
    minHeight: '38px',
    '&:hover': {
      borderColor: 'var(--color-neutral-300)',
    },
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected 
      ? 'var(--color-primary-600)' 
      : isFocused 
        ? 'var(--color-primary-50)' 
        : 'transparent',
    color: isSelected ? '#ffffff' : 'var(--color-neutral-900)',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '8px 12px',
  }),
};

// Validation Schema
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Site name is required'),
  siteUrl: Yup.string().url('Invalid URL format'),
  country: Yup.object().nullable().required('Country is required'),
  category: Yup.object().required('Category is required'),
  description: Yup.string(),
});

export default function NewSitePage() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  
  const navigate = useNavigate();
  const toast = useToast();

  const initialValues = {
    name: '',
    siteUrl: '',
    description: '',
    category: categoryOptions[0],
    country: null,
    state: null,
    city: null,
    image: null,
  };

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFieldValue('image', file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (setFieldValue) => {
    setFieldValue('image', null);
    setPreview(null);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    // Construct location label
    let locationLabel = values.country.label;
    if (values.city) {
      locationLabel = `${values.city.label}, ${values.country.label}`;
    } else if (values.state) {
      locationLabel = `${values.state.label}, ${values.country.label}`;
    }

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('siteUrl', values.siteUrl);
      formData.append('location', locationLabel);
      formData.append('country', values.country.label);
      formData.append('category', values.category.value);
      formData.append('description', values.description);
      
      if (values.image) {
        formData.append('images', values.image);
      }

      await createSite(formData);
      toast.success('Heritage site created successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create heritage site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="new-site-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="new-site-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          Back to Sites
        </button>
        <h1 className="new-site-title">Create New Heritage Site</h1>
        <p className="new-site-subtitle">Enter the basic details to start a new assessment.</p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, isValid, dirty }) => (
          <Form className="new-site-form">
            <div className="form-grid">
              {/* Basic Info Section */}
              <div className="form-section">
                <h2 className="form-section-title">Basic Information</h2>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Site Name*</label>
                  <div className={`form-input-wrapper ${errors.name && touched.name ? 'form-input-wrapper--error' : ''}`}>
                    <span className="form-input-icon"><Type size={16} /></span>
                    <Field 
                      name="name"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Ancient Temple Complex"
                    />
                  </div>
                  <ErrorMessage name="name" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="siteUrl">Site URL (External Link)</label>
                  <div className={`form-input-wrapper ${errors.siteUrl && touched.siteUrl ? 'form-input-wrapper--error' : ''}`}>
                    <span className="form-input-icon"><Globe size={16} /></span>
                    <Field 
                      name="siteUrl"
                      type="url" 
                      className="form-input" 
                      placeholder="https://unesco.org/site-details"
                    />
                  </div>
                  <ErrorMessage name="siteUrl" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label className="form-label">Location*</label>
                  <div className="location-container">
                    <div className="location-grid">
                      <div className="form-group">
                        <label className="form-label secondary-label">Country</label>
                        <Select
                          options={Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }))}
                          styles={customSelectStyles}
                          value={values.country}
                          onChange={(val) => {
                            setFieldValue('country', val);
                            setFieldValue('state', null);
                            setFieldValue('city', null);
                          }}
                          placeholder="Select Country"
                        />
                        <ErrorMessage name="country" component="div" className="form-error" />
                      </div>
                      <div className="form-group">
                        <label className="form-label secondary-label">Category</label>
                        <Select
                          options={categoryOptions}
                          styles={customSelectStyles}
                          value={values.category}
                          onChange={(val) => setFieldValue('category', val)}
                        />
                      </div>
                    </div>

                    <div className="location-grid">
                      <div className="form-group">
                        <label className="form-label secondary-label">State / Region (Optional)</label>
                        <Select
                          options={values.country ? State.getStatesOfCountry(values.country.value).map(s => ({ value: s.isoCode, label: s.name })) : []}
                          styles={customSelectStyles}
                          value={values.state}
                          onChange={(val) => {
                            setFieldValue('state', val);
                            setFieldValue('city', null);
                          }}
                          placeholder="Select State"
                          isDisabled={!values.country}
                          isClearable
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label secondary-label">City (Optional)</label>
                        <Select
                          options={values.state ? City.getCitiesOfState(values.country.value, values.state.value).map(c => ({ value: c.name, label: c.name })) : []}
                          styles={customSelectStyles}
                          value={values.city}
                          onChange={(val) => setFieldValue('city', val)}
                          placeholder="Select City"
                          isDisabled={!values.state}
                          isClearable
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="form-section">
                <h2 className="form-section-title">Description</h2>
                <div className="form-group">
                  <div className="form-textarea-wrapper">
                    <span className="form-textarea-icon"><FileText size={16} /></span>
                    <Field 
                      name="description"
                      as="textarea"
                      className="form-textarea" 
                      placeholder="Provide a brief history and significance of the site..."
                      rows="6"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload & Action Section */}
              <div className="form-section col-span-2">
                <h2 className="form-section-title">Site Image & Submission</h2>
                <div className="image-upload-container">
                  <label className="image-upload-box" htmlFor="images">
                    <Plus size={24} />
                    <span>{preview ? 'Replace Image' : 'Add Image from Local Storage'}</span>
                    <input 
                      type="file" 
                      id="images" 
                      accept="image/*" 
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                      hidden
                    />
                  </label>
                  
                  {preview && (
                    <div className="image-previews">
                      <motion.div 
                        className="image-preview-item"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <img src={preview} alt="Preview" />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeImage(setFieldValue)}
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Buttons inside the card */}
                <div className="form-actions-inline">
                  <button 
                    type="button" 
                    className="btn-cancel-small" 
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </button>
                  <SubmitButton 
                    loading={loading} 
                    icon={Save}
                  >
                    <motion.span
                      whileHover={{ x: 3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      Create Heritage Site
                    </motion.span>
                  </SubmitButton>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
}
