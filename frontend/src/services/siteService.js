import api from './authService';

const IS_BYPASS = import.meta.env.VITE_AUTH_BYPASS === 'true';

const initialMockSites = [
  {
    _id: 'mock-1',
    name: 'Dong Phayayen-Khao Yai Forest Complex',
    category: 'Natural',
    country: 'Thailand',
    location: 'Prachin Buri, Thailand',
    siteUrl: 'https://whc.unesco.org/en/list/590/',
    lastAssessment: '14/05/2026',
    progress: 16.67,
    images: [],
    description: 'The Dong Phayayen-Khao Yai Forest Complex spans 230 km between Ta Phraya National Park on the Cambodian border in the east, and Khao Yai National Park in the west.'
  },
  {
    _id: 'mock-2',
    name: 'Ujung Kulon National Park',
    category: 'Natural',
    country: 'Indonesia',
    location: 'Banten, Indonesia',
    siteUrl: 'https://whc.unesco.org/en/list/608/',
    lastAssessment: 'Not assessed',
    progress: 0,
    images: [],
    description: 'This national park, located in the extreme south-western tip of Java on the Sunda shelf, includes the Ujung Kulon peninsula and several offshore islands and encompasses the natural reserve of Krakatoa.'
  }
];

const getLocalSites = () => {
  const sites = localStorage.getItem('mock_sites');
  if (!sites) {
    localStorage.setItem('mock_sites', JSON.stringify(initialMockSites));
    return initialMockSites;
  }
  return JSON.parse(sites);
};

const saveLocalSites = (sites) => {
  localStorage.setItem('mock_sites', JSON.stringify(sites));
};

export const createSite = async (formData) => {
  if (IS_BYPASS) {
    const sites = getLocalSites();
    const newSite = {
      _id: `mock-${Date.now()}`,
      name: formData.get('name'),
      category: formData.get('category'),
      country: formData.get('country'),
      location: formData.get('location'),
      siteUrl: formData.get('siteUrl'),
      description: formData.get('description'),
      lastAssessment: 'Not assessed',
      progress: 0,
      images: []
    };
    sites.push(newSite);
    saveLocalSites(sites);
    return { success: true, data: newSite };
  }

  const { data } = await api.post('/sites', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const getSites = async () => {
  if (IS_BYPASS) {
    return { success: true, data: getLocalSites() };
  }
  const { data } = await api.get('/sites');
  return data;
};

export const getSite = async (id) => {
  if (IS_BYPASS) {
    const sites = getLocalSites();
    const site = sites.find(s => s._id === id);
    return { success: true, data: site };
  }
  const { data } = await api.get(`/sites/${id}`);
  return data;
};

export const deleteSite = async (id) => {
  if (IS_BYPASS) {
    let sites = getLocalSites();
    sites = sites.filter(s => s._id !== id);
    saveLocalSites(sites);
    return { success: true };
  }
  const { data } = await api.delete(`/sites/${id}`);
  return data;
};
