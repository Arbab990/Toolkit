import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  Target,
  BarChart2,
  Activity,
  ClipboardList,
  ChevronDown,
  Star,
  AlertTriangle,
  Map,
  Users,
  FileText,
  Package,
  Shield,
  Search
} from 'lucide-react';
import { getSite } from '../services/siteService';
import Spinner from '../components/ui/Spinner';

const tools = [
  {
    id: 1,
    title: 'Tool 1: Values, attributes and management objectives',
    description: 'Understand the core values and objectives.',
    icon: Star
  },
  {
    id: 2,
    title: 'Tool 2: Factors affecting the property',
    description: 'Identify threats and external factors.',
    icon: AlertTriangle
  },
  {
    id: 3,
    title: 'Tool 3: Boundaries, buffer zones and the wider setting',
    description: 'Review spatial and geographic boundaries.',
    icon: Map
  },
  {
    id: 4,
    title: 'Tool 4: Governance arrangements',
    description: 'Evaluate decision-making and authorities.',
    icon: Users
  },
  {
    id: 5,
    title: 'Tool 5: Legal, regulatory and customary framework',
    description: 'Review laws and customary frameworks.',
    icon: FileText
  },
  {
    id: 6,
    title: 'Tool 6: Management planning framework',
    description: 'Assess the planning processes.',
    icon: ClipboardList
  },
  {
    id: 7,
    title: 'Tool 7: Needs and inputs',
    description: 'Evaluate resources and requirements.',
    icon: Package
  },
  {
    id: 8,
    title: 'Tool 8: Management processes',
    description: 'Review operational workflows.',
    icon: Settings
  },
  {
    id: 9,
    title: 'Tool 9: Implementation of management measures',
    description: 'Monitor ongoing management actions.',
    icon: Activity
  },
  {
    id: 10,
    title: 'Tool 10: Outputs – Monitoring productivity',
    description: 'Evaluate productivity and immediate results.',
    icon: BarChart2
  },
  {
    id: 11,
    title: 'Tool 11: Outcomes – Monitoring the state of conservation',
    description: 'Assess the overall conservation state.',
    icon: Shield
  },
  {
    id: 12,
    title: 'Tool 12: Review of management effectiveness assessment findings',
    description: 'Review and finalize findings.',
    icon: Search
  }
];

export default function SiteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Assessment');
  const [showAllTools, setShowAllTools] = useState(false);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await getSite(id);
        setSite(res.data);
      } catch (err) {
        console.error('Failed to fetch site:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={40} color="var(--color-primary-600)" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="empty-state">
        <p>Site not found.</p>
        <button className="btn-cancel" onClick={() => navigate('/dashboard')}>Go Back</button>
      </div>
    );
  }

  const tabs = ['Site Details', 'Assessment'];

  return (
    <div className="site-details-page">
      {/* Header */}
      <div className="site-details-header">
        <div className="site-details-header__left">
          <button className="back-btn-icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="site-details-title">{site.name}</h1>
        </div>
        <motion.button 
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/sites/${id}/tool/1`)}
        >
          Start Assessment
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="site-details-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'Assessment' && (
          <div className="assessment-tab">
            <div className="assessment-tab__header">
              <h2>Assessment Tools (EOH 2.0)</h2>
              <p>Select a tool/worksheet to begin the assessment</p>
            </div>

            <div className="tools-list">
              {(showAllTools ? tools : tools.slice(0, 5)).map((tool) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.id} className="tool-card">
                    <div className="tool-card__icon-wrapper">
                      <Icon size={24} className="tool-card__icon" />
                    </div>
                    <div className="tool-card__content">
                      <h3 className="tool-card__title">{tool.title}</h3>
                      <p className="tool-card__description">{tool.description}</p>
                    </div>
                    <motion.button 
                      className="btn-outline-green"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/sites/${id}/tool/${tool.id}`)}
                    >
                      Start
                    </motion.button>
                  </div>
                );
              })}
            </div>

            <button 
              className="view-all-tools-btn"
              onClick={() => setShowAllTools(!showAllTools)}
            >
              {showAllTools ? 'View less' : 'View all 12 Tools'} 
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: showAllTools ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </button>
          </div>
        )}

        {activeTab === 'Site Details' && (
          <div className="details-tab">
            <div className="form-section">
               <h2 className="form-section-title">Site Information</h2>
               <div className="details-grid">
                  <div className="details-item">
                    <span className="details-label">Category</span>
                    <span className="details-value">{site.category}</span>
                  </div>
                  <div className="details-item">
                    <span className="details-label">Country</span>
                    <span className="details-value">{site.country}</span>
                  </div>
                  <div className="details-item">
                    <span className="details-label">Location</span>
                    <span className="details-value">{site.location}</span>
                  </div>
                  <div className="details-item">
                    <span className="details-label">Site URL</span>
                    <span className="details-value">
                      {site.siteUrl ? (
                        <a href={site.siteUrl} target="_blank" rel="noopener noreferrer">{site.siteUrl}</a>
                      ) : 'N/A'}
                    </span>
                  </div>
               </div>
               
               <div className="details-description">
                 <h3>Description</h3>
                 <p>{site.description || 'No description provided.'}</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
