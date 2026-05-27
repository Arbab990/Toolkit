import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  Target,
  Flag,
  Star,
  History,
  BookOpen,
  MessageSquare,
  ClipboardList,
  ChevronDown
} from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import RatingSection from '../components/ui/RatingSection';

/* ─── SVG Star helpers ─────────────────────────────────────────── */
const FullStar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" style={{ display: 'block' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HalfStar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="halfStarGrad">
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill="url(#halfStarGrad)"
    />
  </svg>
);

const EmptyStar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ display: 'block' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/** Renders a row of 5 stars representing a numeric rating (1–5, step 0.5) */
const StarDisplay = ({ value, size = 14 }) => {
  const num = parseFloat(value) || 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map((pos) => {
        if (num >= pos) return <FullStar key={pos} size={size} />;
        if (num >= pos - 0.5) return <HalfStar key={pos} size={size} />;
        return <EmptyStar key={pos} size={size} />;
      })}
    </span>
  );
};

const STAR_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/** Custom dropdown showing visual star options; stores numeric value */
const StarRatingDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val); // numeric value stored
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      style={{ position: 'relative', width: '100%' }}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
          background: 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          padding: '4px 8px',
          cursor: 'pointer',
          fontSize: '12px',
          color: 'inherit',
        }}
      >
        {value ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', overflow: 'hidden', minWidth: 0 }}>
            <StarDisplay value={value} size={11} />
            <span style={{ color: '#6b7280', fontSize: '9px', lineHeight: 1, whiteSpace: 'nowrap' }}>({value})</span>
          </span>
        ) : (
          <span style={{ color: '#9ca3af', lineHeight: 1, fontSize: '11px' }}>Rate</span>
        )}
        <ChevronDown size={11} style={{ flexShrink: 0, color: '#6b7280' }} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 2px)',
            left: 0,
            zIndex: 50,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            padding: '4px',
            minWidth: '160px',
          }}
        >
          {STAR_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                background: value === opt ? '#fef3c7' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                padding: '5px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left',
              }}
            >
              <StarDisplay value={opt} size={16} />
              <span style={{ color: '#374151', fontWeight: value === opt ? 600 : 400 }}>
                {opt}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Column definitions ───────────────────────────────────────── */
const columns = [
  { key: 'indicator', label: 'Indicator', icon: Target },
  { key: 'outputTarget', label: 'Output target', icon: Flag },
  { key: 'performance', label: 'Performance', icon: Star },
  { key: 'previousPerformance', label: 'Performance/Level in previous year', icon: History },
  { key: 'sources', label: 'Source(s) of information', icon: BookOpen },
  { key: 'comments', label: 'Comments/Explanation', icon: MessageSquare },
];

const previousPerformanceOptions = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const createRow = () =>
  columns.reduce((row, col) => ({ ...row, [col.key]: col.key === 'sources' ? [] : '' }), {});
const createRows = () => [createRow()];

