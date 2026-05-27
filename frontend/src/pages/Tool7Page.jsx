import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  Users,
  UserCheck,
  Activity,
  Clock,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Coins,
  Wallet,
  CalendarDays,
  Landmark,
  ChevronDown,
  Check,
  Pencil
} from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';

const columns = [
  { key: 'staffCategory', label: 'Staff category', icon: Users },
  { key: 'requiredStaff', label: 'Required number of staff', icon: UserCheck },
  { key: 'currentStaff', label: 'Current number of staff', icon: Activity },
  { key: 'percentageTime', label: 'Percentage of time dedicated to management of the property', icon: Clock },
  { key: 'mainCompetences', label: 'Main competences required', icon: ClipboardList },
  { key: 'levelOfCompetences', label: 'Level of competences*', icon: GraduationCap },
  { key: 'comments', label: 'Comments/Explanation', icon: MessageSquare },
];

const competenceOptions = [
  { value: 'Very Good', label: 'Very Good' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' }
];

const createRow = () => columns.reduce((row, column) => ({ ...row, [column.key]: '' }), {});
const createRows = () => Array.from({ length: 1 }, createRow);

const worksheet7bColumns = [
  { key: 'managementNeeds', label: 'Management needs/Expenditure categories', icon: ClipboardList },
  { key: 'budgetRequired', label: 'Budget required', icon: Coins },
  { key: 'actualBudget', label: 'Actual budget available', icon: Wallet },
  { key: 'periodCovered', label: 'Period covered by actual budget', icon: CalendarDays },
  { key: 'fundingSources', label: 'Funding source(s)', icon: Landmark },
  { key: 'comments', label: 'Comments/Explanation', icon: MessageSquare },
];

const createWorksheet7bRow = () => worksheet7bColumns.reduce((row, column) => ({ ...row, [column.key]: column.key === 'fundingSources' ? [] : '' }), {});
const createWorksheet7bRows = () => Array.from({ length: 1 }, createWorksheet7bRow);

const worksheet7cSections = [
  {
    title: 'Material resources (infrastructure, facilities and equipment)',
    questions: [
      '1. Are infrastructure and facilities (e.g. roads/access, fences, offices, personnel accommodation) adequate for the needs of the property?',
      '2. Are visitor and interpretation facilities (e.g. visitor centres, audio guides, etc.) adequate for the type of property and sufficient to communicate its values?',
      '3. Is the necessary equipment available to staff to adequately carry out their duties (e.g. vehicles, computers, software, phones, desks, drones, sensors, etc.)?',
      '4. Is equipment regularly maintained to avoid unnecessary and costly replacements?'
    ]
  },
  {
    title: 'Information systems',
    questions: [
      '5. Are there adequate information systems to support knowledge storage, planning and decision- making (e.g. GIS, databases, etc.)?',
      '6. Are there adequate information systems (e.g. archives, inventories, GIS, databases, etc.) and equipment (e.g. drones, sensors, etc.) to monitor the state of conservation of the property?',
      '7. Is there sufficient expertise and technological capacity to effectively use existing information systems and maintain associated equipment?',
      '8. Is information and data adequately stored, secure and easily accessible? What measures are in place for culturally (and politically) sensitive data?'
    ]
  }
];

const createWorksheet7cRows = () =>
  worksheet7cSections.flatMap((section) =>
    section.questions.map((question) => ({
      section: section.title,
      question,
      response: '',
      recommendations: '',
      saved: false,
    }))
  );

const normalizeWorksheet7cRows = (rows = createWorksheet7cRows()) =>
  createWorksheet7cRows().map((baseRow, index) => {
    const savedRow = rows[index] || {};
    return {
      ...baseRow,
      ...savedRow,
      saved: Boolean(savedRow.saved || savedRow.response || savedRow.recommendations),
    };
  });

const FundingSourcesInput = ({ sources = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.includes('; ')) {
      const parts = val.split('; ');
      const newSources = parts.slice(0, -1).map(p => p.trim()).filter(p => p);
      if (newSources.length > 0) {
        onChange([...(Array.isArray(sources) ? sources : []), ...newSources]);
      }
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(val);
    }
  };

  const removeSource = (indexToRemove) => {
    onChange(sources.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div 
      className="table-textarea" 
      style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'flex-start', cursor: 'text', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }} 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.currentTarget.querySelector('input')?.focus();
        }
      }}
    >
      {Array.isArray(sources) && sources.map((source, idx) => (
        <span key={idx} style={{ backgroundColor: '#e5e7eb', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0' }}>
          {source}
          <button type="button" onClick={() => removeSource(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1, color: '#6b7280' }}>&times;</button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        style={{ flex: 1, minWidth: '80px', border: 'none', outline: 'none', backgroundColor: 'transparent', boxShadow: 'none', appearance: 'none', fontSize: '12px', padding: '2px', margin: 0, color: 'inherit' }}
      />
    </div>
  );
};

export default function Tool7Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);

  const [worksheet7cEditingIndex, setWorksheet7cEditingIndex] = useState(null);
  const [worksheet7cOpenPicker, setWorksheet7cOpenPicker] = useState(null);
  const [worksheet7cDraft, setWorksheet7cDraft] = useState({
    section: '',
    questionIndex: '',
    response: '',
    recommendations: '',
  });

  const [formData, setFormData] = useState({
    rows: createRows(),
    analysis: '',
    gaps: '',
    recommendations: '',
    worksheet7b: {
      rows: createWorksheet7bRows(),
      analysis: '',
      gaps: '',
      recommendations: '',
    },
    worksheet7c: {
      rows: createWorksheet7cRows(),
      analysis: '',
      gaps: '',
      recommendations: '',
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, assessmentRes] = await Promise.all([
          getSite(siteId),
          getAssessment(siteId, 7),
        ]);

        setSite(siteRes.data);
        if (assessmentRes.data) {
          setFormData({
            rows: assessmentRes.data.rows?.length ? assessmentRes.data.rows : createRows(),
            analysis: assessmentRes.data.analysis || '',
            gaps: assessmentRes.data.gaps || '',
            recommendations: assessmentRes.data.recommendations || '',
            worksheet7b: {
              rows: assessmentRes.data.worksheet7b?.rows?.length ? assessmentRes.data.worksheet7b.rows : createWorksheet7bRows(),
              analysis: assessmentRes.data.worksheet7b?.analysis || '',
              gaps: assessmentRes.data.worksheet7b?.gaps || '',
              recommendations: assessmentRes.data.worksheet7b?.recommendations || '',
            },
            worksheet7c: {
              rows: normalizeWorksheet7cRows(assessmentRes.data.worksheet7c?.rows),
              analysis: assessmentRes.data.worksheet7c?.analysis || '',
              gaps: assessmentRes.data.worksheet7c?.gaps || '',
              recommendations: assessmentRes.data.worksheet7c?.recommendations || '',
            }
          });
        }
      } catch (err) {
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

  const handleTextareaChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRow = () => {
    setFormData((prev) => ({ ...prev, rows: [...prev.rows, createRow()] }));
  };

  const removeRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.length > 1 ? prev.rows.filter((_, i) => i !== index) : prev.rows,
    }));
  };

  const handleWorksheet7bRowChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet7b: {
        ...prev.worksheet7b,
        rows: prev.worksheet7b.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      },
    }));
  };

  const handleWorksheet7bTextareaChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet7b: { ...prev.worksheet7b, [field]: value },
    }));
  };

  const addWorksheet7bRow = () => {
    setFormData((prev) => ({
      ...prev,
      worksheet7b: { ...prev.worksheet7b, rows: [...prev.worksheet7b.rows, createWorksheet7bRow()] },
    }));
  };

  const removeWorksheet7bRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      worksheet7b: {
        ...prev.worksheet7b,
        rows: prev.worksheet7b.rows.length > 1 ? prev.worksheet7b.rows.filter((_, i) => i !== index) : prev.worksheet7b.rows,
      },
    }));
  };

  const handleWorksheet7cRowChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet7c: {
        ...prev.worksheet7c,
        rows: prev.worksheet7c.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      },
    }));
  };

  const handleWorksheet7cTextareaChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet7c: { ...prev.worksheet7c, [field]: value },
    }));
  };

  const selectWorksheet7cDraftQuestion = (sectionTitle, index) => {
    setWorksheet7cDraft((prev) => ({ ...prev, section: sectionTitle, questionIndex: String(index) }));
    setWorksheet7cOpenPicker(null);
  };

  const saveWorksheet7cRow = async (index, values) => {
    const nextData = {
      ...formData,
      worksheet7c: {
        ...formData.worksheet7c,
        rows: formData.worksheet7c.rows.map((row, i) =>
          i === index ? { ...row, ...values, saved: true } : row
        ),
      },
    };

    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 7,
        data: nextData,
        rating: null,
        isCompleted: false,
      });
      setFormData(nextData);
      setWorksheet7cEditingIndex(null);
      setWorksheet7cDraft({ section: '', questionIndex: '', response: '', recommendations: '' });
      toast.success('Row saved successfully');
    } catch (err) {
      toast.error('Failed to save row');
    } finally {
      setSaving(false);
    }
  };

  const getCapsuleClass = (value) => {
    if (!value) return '';
    const v = value.toLowerCase();
    if (v === 'very good' || v === 'good') return 'as-capsule val-positive';
    if (v === 'fair') return 'as-capsule val-potential';
    if (v === 'poor') return 'as-capsule val-negative';
    return '';
  };

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 7,
        data: formData,
        rating: null,
        isCompleted: isNext,
      });
      toast.success('Assessment saved successfully');
      if (isNext) navigate(`/sites/${siteId}/tool/8`);
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const renderWorksheet7cSection = (section) => {
    const sectionRows = formData.worksheet7c.rows
      .map((row, index) => ({ ...row, index }))
      .filter((row) => row.section === section.title);
    
    const savedRows = sectionRows.filter((row) => row.saved);
    const availableRows = sectionRows.filter((row) => !row.saved);
    
    return (
      <Fragment key={section.title}>
        <tr className="tool-3-section-row">
          <td colSpan="4">{section.title}</td>
        </tr>
        {savedRows.map((row) => (
          <tr key={row.question} className="tool-3-question-row">
            <td className="tool-3-question">
              {row.question}
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={row.response || ''}
                disabled={worksheet7cEditingIndex !== row.index}
                onChange={(e) => handleWorksheet7cRowChange(row.index, 'response', e.target.value)}
              />
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={row.recommendations || ''}
                disabled={worksheet7cEditingIndex !== row.index}
                onChange={(e) => handleWorksheet7cRowChange(row.index, 'recommendations', e.target.value)}
              />
            </td>
            <td className="tool-3-actions-cell">
              {worksheet7cEditingIndex === row.index ? (
                <button
                  className="row-action-btn save"
                  onClick={() => saveWorksheet7cRow(row.index, formData.worksheet7c.rows[row.index])}
                  disabled={saving}
                  title="Save row"
                >
                  <Check size={18} />
                </button>
              ) : (
                <button
                  className="row-action-btn edit"
                  onClick={() => setWorksheet7cEditingIndex(row.index)}
                  title="Edit row"
                >
                  <Pencil size={18} />
                </button>
              )}
            </td>
          </tr>
        ))}

        {availableRows.length > 0 && (
          <tr className="tool-3-question-row">
            <td className="tool-3-question">
              <div className="tool-3-question-picker">
                <button
                  type="button"
                  className="tool-3-question-picker__button"
                  onClick={() => setWorksheet7cOpenPicker(worksheet7cOpenPicker === section.title ? null : section.title)}
                >
                  <span>
                    {worksheet7cDraft.section === section.title && availableRows.find(r => String(r.index) === String(worksheet7cDraft.questionIndex))
                      ? availableRows.find(r => String(r.index) === String(worksheet7cDraft.questionIndex)).question
                      : 'Select question'}
                  </span>
                  <ChevronDown size={16} />
                </button>
                {worksheet7cOpenPicker === section.title && (
                  <div className="tool-3-question-picker__menu">
                    {availableRows.map((row) => (
                      <button
                        key={row.index}
                        type="button"
                        className="tool-3-question-picker__option"
                        onClick={() => selectWorksheet7cDraftQuestion(section.title, row.index)}
                      >
                        <span>{row.question}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={worksheet7cDraft.section === section.title ? worksheet7cDraft.response : ''}
                onChange={(e) =>
                  setWorksheet7cDraft((prev) => ({ ...prev, section: section.title, response: e.target.value }))
                }
              />
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={worksheet7cDraft.section === section.title ? worksheet7cDraft.recommendations : ''}
                onChange={(e) =>
                  setWorksheet7cDraft((prev) => ({
                    ...prev,
                    section: section.title,
                    recommendations: e.target.value,
                  }))
                }
              />
            </td>
            <td className="tool-3-actions-cell">
              <button
                className="row-action-btn save"
                onClick={() =>
                  saveWorksheet7cRow(Number(worksheet7cDraft.questionIndex), {
                    response: worksheet7cDraft.response,
                    recommendations: worksheet7cDraft.recommendations,
                  })
                }
                disabled={saving || worksheet7cDraft.section !== section.title || worksheet7cDraft.questionIndex === ''}
                title="Save row"
              >
                <Check size={18} />
              </button>
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <motion.div className="tool-page tool-7-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tool-header">
        <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
          <ArrowLeft size={18} />
          Back to Site
        </button>
        <div className="tool-title-group">
          <h1>Worksheet 7a. Assessment of human capacity</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet" style={{ borderColor: 'white' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-7-table">
            <colgroup>
              {columns.map((column) => (
                <col key={column.key} className={`tool-7-col-${column.key}`} />
              ))}
              <col className="tool-7-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="8">
                  <div className="worksheet-title-content">
                    <Users size={18} />
                    <span>Worksheet 7a. Assessment of human capacity</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                {columns.map((column) => (
                  <th key={column.key}>
                    <div className="th-content">
                      <column.icon size={18} />
                      <span>{column.label}</span>
                    </div>
                  </th>
                ))}
                <th className="action-col"></th>
              </tr>
            </thead>
            <tbody>
              {formData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="tool-7-data-row">
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.key === 'levelOfCompetences' ? (
                        <div className="table-select-container">
                          <select
                            className={`table-select approval-select ${getCapsuleClass(row[column.key])}`}
                            value={row[column.key] || ''}
                            onChange={(e) => handleRowChange(rowIndex, column.key, e.target.value)}
                          >
                            <option value="" disabled hidden>Select</option>
                            {row[column.key] && (
                              <option value={row[column.key]} style={{ display: 'none' }}>
                                {row[column.key]}
                              </option>
                            )}
                            {competenceOptions.map(o => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <textarea
                          className="table-textarea"
                          value={row[column.key] || ''}
                          onChange={(e) => handleRowChange(rowIndex, column.key, e.target.value)}
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
                <td colSpan="8">
                  <button className="add-row-btn" onClick={addRow}>
                    <Plus size={14} /> Add Row
                  </button>
                </td>
              </tr>
              <tr className="tool-7-notes-row">
                <td colSpan="8">
                  <p style={{fontSize: '11px', color: '#4b5563', padding: '4px 8px'}}>
                    Very good: more than 75% of staff have at least basic- to medium-level competences to carry out activities required<br/>
                    Good: 50 to 75% of staff have at least basic- to medium-level competences to carry out activities required<br/>
                    Fair: between 25% and 50% of staff have at least basic- to medium-level competences to carry out activities required<br/>
                    Poor: less than 25% of staff have at least basic- to medium-level competences to carry out activities required
                  </p>
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
      </div>

      <div className="excel-worksheet tool-7b-worksheet" style={{ borderColor: 'white', marginTop: '32px' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-7b-table">
            <colgroup>
              {worksheet7bColumns.map((column) => (
                <col key={column.key} className={`tool-7b-col-${column.key}`} />
              ))}
              <col className="tool-7b-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="7">
                  <div className="worksheet-title-content">
                    <Coins size={18} />
                    <span>Worksheet 7b. Assessment of financial resources</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                {worksheet7bColumns.map((column) => (
                  <th key={column.key}>
                    <div className="th-content">
                      <column.icon size={18} />
                      <span>{column.label}</span>
                    </div>
                  </th>
                ))}
                <th className="action-col"></th>
              </tr>
            </thead>
            <tbody>
              {formData.worksheet7b.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="tool-7b-data-row">
                  {worksheet7bColumns.map((column) => (
                    <td key={column.key}>
                      {column.key === 'fundingSources' ? (
                        <FundingSourcesInput
                          sources={row[column.key] || []}
                          onChange={(newSources) => handleWorksheet7bRowChange(rowIndex, column.key, newSources)}
                        />
                      ) : (
                        <textarea
                          className="table-textarea"
                          value={row[column.key] || ''}
                          onChange={(e) => handleWorksheet7bRowChange(rowIndex, column.key, e.target.value)}
                        />
                      )}
                    </td>
                  ))}
                  <td className="delete-row-cell">
                    <button className="row-action-btn delete" onClick={() => removeWorksheet7bRow(rowIndex)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="add-row-container">
                <td colSpan="7">
                  <button className="add-row-btn" onClick={addWorksheet7bRow}>
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
              value={formData.worksheet7b.analysis}
              onChange={(e) => handleWorksheet7bTextareaChange('analysis', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea
              value={formData.worksheet7b.gaps}
              onChange={(e) => handleWorksheet7bTextareaChange('gaps', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea
              value={formData.worksheet7b.recommendations}
              onChange={(e) => handleWorksheet7bTextareaChange('recommendations', e.target.value)}
              placeholder="Enter opportunities and recommendations here..."
            />
          </div>
        </div>
      </div>

      <div className="excel-worksheet tool-7c-worksheet" style={{ borderColor: 'white', marginTop: '32px' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-3-table">
            <colgroup>
              <col />
              <col />
              <col />
              <col className="tool-3-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="4">
                  <div className="worksheet-title-content">
                    <ClipboardList size={18} />
                    <span>Worksheet 7c. Assessment of other resources</span>
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                <th>Question</th>
                <th>Answer</th>
                <th>Opportunities and recommendations</th>
                <th className="tool-3-actions-header"></th>
              </tr>
            </thead>
            <tbody>
              {worksheet7cSections.map(renderWorksheet7cSection)}
            </tbody>
          </table>
        </div>

        <div className="worksheet-bottom-sections">
          <div className="bottom-section">
            <div className="section-label">Analysis and conclusions</div>
            <textarea
              value={formData.worksheet7c.analysis}
              onChange={(e) => handleWorksheet7cTextareaChange('analysis', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea
              value={formData.worksheet7c.gaps}
              onChange={(e) => handleWorksheet7cTextareaChange('gaps', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea
              value={formData.worksheet7c.recommendations}
              onChange={(e) => handleWorksheet7cTextareaChange('recommendations', e.target.value)}
              placeholder="Enter opportunities and recommendations here..."
            />
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
