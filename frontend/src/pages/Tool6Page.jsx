import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  FileText,
  Map,
  BadgeCheck,
  CalendarCheck,
  PlayCircle,
  CalendarClock,
  ClipboardList,
  MessageSquare,
  Check,
  Pencil,
  ChevronDown,
} from 'lucide-react';
import { getAssessment, saveAssessment } from '../services/assessmentService';
import { getSite } from '../services/siteService';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import Select from 'react-select';

const columns = [
  { key: 'name', label: 'Name of plan', icon: FileText },
  { key: 'scope', label: 'Territorial scope of plan', icon: Map },
  { key: 'approval', label: 'Level of approval*', icon: BadgeCheck },
  { key: 'finalizingYear', label: 'Year of finalizing instrument or last review', icon: CalendarCheck },
  { key: 'startYear', label: 'Year of starting implementation', icon: PlayCircle },
  { key: 'completionYear', label: 'Year specified for completing implementation or next review', icon: CalendarClock },
  { key: 'description', label: 'Brief description of plan', icon: ClipboardList },
  { key: 'comments', label: 'Main issues/comments', icon: MessageSquare },
];

const approvalOptions = [
  { value: 'L', label: 'plan has force of law' },
  { value: 'G', label: 'plan has been approved by government but is not a legal instrument' },
  { value: 'O', label: 'plan has been approved but is not recognized as an official instrument by government' },
  { value: 'SA', label: 'plan has been finalized but has not been formally approved or is not being implemented' },
  { value: 'D', label: 'plan is a draft' },
  { value: 'E', label: 'plan has officially expired but it is still used' }
];

const yearOptions = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => {
  const y = 2026 - i;
  return { value: String(y), label: String(y) };
});

