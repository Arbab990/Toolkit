import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, ArrowRight, Plus, Trash2, ChevronDown, ClipboardList } from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import RatingSection from '../components/ui/RatingSection';

/* ─── Reusable picker dropdown ──────────────────────────────────── */
function PickerDropdown({ id, value, placeholder, options, onSelect, disabled }) {
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
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto', position: 'relative' }}
    >
      <button
        type="button"
        className="tool-3-question-picker__button"
        onClick={() => setOpen((p) => !p)}
        disabled={disabled}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          padding: '4px 8px',
          cursor: 'pointer',
          color: 'inherit',
        }}
      >
        <span style={{ color: value ? 'inherit' : '#9ca3af', fontSize: '12px' }}>{value || placeholder}</span>
        <ChevronDown size={14} style={{ color: '#6b7280' }} />
      </button>
      {open && (
        <div
          className="tool-3-question-picker__menu"
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
            minWidth: '100%',
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`tool-3-question-picker__option${value === opt ? ' selected' : ''}`}
              onClick={() => handleSelect(opt)}
              style={{
                display: 'block',
                width: '100%',
                background: value === opt ? '#fef3c7' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                padding: '5px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left',
                color: '#374151',
              }}
            >
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
        placeholder={sources?.length ? '' : 'Add source...'}
      />
    </div>
  );
};

export default function Tool1Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [ratings, setRatings] = useState({
    '1a': null,
    '1b': null,
  });

  const [formData, setFormData] = useState({
    worksheet1a: [
      { levelOfRecognition: '', values: '', attributes: '', sources: [] },
      { levelOfRecognition: '', values: '', attributes: '', sources: [] },
      { levelOfRecognition: '', values: '', attributes: '', sources: [] },
    ],
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
    analysis1a: '',
    gaps1a: '',
    recommendations1a: '',
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
          setFormData({
            ...assessmentRes.data,
            worksheet1a: assessmentRes.data.worksheet1a || [
              { levelOfRecognition: '', values: '', attributes: '', sources: [] },
              { levelOfRecognition: '', values: '', attributes: '', sources: [] },
              { levelOfRecognition: '', values: '', attributes: '', sources: [] },
            ]
          });
          if (assessmentRes.data.rating !== undefined) {
            if (typeof assessmentRes.data.rating === 'object' && assessmentRes.data.rating !== null) {
              setRatings(assessmentRes.data.rating);
            } else {
              setRatings(prev => ({ ...prev, '1b': assessmentRes.data.rating }));
            }
          } else if (assessmentRes.rating !== undefined) {
            if (typeof assessmentRes.rating === 'object' && assessmentRes.rating !== null) {
              setRatings(assessmentRes.rating);
            } else {
              setRatings(prev => ({ ...prev, '1b': assessmentRes.rating }));
            }
          }
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
    let newRow;
    if (section === 'managementObjectives') {
      newRow = { objective: '', values: '', sources: '', comments: '' };
    } else if (section === 'desiredOutcomes') {
      newRow = { outcome: '', values: '', sources: '', comments: '' };
    } else if (section === 'worksheet1a') {
      newRow = { levelOfRecognition: '', values: '', attributes: '', sources: [] };
    }

    if (newRow && newData[section]) {
      newData[section].push(newRow);
      setFormData(newData);
    }
  };

  const removeRow = (section, index) => {
    const newData = { ...formData };
    newData[section] = newData[section].filter((_, i) => i !== index);
    setFormData(newData);
  };



  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 1,
        data: formData,
        rating: ratings,
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

      <div className="excel-worksheet" style={{ borderColor: 'white', marginBottom: '32px' }}>
        <table className="worksheet-table structured-tool-table">
          <thead>
            <tr className="worksheet-title-row">
              <th colSpan="5">
                <div className="worksheet-title-content">
                  <ClipboardList size={18} />
                  <span>Worksheet 1a. Assessment of values and attributes</span>
                </div>
              </th>
            </tr>
            <tr className="sub-header-row">
              <th style={{ width: '15%' }}>Level of recognition</th>
              <th style={{ width: '25%' }}>Values</th>
              <th style={{ width: '25%' }}>Attributes</th>
              <th style={{ width: '30%' }}>Sources of information used</th>
              <th style={{ width: '5%' }} className="action-col"></th>
            </tr>
          </thead>
          <tbody>
            {(formData.worksheet1a || []).map((row, idx) => (
              <tr key={`w1a-${idx}`}>
                <td style={{ verticalAlign: 'top' }}>
                  <PickerDropdown
                    id={`recognition-picker-${idx}`}
                    value={row.levelOfRecognition}
                    placeholder="Select"
                    options={['OUV', 'National', 'Local']}
                    onSelect={(val) => handleInputChange('worksheet1a', idx, 'levelOfRecognition', val)}
                  />
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <textarea
                    className="table-textarea"
                    value={row.values}
                    onChange={(e) => handleInputChange('worksheet1a', idx, 'values', e.target.value)}
                  />
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <textarea
                    className="table-textarea"
                    value={row.attributes}
                    onChange={(e) => handleInputChange('worksheet1a', idx, 'attributes', e.target.value)}
                  />
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <SourcesInput
                    sources={row.sources}
                    onChange={(newSources) => handleInputChange('worksheet1a', idx, 'sources', newSources)}
                  />
                </td>
                <td className="delete-row-cell" style={{ verticalAlign: 'top' }}>
                  <button className="row-action-btn delete" onClick={() => removeRow('worksheet1a', idx)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            <tr className="add-row-container">
              <td colSpan="5">
                <button className="add-row-btn" onClick={() => addRow('worksheet1a')}>
                  <Plus size={14} /> Add Row
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="worksheet-bottom-sections">
          <div className="bottom-section">
            <div className="section-label">Analysis and conclusions</div>
            <textarea
              value={formData.analysis1a || ''}
              onChange={(e) => handleTextareaChange('analysis1a', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea
              value={formData.gaps1a || ''}
              onChange={(e) => handleTextareaChange('gaps1a', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea
              value={formData.recommendations1a || ''}
              onChange={(e) => handleTextareaChange('recommendations1a', e.target.value)}
              placeholder="Enter opportunities and recommendations here..."
            />
          </div>
        </div>

        <RatingSection
          title="RATING: VALUES AND ATTRIBUTES"
          rating={ratings['1a']}
          onRatingChange={(r) => setRatings(prev => ({ ...prev, '1a': r }))}
        />
      </div>

      <div className="excel-worksheet" style={{ borderColor: 'white' }}>
        <table className="worksheet-table structured-tool-table">
          <thead>
            <tr className="worksheet-title-row">
              <th colSpan="5">
                <div className="worksheet-title-content">
                  <ClipboardList size={18} />
                  <span>Worksheet 1b. Assessment of management objectives</span>
                </div>
              </th>
            </tr>
            <tr className="sub-header-row">
              <th className="w-1/4">Management objectives</th>
              <th className="w-1/4">Values and attributes</th>
              <th className="w-1/4">Sources of information used</th>
              <th className="w-1/4">Comments</th>
              <th className="w-10 action-col"></th>
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

            <tr className="sub-header-row">
              <th>Desired management outcomes</th>
              <th>Values and attributes</th>
              <th>Sources of information used</th>
              <th>Comments</th>
              <th className="action-col"></th>
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

        <RatingSection
          title="RATING: MANAGEMENT OBJECTIVES"
          rating={ratings['1b']}
          onRatingChange={(r) => setRatings(prev => ({ ...prev, '1b': r }))}
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