/* ─── Source(s) tag-input ──────────────────────────────────────── */
const SourcesInput = ({ sources = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.includes('; ')) {
      const parts = val.split('; ');
      const newSources = parts.slice(0, -1).map((p) => p.trim()).filter(Boolean);
      if (newSources.length > 0) {
        onChange([...(Array.isArray(sources) ? sources : []), ...newSources]);
      }
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(val);
    }
  };

  const removeSource = (i) => onChange(sources.filter((_, idx) => idx !== i));

  return (
    <div
      className="table-textarea"
      style={{
        display: 'flex', flexWrap: 'wrap', gap: '4px',
        alignItems: 'flex-start', cursor: 'text',
        backgroundColor: 'transparent', border: 'none', boxShadow: 'none',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.querySelector('input')?.focus();
      }}
    >
      {Array.isArray(sources) && sources.map((src, idx) => (
        <span
          key={idx}
          style={{
            backgroundColor: '#e5e7eb', color: '#000',
            padding: '2px 8px', borderRadius: '12px',
            fontSize: '11px', display: 'flex', alignItems: 'center',
            gap: '4px', margin: '2px 0',
          }}
        >
          {src}
          <button
            type="button"
            onClick={() => removeSource(idx)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1, color: '#6b7280' }}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        style={{
          flex: 1, minWidth: '80px', border: 'none', outline: 'none',
          backgroundColor: 'transparent', boxShadow: 'none', appearance: 'none',
          fontSize: '12px', padding: '2px', margin: 0, color: 'inherit',
        }}
      />
    </div>
  );
};

/* ─── Main page ────────────────────────────────────────────────── */
export default function Tool10Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [rating, setRating] = useState(null);
  const [formData, setFormData] = useState({
    rows: createRows(),
    analysis: '',
    gaps: '',
    recommendations: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, assessmentRes] = await Promise.all([
          getSite(siteId),
          getAssessment(siteId, 10),
        ]);
        setSite(siteRes.data);
        if (assessmentRes.data) {
          setFormData({
            rows: assessmentRes.data.rows?.length ? assessmentRes.data.rows : createRows(),
            analysis: assessmentRes.data.analysis || '',
            gaps: assessmentRes.data.gaps || '',
            recommendations: assessmentRes.data.recommendations || '',
          });
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
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  };

  const handleTextareaChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const addRow = () =>
    setFormData((prev) => ({ ...prev, rows: [...prev.rows, createRow()] }));

  const removeRow = (index) =>
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.length > 1 ? prev.rows.filter((_, i) => i !== index) : prev.rows,
    }));

  const getCapsuleClass = (value) => {
    if (!value) return '';
    const v = value.toLowerCase();
    if (v === 'high') return 'as-capsule val-positive';
    if (v === 'medium') return 'as-capsule val-potential';
    if (v === 'low') return 'as-capsule val-negative';
    return '';
  };

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 10,
        data: formData,
        rating: rating,
        isCompleted: isNext,
      });
      toast.success('Assessment saved successfully');
      if (isNext) navigate(`/sites/${siteId}/tool/11`);
    } catch {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <motion.div className="tool-page tool-10-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tool-header">
        <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
          <ArrowLeft size={18} /> Back to Site
        </button>
        <div className="tool-title-group">
          <h1>Tool 10: Outputs – Monitoring productivity</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet" style={{ borderColor: 'white' }}>
        {/* overflow visible so star dropdown shows above rows below */}
        <div className="table-responsive" style={{ overflow: 'visible' }}>
          <table className="worksheet-table structured-tool-table tool-10-table" style={{ overflow: 'visible' }}>
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} className={`tool-10-col-${col.key}`} />
              ))}
              <col className="tool-10-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="7">
                  <div className="worksheet-title-content">
                    <ClipboardList size={18} />
                    <span>Worksheet 10. Assessment of outputs</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                {columns.map((col) => (
                  <th key={col.key}>
                    <div className="th-content">
                      <col.icon size={18} />
                      <span>{col.label}</span>
                    </div>
                  </th>
                ))}
                <th className="action-col" />
              </tr>
            </thead>
            <tbody>
              {formData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="tool-10-data-row" style={{ overflow: 'visible' }}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ overflow: 'visible' }}>
                      {col.key === 'performance' ? (
                        <StarRatingDropdown
                          value={row[col.key]}
                          onChange={(val) => handleRowChange(rowIndex, col.key, val)}
                        />
                      ) : col.key === 'previousPerformance' ? (
                        <div className="table-select-container">
                          <select
                            className={`table-select approval-select ${getCapsuleClass(row[col.key])}`}
                            value={row[col.key] || ''}
                            onChange={(e) => handleRowChange(rowIndex, col.key, e.target.value)}
                          >
                            <option value="" disabled hidden>Select</option>
                            {previousPerformanceOptions.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : col.key === 'sources' ? (
                        <SourcesInput
                          sources={row[col.key] || []}
                          onChange={(newSources) => handleRowChange(rowIndex, col.key, newSources)}
                        />
                      ) : (
                        <textarea
                          className="table-textarea"
                          value={row[col.key] || ''}
                          onChange={(e) => handleRowChange(rowIndex, col.key, e.target.value)}
                        />
                      )}
                    </td>
                  ))}
                  <td className="delete-row-cell">
                    <button className="row-action-btn delete" onClick={() => removeRow(rowIndex)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="add-row-container">
                <td colSpan="7">
                  <button className="add-row-btn" onClick={addRow}>
                    <Plus size={14} /> Add Row
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
          title="RATING: IMPLEMENTATION OF MANAGEMENT ACTIONS" 
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
