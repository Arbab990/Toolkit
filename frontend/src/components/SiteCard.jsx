import { Link } from 'react-router-dom';

export default function SiteCard({ site }) {
  const {
    _id,
    name,
    category,
    country,
    images,
    lastAssessment,
    progress,
  } = site;

  // Use first uploaded image or fallback to placeholder
  const imageSrc = images && images.length > 0 ? images[0] : '/images/green-valley.png';

  return (
    <Link to={`/sites/${_id}`} className="site-card" id={`site-card-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="site-card__image-wrapper">
        <img
          className="site-card__image"
          src={imageSrc}
          alt={`${name} - ${category}`}
          loading="lazy"
        />
      </div>
      <div className="site-card__body">
        <div className="site-card__main">
          <h3 className="site-card__name">{name}</h3>
          <p className="site-card__category">{category}</p>
          <p className="site-card__country">{country}</p>
        </div>

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
    </Link>
  );
}
