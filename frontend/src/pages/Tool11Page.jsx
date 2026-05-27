import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ArrowRight,
  ClipboardList,
  ChevronDown,
  Trash2,
  Plus,
  Activity,
  BarChart2,
  Target,
  FileText,
  MessageSquare,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import RatingSection from '../components/ui/RatingSection';

/* ─── Rating Configuration ──────────────────────────────────────── */
const RATING_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const getRatingColor = (rating) => {
  switch (Number(rating)) {
    case 1: return { bg: '#ebfbf0', text: '#111827' };
    case 1.5: return { bg: '#dcfce7', text: '#111827' };
    case 2: return { bg: '#bbf7d0', text: '#111827' };
    case 2.5: return { bg: '#86efac', text: '#111827' };
    case 3: return { bg: '#4ade80', text: '#111827' };
    case 3.5: return { bg: '#22c55e', text: '#ffffff' };
    case 4: return { bg: '#16a34a', text: '#ffffff' };
    case 4.5: return { bg: '#15803d', text: '#ffffff' };
    case 5: return { bg: '#166534', text: '#ffffff' };
    default: return { bg: '#ffffff', text: '#9ca3af' };
  }
};

const createRow = () => ({
  attribute: '',
  indicator: '',
  threshold: '',
  overallState: '',
  comparison: '',
  status: '',
  trend: '',
  managementMeasures: ''
});