const yearSelectStyles = {
  container: (base) => ({
    ...base,
    width: '100%',
  }),
  control: (base, state) => ({
    ...base,
    backgroundColor: 'white',
    borderColor: state.isFocused ? '#2d6a4f' : 'var(--color-neutral-200)',
    borderRadius: '6px',
    fontSize: '12px',
    minHeight: '34px',
    height: '34px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(45, 106, 79, 0.15)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#2d6a4f' : 'var(--color-neutral-300)',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    padding: '0px',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '32px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '2px 6px',
    color: '#6b7280',
    '&:hover': {
      color: '#374151',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '2px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected 
      ? '#2d6a4f' 
      : isFocused 
        ? '#edf7ef' 
        : 'transparent',
    color: isSelected ? '#ffffff' : 'var(--color-neutral-900)',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '8px 12px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '6px',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 9999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--color-neutral-900)',
  }),
};

const createRow = () => columns.reduce((row, column) => ({ ...row, [column.key]: '' }), {});
const createRows = () => Array.from({ length: 1 }, createRow);

const worksheet6bSections = [
  {
    title: 'Legislative, statutory and other requirements',
    questions: [
      '1. Is the plan a legal or statutory requirement?',
      '2. Is the time-frame/lifespan of the plan mandated by legislation or another statutory instrument? If not, how is the time-frame determined? Is the time-frame adequate?',
      '3. Are the actors responsible for developing and implementing the plan clearly identified in legislation or other statutory instruments? If not, is it clear who is responsible for developing the plan and how? What implications does this have for the preparation, content and implementation of the plan?',
      '4. Does the plan enshrine participatory processes in public consultation, including public exhibition of the draft plan, a legal requirement?',
      '5. Is the approval process clear, including about who needs to be involved? Is that process relatively straightforward, or is it complex and time-consuming, potentially delaying the implementation of the plan?',
    ]
  },
  {
    title: 'Planning context and integration with other planning instruments',
    questions: [
      '6. Are there specific funding resources available for the development of the plan, or is preparing the plan dependent on extraordinary funding (e.g. through donors, grants)?',
      '7. Is the purpose and scope of the plan clearly defined in relation to the overall planning framework? Does the plan adequately acknowledge and accommodate the requirements of World Heritage (e.g. maintain OUV)?',
      '8. Is the plan harmonized and integrated with other planning instruments that influence the management of the World Heritage property or heritage place?',
      '9. Was the plan developed through a process of co-creation (i.e., did it involve all managers responsible for its implementation)?',
      '10. Were rights-holders and key stakeholders involved in developing the plan? Were their contributions incorporated into the plan?',
    ]
  },
  {
    title: 'Presentation and content of the plan',
    questions: [
      '11. Is the plan available in local language(s)? Is it easily accessible to rights-holders, stakeholders and the general public?',
      '12. Is the plan well-presented and written in plain and clear language? Is the plan easily understood by those required to implement it, (i.e. skilled workers, technical specialists and senior-level administrators alike)?',
      '13. Is the plan respectful of and consistent with customs and traditions of rights-holders that support the protection and conservation of the property and its buffer zone(s)?',
      '14. Is the plan based on an adequate and relevant information base, including traditional knowledge, if appropriate?',
      '15. Does the content of the plan provide clear direction for the overall management of the property? Is the plan\'s context clear when it is to be implemented by multiple managers?',
      '16. Are the values and management objectives of the property or heritage place clearly identified in the plan? Are they linked to desired outcomes and specified time-frames?',
      '17. Does the plan establish desired outcomes for the management of the property, or does it only specify actions?',
      '18. Does the plan establish desired outcomes related to sustainable development and benefits for rights-holders and local communities? Do any of these desired outcomes conflict with or undermine the protection of the values of the property?',
      '19. Does the plan include information about the factors affecting the property? Do the desired outcomes and identified management actions clearly relate to these factors?',
      '20. Do the desired outcomes and management actions specified in the plan provide an adequate response to the most important and urgent factors affecting the property?',
    ]
  },
  {
    title: 'Resources, commitment and implementation capacity',
    questions: [
      '21. Is there political and institutional will to implement the plan? Is this the case if the plan is not a legal instrument? Is this the case if the plan is to be implemented by different managers?',
      '22. Does the plan include a well-defined programme of actions? Does each action have a stated time-frame and priority, allocated funding and clear identification of responsibility for its implementation?',
      '23. Is that programme of actions realistic in terms of time-frame and human and financial capacity? Can the programme of actions be easily translated into annual (or multi-year) workplans?',
    ]
  },
  {
    title: 'Monitoring and review',
    questions: [
      '24. Does the plan provide for a process of monitoring and review during the life of the plan?',
      '25. Does the plan include indicators or other means of assessing how desired outcomes are being achieved, or is it based only on a list of actions implemented and outputs produced?',
      '26. Does the plan require an evaluation to be undertaken before revising or drafting a new plan? Is this a legal requirement? If a final evaluation is required, have the necessary time and resources been factored into the current plan?',
      '27. Does the management cycle allow sufficient time to develop and approve a new plan before the time-frame of the previous plan ends?',
    ]
  }
];

const createWorksheet6bRows = () =>
  worksheet6bSections.flatMap((section) =>
    section.questions.map((question) => ({
      section: section.title,
      question,
      response: '',
      recommendations: '',
      saved: false,
    }))
  );

const normalizeWorksheet6bRows = (rows = createWorksheet6bRows()) =>
  createWorksheet6bRows().map((baseRow, index) => {
    const savedRow = rows[index] || {};
    return {
      ...baseRow,
      ...savedRow,
      saved: Boolean(savedRow.saved || savedRow.response || savedRow.recommendations),
    };
  });

export default function Tool6Page() {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState(null);
  const [worksheet6bEditingIndex, setWorksheet6bEditingIndex] = useState(null);
  const [worksheet6bOpenPicker, setWorksheet6bOpenPicker] = useState(null);
  const [worksheet6bDraft, setWorksheet6bDraft] = useState({
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
    worksheet6b: {
      planName: '',
      rows: createWorksheet6bRows(),
      analysis: '',
      gaps: '',
      recommendations: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, assessmentRes] = await Promise.all([
          getSite(siteId),
          getAssessment(siteId, 6),
        ]);

        setSite(siteRes.data);
        if (assessmentRes.data) {
          setFormData({
            rows: assessmentRes.data.rows || createRows(),
            analysis: assessmentRes.data.analysis || '',
            gaps: assessmentRes.data.gaps || '',
            recommendations: assessmentRes.data.recommendations || '',
            worksheet6b: {
              planName: assessmentRes.data.worksheet6b?.planName || '',
              rows: normalizeWorksheet6bRows(assessmentRes.data.worksheet6b?.rows),
              analysis: assessmentRes.data.worksheet6b?.analysis || '',
              gaps: assessmentRes.data.worksheet6b?.gaps || '',
              recommendations: assessmentRes.data.worksheet6b?.recommendations || '',
            },
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

  const handleWorksheet6bRowChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet6b: {
        ...prev.worksheet6b,
        rows: prev.worksheet6b.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      },
    }));
  };

  const handleWorksheet6bTextareaChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      worksheet6b: {
        ...prev.worksheet6b,
        [field]: value,
      },
    }));
  };

  const selectWorksheet6bDraftQuestion = (sectionTitle, index) => {
    setWorksheet6bDraft((prev) => ({ ...prev, section: sectionTitle, questionIndex: String(index) }));
    setWorksheet6bOpenPicker(null);
  };

  const saveWorksheet6bRow = async (index, values) => {
    const nextData = {
      ...formData,
      worksheet6b: {
        ...formData.worksheet6b,
        rows: formData.worksheet6b.rows.map((row, i) =>
          i === index ? { ...row, ...values, saved: true } : row
        ),
      },
    };

    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 6,
        data: nextData,
        rating: null,
        isCompleted: false,
      });
      setFormData(nextData);
      setWorksheet6bEditingIndex(null);
      setWorksheet6bDraft({ section: '', questionIndex: '', response: '', recommendations: '' });
      toast.success('Row saved successfully');
    } catch (err) {
      toast.error('Failed to save row');
    } finally {
      setSaving(false);
    }
  };

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

  const getCapsuleClass = (value) => {
    if (!value) return '';
    const v = value.toLowerCase();
    if (v === 'high') return 'as-capsule val-positive';
    if (v === 'low') return 'as-capsule val-negative';
    if (v === 'medium') return 'as-capsule val-potential';
    if (v === 'l') return 'as-capsule val-approval-l';
    if (v === 'g') return 'as-capsule val-approval-g';
    if (v === 'o') return 'as-capsule val-approval-o';
    if (v === 'sa') return 'as-capsule val-approval-sa';
    if (v === 'd') return 'as-capsule val-approval-d';
    if (v === 'e') return 'as-capsule val-approval-e';
    return '';
  };

  const onSave = async (isNext = false) => {
    setSaving(true);
    try {
      await saveAssessment({
        siteId,
        toolNumber: 6,
        data: formData,
        rating: null,
        isCompleted: isNext,
      });
      toast.success('Assessment saved successfully');
      if (isNext) navigate(`/sites/${siteId}/tool/7`);
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const renderWorksheet6bSection = (section) => {
    const sectionRows = formData.worksheet6b.rows
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
                disabled={worksheet6bEditingIndex !== row.index}
                onChange={(e) => handleWorksheet6bRowChange(row.index, 'response', e.target.value)}
              />
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={row.recommendations || ''}
                disabled={worksheet6bEditingIndex !== row.index}
                onChange={(e) => handleWorksheet6bRowChange(row.index, 'recommendations', e.target.value)}
              />
            </td>
            <td className="tool-3-actions-cell">
              {worksheet6bEditingIndex === row.index ? (
                <button
                  className="row-action-btn save"
                  onClick={() => saveWorksheet6bRow(row.index, formData.worksheet6b.rows[row.index])}
                  disabled={saving}
                  title="Save row"
                >
                  <Check size={18} />
                </button>
              ) : (
                <button
                  className="row-action-btn edit"
                  onClick={() => setWorksheet6bEditingIndex(row.index)}
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
                  onClick={() => setWorksheet6bOpenPicker(worksheet6bOpenPicker === section.title ? null : section.title)}
                >
                  <span>
                    {worksheet6bDraft.section === section.title && availableRows.find(r => String(r.index) === String(worksheet6bDraft.questionIndex))
                      ? availableRows.find(r => String(r.index) === String(worksheet6bDraft.questionIndex)).question
                      : 'Select question'}
                  </span>
                  <ChevronDown size={16} />
                </button>
                {worksheet6bOpenPicker === section.title && (
                  <div className="tool-3-question-picker__menu">
                    {availableRows.map((row) => (
                      <button
                        key={row.index}
                        type="button"
                        className="tool-3-question-picker__option"
                        onClick={() => selectWorksheet6bDraftQuestion(section.title, row.index)}
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
                value={worksheet6bDraft.section === section.title ? worksheet6bDraft.response : ''}
                onChange={(e) =>
                  setWorksheet6bDraft((prev) => ({ ...prev, section: section.title, response: e.target.value }))
                }
              />
            </td>
            <td>
              <textarea
                className="table-textarea"
                value={worksheet6bDraft.section === section.title ? worksheet6bDraft.recommendations : ''}
                onChange={(e) =>
                  setWorksheet6bDraft((prev) => ({
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
                  saveWorksheet6bRow(Number(worksheet6bDraft.questionIndex), {
                    response: worksheet6bDraft.response,
                    recommendations: worksheet6bDraft.recommendations,
                  })
                }
                disabled={saving || worksheet6bDraft.section !== section.title || worksheet6bDraft.questionIndex === ''}
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

  return (
    <motion.div className="tool-page tool-6-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tool-header">
        <button className="back-btn" onClick={() => navigate(`/sites/${siteId}`)}>
          <ArrowLeft size={18} />
          Back to Site
        </button>
        <div className="tool-title-group">
          <h1>Worksheet 6a. Assessment of management planning framework</h1>
          <p className="site-name-display">{site?.name}</p>
        </div>
      </div>

      <div className="excel-worksheet" style={{ borderColor: 'white' }}>
        <div className="table-responsive">
          <table className="worksheet-table structured-tool-table tool-6-table">
            <colgroup>
              {columns.map((column) => (
                <col key={column.key} className={`tool-6-col-${column.key}`} />
              ))}
              <col className="tool-6-actions-col" />
            </colgroup>
            <thead>
              <tr className="worksheet-title-row">
                <th colSpan="9">
                  <div className="worksheet-title-content">
                    <ClipboardList size={18} />
                    <span>Worksheet 6a. Assessment of management planning framework</span>
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
                <tr key={rowIndex} className="tool-6-data-row">
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.key === 'approval' ? (
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
                            {approvalOptions.map(o => (
                              <option key={o.value} value={o.value}>
                                {`${o.value} = ${o.label}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : column.key === 'scope' ? (
                        <div className="table-select-container">
                          <select
                            className={`table-select ${getCapsuleClass(row[column.key])}`}
                            value={row[column.key] || ''}
                            onChange={(e) => handleRowChange(rowIndex, column.key, e.target.value)}
                          >
                            <option value="">Select</option>
                            {['Low', 'Medium', 'High'].map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      ) : ['finalizingYear', 'startYear', 'completionYear'].includes(column.key) ? (
                        <div className="table-select-container">
                          <Select
                            options={yearOptions}
                            styles={yearSelectStyles}
                            value={row[column.key] ? { value: row[column.key], label: row[column.key] } : null}
                            onChange={(val) => handleRowChange(rowIndex, column.key, val ? val.value : '')}
                            placeholder="Select"
                            isClearable
                            isSearchable
                            menuPortalTarget={document.body}
                          />
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
                <td colSpan="9">
                  <button className="add-row-btn" onClick={addRow}>
                    <Plus size={14} /> Add Row
                  </button>
                </td>
              </tr>
              <tr className="tool-6-notes-row">
                <td colSpan="9">
                  <p>* L = plan has force of law</p>
                  <p>G = plan has been approved by government but is not a legal instrument</p>
                  <p>O = plan has been approved but is not recognized as an official instrument by government</p>
                  <p>SA = plan has been finalized but has not been formally approved or is not being implemented</p>
                  <p>D = plan is a draft</p>
                  <p>E = plan has officially expired but it is still used</p>
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

      <div className="excel-worksheet tool-6b-worksheet" style={{ borderColor: 'white', marginTop: '32px' }}>
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
                    <span>Worksheet 6b. Assessment of primary planning instrument</span>
                  </div>
                </th>
              </tr>
              <tr className="tool-6b-plan-name-row">
                <th colSpan="4" style={{ textAlign: 'left', padding: '10px 16px', backgroundColor: '#eaf4e5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontWeight: '600', color: '#2d6a4f', fontSize: '12px', margin: 0 }}>Name of plan/leg. instrument assessed:</label>
                    <input 
                      type="text"
                      className="table-textarea"
                      style={{ padding: '6px 12px', minHeight: '34px', width: '300px' }}
                      value={formData.worksheet6b.planName || ''}
                      onChange={(e) => handleWorksheet6bTextareaChange('planName', e.target.value)}
                    />
                  </div>
                </th>
              </tr>
              <tr className="sub-header-row">
                <th>Question</th>
                <th>Response</th>
                <th>Opportunities and recommendations</th>
                <th className="tool-3-actions-header"></th>
              </tr>
            </thead>
            <tbody>
              {worksheet6bSections.map(renderWorksheet6bSection)}
            </tbody>
          </table>
        </div>

        <div className="worksheet-bottom-sections">
          <div className="bottom-section">
            <div className="section-label">Analysis and conclusions</div>
            <textarea
              value={formData.worksheet6b.analysis}
              onChange={(e) => handleWorksheet6bTextareaChange('analysis', e.target.value)}
              placeholder="Enter analysis and conclusions here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Gaps and challenges</div>
            <textarea
              value={formData.worksheet6b.gaps}
              onChange={(e) => handleWorksheet6bTextareaChange('gaps', e.target.value)}
              placeholder="Enter gaps and challenges here..."
            />
          </div>
          <div className="bottom-section">
            <div className="section-label">Opportunities, recommendations and follow-up actions</div>
            <textarea
              value={formData.worksheet6b.recommendations}
              onChange={(e) => handleWorksheet6bTextareaChange('recommendations', e.target.value)}
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
