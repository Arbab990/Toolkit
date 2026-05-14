import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import SiteCard from '../components/SiteCard';
import SitesTable from '../components/SitesTable';
import { getSites, deleteSite } from '../services/siteService';
import Spinner from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await getSites();
        setSites(res.data);
      } catch (err) {
        console.error('Failed to fetch sites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteSite(id);
      setSites(prev => prev.filter(site => site._id !== id));
      toast.success('Site and its records removed successfully');
    } catch (err) {
      toast.error('Failed to remove site');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={40} color="var(--color-primary-600)" />
      </div>
    );
  }

  // Show all sites as cards
  const featuredSites = sites;

  return (
    <div id="sites-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Heritage Sites</h1>
          <p className="page-header__subtitle">
            Create a new site or select an existing site to start assessment.
          </p>
        </div>
        <button 
          className="btn-new-site" 
          id="btn-new-site"
          onClick={() => navigate('/sites/new')}
        >
          <Plus />
          New Site
        </button>
      </div>

      {/* Featured Site Cards */}
      {featuredSites.length > 0 ? (
        <div className="sites-grid">
          {featuredSites.map((site) => (
            <SiteCard key={site._id} site={site} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No heritage sites found. Click "New Site" to add one.</p>
        </div>
      )}

      {/* All Sites Table */}
      {sites.length > 0 && <SitesTable sites={sites} onDelete={handleDelete} />}
    </div>
  );
}