/* ─── Custom Picker Dropdown for Rating ─────────────────────────── */
function RatingDropdown({ id, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => {
    onSelect(opt);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      id={id}
      className="tool-3-question-picker"
    >
      <button
        type="button"
        className="tool-3-question-picker__button"
        onClick={() => setOpen((p) => !p)}
      >
        <span style={{ color: value ? 'inherit' : '#9ca3af' }}>{value || 'Select'}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="tool-3-question-picker__menu" style={{ maxHeight: '160px' }}>
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`tool-3-question-picker__option${value === opt ? ' selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function Tool11Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [rating, setRating] = useState(null);

  // Table rows
  const [rows, setRows] = useState([createRow()]);

  // Bottom section data
  const [analysisAndConclusions, setAnalysisAndConclusions] = useState('');
  const [gapsAndChallenges, setGapsAndChallenges] = useState('');
  const [opportunitiesAndRecommendations, setOpportunitiesAndRecommendations] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, assessmentRes] = await Promise.all([
          getSite(siteId),
          getAssessment(siteId, 11),
        ]);
        setSite(siteRes.data);
        if (assessmentRes.data?.data) {
          if (assessmentRes.data.data.rows?.length) {
            setRows(assessmentRes.data.data.rows);
          }
          if (assessmentRes.data.data.bottomSections) {
            setAnalysisAndConclusions(assessmentRes.data.data.bottomSections.analysisAndConclusions || '');
            setGapsAndChallenges(assessmentRes.data.data.bottomSections.gapsAndChallenges || '');
            setOpportunitiesAndRecommendations(assessmentRes.data.data.bottomSections.opportunitiesAndRecommendations || '');
          }
          if (assessmentRes.data.rating) {
            setRating(assessmentRes.data.rating);
          }
        }
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [siteId]);

  const handleRowChange = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        return { ...row, [field]: value };
      })
    );
  };

  const addRow = () => setRows((prev) => [...prev, createRow()]);

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 11,
        data: {
          rows,
          bottomSections: {
            analysisAndConclusions,
            gapsAndChallenges,
            opportunitiesAndRecommendations
          }
        },
        rating: rating,
        isCompleted: isNext,
      });
      toast.success('Assessment saved successfully');
      if (isNext) navigate(`/sites/${siteId}/tool/12`);
    } catch {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <motion.div className="tool-page tool-11-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tool-header">
        <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
          <ArrowLeft size={18} /> Back to Site
        </button>
        <div className="tool-title-group">
          <h1>Tool 11: Outcomes – Monitoring the state of conservation</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet tool-11-worksheet" style={{ borderColor: 'white' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-11-table">
            <colgroup>
              <col className="tool-11-col-attribute" />
              <col className="tool-11-col-indicator" />
              <col className="tool-11-col-threshold" />
              <col className="tool-11-col-overallState" />
              <col className="tool-11-col-comparison" />
              <col className="tool-11-col-status" />
              <col className="tool-11-col-trend" />
              <col className="tool-11-col-management" />
              <col className="tool-11-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="9">
                  <div className="worksheet-title-content">
                    <Activity size={18} />
                    <span>Worksheet 11. Assessment of monitoring programme of the state of conservation</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                <th rowSpan="2">
                  <div className="header-content-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '4px' }}>
                    <ClipboardList size={16} />
                    <span>Attribute(s)</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="header-content-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '4px' }}>
                    <Target size={16} />
                    <span>Indicator</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="header-content-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '4px' }}>
                    <BarChart2 size={16} />
                    <span>Threshold</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="header-content-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '4px' }}>
                    <FileText size={16} />
                    <span>Overall state of conservation of the attribute(s)</span>
                  </div>
                </th>
                <th rowSpan="2">
                  <div className="header-content-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '4px' }}>
                    <BarChart2 size={16} />
                    <span>Comparison with baseline and last assessment</span>
                  </div>
                </th>
                <th colSpan="2" className="text-center">
                  Rating
                </th>
                <th rowSpan="2">
                  <div className="header-content-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '4px' }}>
                    <Target size={16} />
                    <span>Management measures: Urgency and details of actions</span>
                  </div>
                </th>
                <th rowSpan="2" className="tool-3-actions-header" />
              </tr>
              <tr className="sub-header-row secondary-header">
                <th className="sub-col-header text-center">Status</th>
                <th className="sub-col-header text-center">Trend</th>
              </tr>
              <tr className="instruction-row">
                <td className="instruction-text">List the attribute or attributes related to the indicator</td>
                <td className="instruction-text">List the indicator used to measure the condition of the attribute(s)</td>
                <td className="instruction-text">List the threshold acceptable range of variation</td>
                <td className="instruction-text">Assess the overall state of conservation of the attribute(s) here</td>
                <td className="instruction-text">How does this compare with any previous assessments?</td>
                <td colSpan="2" className="instruction-text text-center">Summarize the state and trend of the condition of the attribute(s)</td>
                <td className="instruction-text">Identify any specific actions needed in response to monitoring information collected</td>
                <td />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="tool-11-data-row">
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.attribute || ''}
                      onChange={(e) => handleRowChange(rowIndex, 'attribute', e.target.value)}
                      placeholder="Enter attribute(s)..."
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.indicator || ''}
                      onChange={(e) => handleRowChange(rowIndex, 'indicator', e.target.value)}
                      placeholder="Enter indicator..."
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.threshold || ''}
                      onChange={(e) => handleRowChange(rowIndex, 'threshold', e.target.value)}
                      placeholder="Enter threshold..."
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.overallState || ''}
                      onChange={(e) => handleRowChange(rowIndex, 'overallState', e.target.value)}
                      placeholder="Enter overall state..."
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.comparison || ''}
                      onChange={(e) => handleRowChange(rowIndex, 'comparison', e.target.value)}
                      placeholder="Enter comparison..."
                    />
                  </td>
                  {/* Rating: Status */}
                  <td className="rating-cell">
                    <RatingDropdown
                      id={`status-${rowIndex}`}
                      value={row.status}
                      onSelect={(val) => handleRowChange(rowIndex, 'status', val)}
                    />
                  </td>
                  {/* Rating: Trend */}
                  <td className="rating-cell">
                    <RatingDropdown
                      id={`trend-${rowIndex}`}
                      value={row.trend}
                      onSelect={(val) => handleRowChange(rowIndex, 'trend', val)}
                    />
                  </td>
                  <td>
                    <textarea
                      className="table-textarea"
                      value={row.managementMeasures || ''}
                      onChange={(e) => handleRowChange(rowIndex, 'managementMeasures', e.target.value)}
                      placeholder="Enter management measures..."
                    />
                  </td>
                  <td className="delete-row-cell">
                    <button
                      className="row-action-btn delete"
                      onClick={() => removeRow(rowIndex)}
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="add-row-container">
                <td colSpan="9">
                  <button className="add-row-btn" onClick={addRow}>
                    <Plus size={14} /> Add Row
                  </button>
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>

        {/* Bottom Sections */}
        <table className="worksheet-table tool-11-bottom-table" style={{ width: '100%', borderTop: 'none' }}>
          <colgroup>
            <col style={{ width: '25%' }} />
            <col style={{ width: '75%' }} />
          </colgroup>
          <tbody>
            <tr className="bottom-section-row">
              <td className="bottom-section-label">
                Analysis and conclusions
              </td>
              <td>
                <textarea
                  className="table-textarea"
                  value={analysisAndConclusions}
                  onChange={(e) => setAnalysisAndConclusions(e.target.value)}
                  placeholder="Enter analysis and conclusions here..."
                  style={{ minHeight: '80px' }}
                />
              </td>
            </tr>
            <tr className="bottom-section-row">
              <td className="bottom-section-label">
                Gaps and challenges
              </td>
              <td>
                <textarea
                  className="table-textarea"
                  value={gapsAndChallenges}
                  onChange={(e) => setGapsAndChallenges(e.target.value)}
                  placeholder="Enter gaps and challenges here..."
                  style={{ minHeight: '80px' }}
                />
              </td>
            </tr>
            <tr className="bottom-section-row">
              <td className="bottom-section-label">
                Opportunities, recommendations and follow-up actions
              </td>
              <td>
                <textarea
                  className="table-textarea"
                  value={opportunitiesAndRecommendations}
                  onChange={(e) => setOpportunitiesAndRecommendations(e.target.value)}
                  placeholder="Enter opportunities and recommendations here..."
                  style={{ minHeight: '80px' }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <RatingSection 
          title="RATING: MONITORING THE STATE OF CONSERVATION" 
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
          Save &amp; Next
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
