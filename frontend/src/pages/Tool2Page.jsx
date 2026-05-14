import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

export default function Tool2Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [rating, setRating] = useState(null);
  
  const [formData, setFormData] = useState({
    factors: [
      { 
        factor: '', 
        posNeg: '', 
        currentPotential: '', 
        origin: '', 
        causes: '', 
        attributes: '', 
        extent: '', 
        severity: '', 
        action: '', 
        priority: '', 
        responsibility: '', 
        comment: '' 
      },
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
          getAssessment(siteId, 2)
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

  const handleInputChange = (index, field, value) => {
    const newData = { ...formData };
    newData.factors[index][field] = value;
    setFormData(newData);
  };

  const handleTextareaChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRow = () => {
    setFormData(prev => ({
      ...prev,
      factors: [...prev.factors, { 
        factor: '', posNeg: '', currentPotential: '', origin: '', causes: '', attributes: '', 
        extent: '', severity: '', action: '', priority: '', responsibility: '', comment: '' 
      }]
    }));
  };

  const removeRow = (index) => {
    setFormData(prev => ({
      ...prev,
      factors: prev.factors.filter((_, i) => i !== index)
    }));
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
        toolNumber: 2,
        data: formData,
        rating: rating,
        isCompleted: isNext
      });
      toast.success('Assessment saved successfully');
      if (isNext) {
        navigate(`/sites/${siteId}/tool/3`); // Tool 3 doesn't exist yet but following the pattern
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
          <h1>Worksheet 2. Analysis of factors affecting the property</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet">
        <table className="worksheet-table tool-2-table">
          <thead>
            <tr className="main-header">
              <th colSpan="13">Worksheet 2. Analysis of factors affecting the property</th>
            </tr>
            <tr className="sub-header">
              <th rowSpan="2">Factor</th>
              <th rowSpan="2">Positive or negative</th>
              <th rowSpan="2">Current or potential</th>
              <th rowSpan="2">Origin: inside or outside</th>
              <th rowSpan="2">Causes</th>
              <th rowSpan="2">Attributes affected</th>
              <th colSpan="2">Impact of factor</th>
              <th colSpan="3">Management measures</th>
              <th rowSpan="2">Comment/ Explanation</th>
              <th rowSpan="2" className="w-10"></th>
            </tr>
            <tr className="sub-header">
              <th>Extent</th>
              <th>Severity</th>
              <th>Action</th>
              <th>Priority for action</th>
              <th>Responsibility</th>
            </tr>
          </thead>
          <tbody>
            {formData.factors.map((row, idx) => (
              <tr key={`factor-${idx}`}>
                <td><textarea value={row.factor} onChange={(e) => handleInputChange(idx, 'factor', e.target.value)} /></td>
                <td><textarea value={row.posNeg} onChange={(e) => handleInputChange(idx, 'posNeg', e.target.value)} /></td>
                <td><textarea value={row.currentPotential} onChange={(e) => handleInputChange(idx, 'currentPotential', e.target.value)} /></td>
                <td><textarea value={row.origin} onChange={(e) => handleInputChange(idx, 'origin', e.target.value)} /></td>
                <td><textarea value={row.causes} onChange={(e) => handleInputChange(idx, 'causes', e.target.value)} /></td>
                <td><textarea value={row.attributes} onChange={(e) => handleInputChange(idx, 'attributes', e.target.value)} /></td>
                <td><textarea value={row.extent} onChange={(e) => handleInputChange(idx, 'extent', e.target.value)} /></td>
                <td><textarea value={row.severity} onChange={(e) => handleInputChange(idx, 'severity', e.target.value)} /></td>
                <td><textarea value={row.action} onChange={(e) => handleInputChange(idx, 'action', e.target.value)} /></td>
                <td><textarea value={row.priority} onChange={(e) => handleInputChange(idx, 'priority', e.target.value)} /></td>
                <td><textarea value={row.responsibility} onChange={(e) => handleInputChange(idx, 'responsibility', e.target.value)} /></td>
                <td><textarea value={row.comment} onChange={(e) => handleInputChange(idx, 'comment', e.target.value)} /></td>
                <td>
                  <button className="row-action-btn delete" onClick={() => removeRow(idx)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="13">
                <button className="add-row-btn" onClick={addRow}>
                  <Plus size={14} /> Add Factor
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
          <h3 className="rating-title">Rating: Analysis of Factors</h3>
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
