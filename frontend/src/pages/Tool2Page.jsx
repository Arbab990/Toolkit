import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, ArrowRight, Plus, Trash2,
  ClipboardList, PlusCircle, CircleDashed, Home,
  HelpCircle, Settings, BarChart2, Shield, MessageSquare
} from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import RatingSection from '../components/ui/RatingSection';

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
        factor: '', posNeg: '', currentPotential: '', origin: '', causes: '',
        attributes: '', extent: '', severity: '', action: '', priority: '',
        responsibility: '', comment: ''
      },
      {
        factor: '', posNeg: '', currentPotential: '', origin: '', causes: '',
        attributes: '', extent: '', severity: '', action: '', priority: '',
        responsibility: '', comment: ''
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
        factor: '', posNeg: '', currentPotential: '', origin: '', causes: '',
        attributes: '', extent: '', severity: '', action: '', priority: '',
        responsibility: '', comment: ''
      }]
    }));
  };

  const removeRow = (index) => {
    setFormData(prev => ({
      ...prev,
      factors: prev.factors.filter((_, i) => i !== index)
    }));
  };

  const options = {
    posNeg: ['Positive', 'Negative'],
    currentPotential: ['Current', 'Potential'],
    origin: ['Inside', 'Outside'],
    extent: ['Low', 'Medium', 'High'],
    severity: ['Low', 'Medium', 'High'],
    priority: ['Low', 'Medium', 'High'],
  };


  const getCapsuleClass = (value) => {
    if (!value) return '';
    const v = value.toLowerCase();
    if (v === 'positive' || v === 'high') return 'as-capsule val-positive';
    if (v === 'negative' || v === 'low') return 'as-capsule val-negative';
    if (v === 'current' || v === 'potential' || v === 'medium') return 'as-capsule val-potential';
    if (v === 'inside' || v === 'outside') return 'as-capsule val-origin';
    return '';
  };

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
        navigate(`/sites/${siteId}/tool/3`);
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
      className="tool-page tool-2-page"
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

      <div className="excel-worksheet" style={{ borderColor: 'white' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-2-table">
            <colgroup>
              <col className="tool-2-narrow-col" />
              <col className="tool-2-text-col" />
              <col className="tool-2-tight-select-col" />
              <col className="tool-2-tight-select-col" />
              <col className="tool-2-tight-select-col" />
              <col className="tool-2-text-col" />
              <col className="tool-2-text-col" />
              <col className="tool-2-impact-col" />
              <col className="tool-2-impact-col" />
              <col className="tool-2-wide-text-col" />
              <col className="tool-2-priority-col" />
              <col className="tool-2-wide-text-col" />
              <col className="tool-2-text-col" />
              <col className="tool-2-narrow-col" />
            </colgroup>
            <thead>
              <tr className="main-header-row">
                <th rowSpan="2" className="no-col">No.</th>
                <th rowSpan="2">
                  <div className="th-content">
                    <ClipboardList size={18} />
                    <span>Factor</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="th-content">
                    <PlusCircle size={18} />
                    <span>Positive or negative</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="th-content">
                    <CircleDashed size={18} />
                    <span>Current or potential</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="th-content">
                    <Home size={18} />
                    <span>Origin: inside or outside</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="th-content">
                    <HelpCircle size={18} />
                    <span>Causes</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="th-content">
                    <Settings size={18} />
                    <span>Attributes affected</span>
                  </div>
                </th>
                <th colSpan="2" className="group-span">
                  <div className="th-content">
                    <BarChart2 size={18} />
                    <span>Impact of factor</span>
                  </div>
                </th>
                <th colSpan="3" className="group-span">
                  <div className="th-content">
                    <Shield size={18} />
                    <span>Management measures</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="th-content">
                    <MessageSquare size={18} />
                    <span>Comment / Explanation</span>
                  </div>
                </th>
                <th rowSpan="2" className="action-col"></th>
              </tr>
              <tr className="sub-header-row">
                {/* Columns covered by rowSpan above are empty here */}
                <th>Extent</th>
                <th>Severity</th>
                <th>Action</th>
                <th>Priority for action</th>
                <th>Responsibility</th>
              </tr>
            </thead>
            <tbody>
              {/* Example Row */}
              <tr className="example-row instruction-row">
                <td className="row-no"></td>
                <td className="example-text"></td>
                <td className="example-text">Positive / Negative</td>
                <td className="example-text">Current / Potential</td>
                <td className="example-text">Inside / Outside</td>
                <td className="example-text">Why does this factor exist?</td>
                <td className="example-text">Which property attributes are affected?</td>
                <td className="example-text">Low / Medium / High</td>
                <td className="example-text">Low / Medium / High</td>
                <td className="example-text">What action can be taken?</td>
                <td className="example-text">High / Medium / Low</td>
                <td className="example-text">Who is responsible?</td>
                <td className="example-text">Additional notes or explanation</td>
                <td className="delete-row-cell"></td>
              </tr>

              {formData.factors.map((row, idx) => (
                <tr key={`factor-${idx}`}>
                  <td className="row-no">
                    <div className="numbered-circle">{idx + 1}</div>
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.factor}
                      onChange={(e) => handleInputChange(idx, 'factor', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="table-select-container">
                      <select
                        className={`table-select ${getCapsuleClass(row.posNeg)}`}
                        value={row.posNeg}
                        onChange={(e) => handleInputChange(idx, 'posNeg', e.target.value)}
                      >
                        <option value="">Select</option>
                        {options.posNeg.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="table-select-container">
                      <select
                        className={`table-select ${getCapsuleClass(row.currentPotential)}`}
                        value={row.currentPotential}
                        onChange={(e) => handleInputChange(idx, 'currentPotential', e.target.value)}
                      >
                        <option value="">Select</option>
                        {options.currentPotential.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="table-select-container">
                      <select
                        className={`table-select ${getCapsuleClass(row.origin)}`}
                        value={row.origin}
                        onChange={(e) => handleInputChange(idx, 'origin', e.target.value)}
                      >
                        <option value="">Select</option>
                        {options.origin.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.causes}
                      onChange={(e) => handleInputChange(idx, 'causes', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.attributes}
                      onChange={(e) => handleInputChange(idx, 'attributes', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="table-select-container">
                      <select
                        className={`table-select ${getCapsuleClass(row.extent)}`}
                        value={row.extent}
                        onChange={(e) => handleInputChange(idx, 'extent', e.target.value)}
                      >
                        <option value="">Select</option>
                        {options.extent.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="table-select-container">
                      <select
                        className={`table-select ${getCapsuleClass(row.severity)}`}
                        value={row.severity}
                        onChange={(e) => handleInputChange(idx, 'severity', e.target.value)}
                      >
                        <option value="">Select</option>
                        {options.severity.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.action}
                      onChange={(e) => handleInputChange(idx, 'action', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="table-select-container">
                      <select
                        className={`table-select ${getCapsuleClass(row.priority)}`}
                        value={row.priority}
                        onChange={(e) => handleInputChange(idx, 'priority', e.target.value)}
                      >
                        <option value="">Select</option>
                        {options.priority.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.responsibility}
                      onChange={(e) => handleInputChange(idx, 'responsibility', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.comment}
                      onChange={(e) => handleInputChange(idx, 'comment', e.target.value)}
                    />
                  </td>
                  <td className="delete-row-cell">
                    <button className="row-action-btn delete" onClick={() => removeRow(idx)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="add-row-container">
                <td colSpan="14">
                  <button className="add-row-btn" onClick={addRow}>
                    <Plus size={14} /> Add Factor
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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

        <RatingSection 
          title="RATING: ANALYSIS OF FACTORS" 
          rating={rating} 
          onRatingChange={setRating} 
        />
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
