export default function SiteCard({ site }) {
  const {
    name,
    category,
    country,
    image,
    lastAssessment,
    progress,
  } = site;

  return (
    <div className="site-card" id={`site-card-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="site-card__image-wrapper">
        <img
          className="site-card__image"
          src={image}
          alt={`${name} - ${category}`}
          loading="lazy"
        />
      </div>
      <div className="site-card__body">
        <h3 className="site-card__name">{name}</h3>
        <p className="site-card__category">{category}</p>
        <p className="site-card__country">{country}</p>

        <div className="site-card__footer">
          <span className="site-card__assessment">
            Last assessment: {lastAssessment}
          </span>
        </div>

        <div className="progress-bar">
          <div className="progress-bar__track">
            <div
              className="progress-bar__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-bar__label">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
