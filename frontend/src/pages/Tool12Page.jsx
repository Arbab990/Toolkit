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
} from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import RatingSection from '../components/ui/RatingSection';

/* ─── Tool → Worksheet mapping ─────────────────────────────────── */
const TOOL_WORKSHEET_MAP = [
  {
    tool: 'Tool 1: Values, attributes and management objectives',
    worksheets: [
      'Worksheet 1a: Assessment of values and attributes',
      'Worksheet 1b: Assessment of management objectives',
    ],
  },
  {
    tool: 'Tool 2: Factors affecting the property',
    worksheets: ['Worksheet 2: Analysis of factors affecting the property'],
  },
  {
    tool: 'Tool 3: Boundaries, buffer zones and the wider setting',
    worksheets: ['Worksheet 3: Assessment of boundaries, buffer zones and the wider setting'],
  },
  {
    tool: 'Tool 4: Governance arrangements',
    worksheets: [
      'Worksheet 4a: Assessment of roles and responsibilities of managers',
      'Worksheet 4b: Assessment of coordination and collaboration between managers',
      "Worksheet 4c: Assessment of rights-holders' engagement in management",
    ],
  },
  {
    tool: 'Tool 5: Legal, regulatory and customary framework',
    worksheets: [
      'Worksheet 5a: Assessment of legal framework',
      'Worksheet 5b: Assessment of compliance and enforcement of legal framework',
    ],
  },
  {
    tool: 'Tool 6: Management planning framework',
    worksheets: [
      'Worksheet 6a: Assessment of management planning framework',
      'Worksheet 6b: Assessment of primary planning instrument',
    ],
  },
  {
    tool: 'Tool 7: Needs and inputs',
    worksheets: [
      'Worksheet 7a: Assessment of human capacity',
      'Worksheet 7b: Assessment of financial resources',
      'Worksheet 7c: Assessment of other resources',
    ],
  },
  {
    tool: 'Tool 8: Management processes',
    worksheets: [
      'Worksheet 8a: Assessment of key management processes',
      'Worksheet 8b: Assessment of other important management processes',
    ],
  },
  {
    tool: 'Tool 9: Implementation of management measures',
    worksheets: [
      'Worksheet 9a: Assessment of implementation of planning instrument',
      'Worksheet 9b: Assessment of implementation approaches',
    ],
  },
  {
    tool: 'Tool 10: Outputs – Monitoring productivity',
    worksheets: ['Worksheet 10: Assessment of outputs'],
  },
  {
    tool: 'Tool 11: Outcomes – Monitoring the state of conservation',
    worksheets: ['Worksheet 11: Assessment of monitoring programme of the state of conservation'],
  },
];

const TOOL_LABELS = TOOL_WORKSHEET_MAP.map((t) => t.tool);

const createRow = () => ({ tool: '', worksheet: '', followUpActions: '' });

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
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    >
      <button
        type="button"
        className="tool-3-question-picker__button"
        onClick={() => setOpen((p) => !p)}
        disabled={disabled}
      >
        <span style={{ color: value ? 'inherit' : '#9ca3af' }}>{value || placeholder}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="tool-3-question-picker__menu">
          {options.map((opt) => (
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
export default function Tool12Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [rating, setRating] = useState(null);
  const [rows, setRows] = useState([createRow()]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, assessmentRes] = await Promise.all([
          getSite(siteId),
          getAssessment(siteId, 12),
        ]);
        setSite(siteRes.data);
        if (assessmentRes.data) {
          if (assessmentRes.data.rows?.length) setRows(assessmentRes.data.rows);
          if (assessmentRes.data.data?.rows?.length) setRows(assessmentRes.data.data.rows);
          if (assessmentRes.data.rating) setRating(assessmentRes.data.rating);
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
        const updated = { ...row, [field]: value };
        if (field === 'tool') updated.worksheet = '';
        return updated;
      })
    );
  };

  const addRow = () => setRows((prev) => [...prev, createRow()]);

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const getWorksheetsForTool = (toolLabel) => {
    const found = TOOL_WORKSHEET_MAP.find((t) => t.tool === toolLabel);
    return found ? found.worksheets : [];
  };

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 12,
        data: { rows },
        rating: rating,
        isCompleted: isNext,
      });
      if (isNext) {
        toast.success('Assessment submitted successfully!');
        navigate('/sites');
      } else {
        toast.success('Assessment saved successfully');
      }
    } catch {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <motion.div className="tool-page tool-12-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="tool-header">
          <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
            <ArrowLeft size={18} /> Back to Site
          </button>
          <div className="tool-title-group">
            <h1>Tool 12: Review of management effectiveness assessment findings</h1>
            <p className="site-name-display">{site?.name}</p>
          </div>
        </div>

        <div className="excel-worksheet tool-12-worksheet" style={{ borderColor: 'white' }}>
          <div className="table-responsive">
            <table className="worksheet-table structured-tool-table tool-12-table">
              <colgroup>
                <col className="tool-12-col-tool" />
                <col className="tool-12-col-worksheet" />
                <col className="tool-12-col-followup" />
                <col className="tool-12-actions-col" />
              </colgroup>
              <thead>
                <tr className="worksheet-title-row">
                  <th colSpan="4">
                    <div className="worksheet-title-content">
                      <ClipboardList size={18} />
                      <span>Worksheet 12. Review of management effectiveness assessment findings</span>
                    </div>
                  </th>
                </tr>
                <tr className="sub-header-row">
                  <th>Tool</th>
                  <th>Worksheet</th>
                  <th>Follow-up actions</th>
                  <th className="tool-3-actions-header" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="tool-12-data-row">
                    <td>
                      <PickerDropdown
                        id={`tool-picker-${rowIndex}`}
                        value={row.tool}
                        placeholder="Select tool"
                        options={TOOL_LABELS}
                        onSelect={(val) => handleRowChange(rowIndex, 'tool', val)}
                      />
                    </td>
                    <td>
                      <PickerDropdown
                        id={`worksheet-picker-${rowIndex}`}
                        value={row.worksheet}
                        placeholder={row.tool ? 'Select worksheet' : 'Select tool first'}
                        options={getWorksheetsForTool(row.tool)}
                        onSelect={(val) => handleRowChange(rowIndex, 'worksheet', val)}
                        disabled={!row.tool}
                      />
                    </td>
                    <td>
                      <textarea
                        className="table-textarea"
                        value={row.followUpActions || ''}
                        onChange={(e) => handleRowChange(rowIndex, 'followUpActions', e.target.value)}
                        placeholder="Enter follow-up actions..."
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
                  <td colSpan="4">
                    <button className="add-row-btn" onClick={addRow}>
                      <Plus size={14} /> Add Row
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <RatingSection 
          title="RATING: REVIEW OF OUTCOMES AND FOLLOW-UP ACTIONS" 
          rating={rating} 
          onRatingChange={setRating} 
        />

        <div className="tool-footer">
          <button className="btn-save" onClick={() => onSave(false)} disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
          <button className="btn-save-next" onClick={() => onSave(true)} disabled={saving}>
            {saving ? 'Saving...' : 'Submit Assessment'}
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
  );
}
