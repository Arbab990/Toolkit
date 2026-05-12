const STATUS_CLASS_MAP = {
  'In Progress': 'status-badge--in-progress',
  'Completed': 'status-badge--completed',
  'Not Assessed': 'status-badge--not-assessed',
};

export default function SitesTable({ sites }) {
  return (
    <section className="sites-table-section" id="all-sites-table">
      <h2 className="sites-table-section__title">All Sites</h2>
      <div className="sites-table-wrapper">
        <table className="sites-table">
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Category</th>
              <th>Country</th>
              <th>Last Assessment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site, index) => (
              <tr key={index} id={`table-row-${index}`}>
                <td>{site.name}</td>
                <td>{site.category}</td>
                <td>{site.country}</td>
                <td>{site.lastAssessment}</td>
                <td>
                  <span
                    className={`status-badge ${STATUS_CLASS_MAP[site.status] || ''}`}
                  >
                    {site.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
