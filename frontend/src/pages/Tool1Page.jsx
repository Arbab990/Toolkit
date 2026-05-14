import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

export default function Tool1Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [rating, setRating] = useState(null);
  
  const [formData, setFormData] = useState({
    managementObjectives: [
      { objective: '', values: '', sources: '', comments: '' },
      { objective: '', values: '', sources: '', comments: '' },
      { objective: '', values: '', sources: '', comments: '' },
    ],
    desiredOutcomes: [
      { outcome: '', values: '', sources: '', comments: '' },
      { outcome: '', values: '', sources: '', comments: '' },
      { outcome: '', values: '', sources: '', comments: '' },
    ],
    analysis: '',
    gaps: '',
    recommendations: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, assessmentRes] = await Promise.all([
          getSite(siteId),
          getAssessment(siteId, 1)
        ]);
        
        setSite(siteRes.data);
        if (assessmentRes.data) {
          setFormData(assessmentRes.data);
          setRating(assessmentRes.rating);
        }
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [siteId]);

  const handleInputChange = (section, index, field, value) => {
    const newData = { ...formData };
    newData[section][index][field] = value;
    setFormData(newData);
  };

  const handleTextareaChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRow = (section) => {
    const newData = { ...formData };
    const newRow = section === 'managementObjectives' 
      ? { objective: '', values: '', sources: '', comments: '' }
      : { outcome: '', values: '', sources: '', comments: '' };
    newData[section].push(newRow);
    setFormData(newData);
  };

  const removeRow = (section, index) => {
    const newData = { ...formData };
    newData[section] = newData[section].filter((_, i) => i !== index);
    setFormData(newData);
  };

  const ratingOptions = [
    { value: 'Good', label: 'Good', colorClass: 'good' },
    { value: 'Good with some concerns', label: 'Good with some concerns', colorClass: 'concerns' },
    { value: 'Significant concern', label: 'Significant concern', colorClass: 'significant' },
    { value: 'Critical', label: 'Critical', colorClass: 'critical' },
    { value: 'Data deficient', label: 'Data deficient', colorClass: 'deficient' },
  ];

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 1,
        data: formData,
        rating: rating,
        isCompleted: isNext
      });
      toast.success('Assessment saved successfully');
      if (isNext) {
        navigate(`/sites/${siteId}/tool/2`);
      }
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <motion.div 
      className="tool-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="tool-header">
        <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
          <ArrowLeft size={18} />
          Back to Site
        </button>
        <div className="tool-title-group">
          <h1>Worksheet 1b. Assessment of management objectives</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet">
        <table className="worksheet-table">
          <thead>
            <tr className="main-header">
              <th colSpan="5">Worksheet 1b. Assessment of management objectives</th>
            </tr>
            <tr className="sub-header">
              <th className="w-1/4">Management objectives</th>
              <th className="w-1/4">Values and attributes</th>
              <th className="w-1/4">Sources of information used</th>
              <th className="w-1/4">Comments</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {formData.managementObjectives.map((row, idx) => (
              <tr key={`obj-${idx}`}>
                <td><textarea value={row.objective} onChange={(e) => handleInputChange('managementObjectives', idx, 'objective', e.target.value)} /></td>
                <td><textarea value={row.values} onChange={(e) => handleInputChange('managementObjectives', idx, 'values', e.target.value)} /></td>
                <td><textarea value={row.sources} onChange={(e) => handleInputChange('managementObjectives', idx, 'sources', e.target.value)} /></td>
                <td><textarea value={row.comments} onChange={(e) => handleInputChange('managementObjectives', idx, 'comments', e.target.value)} /></td>
                <td>
                  <button className="row-action-btn delete" onClick={() => removeRow('managementObjectives', idx)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="5">
                <button className="add-row-btn" onClick={() => addRow('managementObjectives')}>
                  <Plus size={14} /> Add Objective
                </button>
              </td>
            </tr>

            <tr className="sub-header">
              <th>Desired management outcomes</th>
              <th>Values and attributes</th>
              <th>Sources of information used</th>
              <th>Comments</th>
              <th></th>
            </tr>
            {formData.desiredOutcomes.map((row, idx) => (
              <tr key={`out-${idx}`}>
                <td><textarea value={row.outcome} onChange={(e) => handleInputChange('desiredOutcomes', idx, 'outcome', e.target.value)} /></td>
                <td><textarea value={row.values} onChange={(e) => handleInputChange('desiredOutcomes', idx, 'values', e.target.value)} /></td>
                <td><textarea value={row.sources} onChange={(e) => handleInputChange('desiredOutcomes', idx, 'sources', e.target.value)} /></td>
                <td><textarea value={row.comments} onChange={(e) => handleInputChange('desiredOutcomes', idx, 'comments', e.target.value)} /></td>
                <td>
                  <button className="row-action-btn delete" onClick={() => removeRow('desiredOutcomes', idx)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="5">
                <button className="add-row-btn" onClick={() => addRow('desiredOutcomes')}>
                  <Plus size={14} /> Add Outcome
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="worksheet-bottom-sections">
          <div className="bottom-section">
            <div className="section-label">Analysis and conclusions</div>
            <textarea 
              value={formData.analysis} 
              onChange={(e) => handleTextareaChange('analysis', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea 
              value={formData.gaps} 
              onChange={(e) => handleTextareaChange('gaps', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea 
              value={formData.recommendations} 
              onChange={(e) => handleTextareaChange('recommendations', e.target.value)}
              placeholder="Enter opportunities and recommendations here..."
            />
          </div>
        </div>

        {/* Rating Section */}
        <div className="rating-section">
          <h3 className="rating-title">Rating: Management Objectives</h3>
          <div className="rating-options">
            {ratingOptions.map((opt) => (
              <motion.div 
                key={opt.value}
                className={`rating-option ${rating === opt.value ? 'selected' : ''}`}
                onClick={() => setRating(opt.value)}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <div className={`rating-dot ${opt.colorClass}`} />
                <span className={`rating-label ${opt.colorClass}`}>{opt.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="tool-footer">
        <button className="btn-save" onClick={() => onSave(false)} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Progress'}
        </button>
        <button className="btn-save-next" onClick={() => onSave(true)} disabled={saving}>
          Save & Next
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
