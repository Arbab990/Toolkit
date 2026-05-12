import { Plus } from 'lucide-react';
import SiteCard from '../components/SiteCard';
import SitesTable from '../components/SitesTable';

const featuredSites = [
  {
    name: 'Green Valley',
    category: 'National Park',
    country: 'India',
    image: '/images/green-valley.png',
    lastAssessment: '12 Mar 2024',
    progress: 76,
  },
  {
    name: 'River Heritage',
    category: 'Cultural Landscape',
    country: 'Nepal',
    image: '/images/river-heritage.png',
    lastAssessment: '05 Jan 2024',
    progress: 60,
  },
  {
    name: 'Ancient Fort',
    category: 'Historic Monument',
    country: 'India',
    image: '/images/ancient-fort.png',
    lastAssessment: 'Not assessed',
    progress: 0,
  },
];

const allSites = [
  {
    name: 'Coastal Mangrove',
    category: 'Natural',
    country: 'Sri Lanka',
    lastAssessment: '20 Feb 2024',
    status: 'In Progress',
  },
  {
    name: 'Green Valley',
    category: 'National Park',
    country: 'India',
    lastAssessment: '12 Mar 2024',
    status: 'In Progress',
  },
  {
    name: 'River Heritage',
    category: 'Cultural Landscape',
    country: 'Nepal',
    lastAssessment: '05 Jan 2024',
    status: 'In Progress',
  },
  {
    name: 'Ancient Fort',
    category: 'Historic Monument',
    country: 'India',
    lastAssessment: '--',
    status: 'Not Assessed',
  },
  {
    name: 'Mountain Temple',
    category: 'Religious Site',
    country: 'Bhutan',
    lastAssessment: '18 Nov 2023',
    status: 'Completed',
  },
];

export default function SitesPage() {
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
        <button className="btn-new-site" id="btn-new-site">
          <Plus />
          New Site
        </button>
      </div>

      {/* Featured Site Cards */}
      <div className="sites-grid">
        {featuredSites.map((site) => (
          <SiteCard key={site.name} site={site} />
        ))}
      </div>

      {/* All Sites Table */}
      <SitesTable sites={allSites} />
    </div>
  );
}
