import { mockMenuItems } from '../mockData';

export function RestaurantDetail({ restaurant, onBack, onBookNow }) {
  const menuItems = mockMenuItems.filter(item => item.restaurantId === restaurant.id);

  const getAllergenBadge = (allergen) => {
    const colors = {
      dairy: '#fee2e2',
      shellfish: '#fef3c7',
      gluten: '#cffafe',
      nuts: '#fce7f3'
    };
    return colors[allergen] || '#e2e8f0';
  };

  return (
    <div>
      {/* Back Button */}
      <button className="btn btn-secondary mb-lg" onClick={onBack} style={{ border: 'none' }}>
        ← Back to Restaurants
      </button>

      {/* Hero Image */}
      <div className="aspect-video image-container mb-lg" style={{ height: '300px' }}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-light);color:var(--text-muted);">No Image Available</div>';
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        {/* Left Column - Basic Info */}
        <div>
          {/* Info Card */}
          <div className="card mb-lg">
            <div className="card-content">
              <div className="flex-between mb-md" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>{restaurant.name}</h2>
                  <p className="text-muted" style={{ margin: 0 }}>{restaurant.cuisine} • {restaurant.priceRange}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-md mb-md" style={{ alignItems: 'center' }}>
                <div style={{ fontSize: '20px' }}>⭐ {restaurant.rating}</div>
                <div className="text-muted">({restaurant.reviewCount} reviews)</div>
              </div>
              
              {/* Description */}
              <p className="text-muted">{restaurant.description}</p>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="card mb-lg">
            <div className="card-header">
              <h4 className="card-title">Contact Information</h4>
            </div>
            <div className="card-content">
              <div className="mb-md">
                <div className="text-muted" style={{ fontSize: '14px' }}>📍 Address</div>
                <p>{restaurant.address}</p>
              </div>
              <div className="mb-md">
                <div className="text-muted" style={{ fontSize: '14px' }}>📞 Phone</div>
                <p>{restaurant.phone}</p>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '14px' }}>📧 Email</div>
                <p>{restaurant.email}</p>
              </div>
            </div>
          </div>
        </div>
    <div>

          {/* Book Now Button */}
          <button
            className="btn btn-primary btn-full"
            onClick={() => onBookNow(restaurant)}
            style={{ padding: '12px 24px', fontSize: '16px' }}
          >
            🎫 Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
