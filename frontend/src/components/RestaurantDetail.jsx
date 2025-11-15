import { mockMenuItems } from '../mockData';

export function RestaurantDetail({ restaurant, onBack, onBookNow }) {
  const menuItems = mockMenuItems.filter(item => item.restaurantId === restaurant.restaurantId);

  // Default mock data for missing fields
  const defaultAmenities = ['Wifi', 'Parking', 'Wheelchair Accessible', 'Reservations'];
  const defaultOpeningHours = {
    Monday: '10:00 AM - 10:00 PM',
    Tuesday: '10:00 AM - 10:00 PM',
    Wednesday: '10:00 AM - 10:00 PM',
    Thursday: '10:00 AM - 10:00 PM',
    Friday: '10:00 AM - 11:00 PM',
    Saturday: '11:00 AM - 11:00 PM',
    Sunday: '11:00 AM - 10:00 PM',
  };
  const defaultTimeSlots = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'];

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
                  <h2 style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>{restaurant.restaurantName}</h2>
                  <p className="text-muted" style={{ margin: 0 }}>{restaurant.cuisine || 'Cuisine Not Specified'}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-md mb-md" style={{ alignItems: 'center' }}>
                <div style={{ fontSize: '20px' }}>⭐ N/A</div>
                <div className="text-muted">(Check reviews for ratings)</div>
              </div>

              {/* Amenities */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h5 style={{ marginBottom: 'var(--spacing-sm)' }}>Amenities:</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                  {(restaurant.amenities || defaultAmenities).map((amenity) => (
                    <span key={amenity} className="badge badge-primary">
                      {amenity}
                    </span>
                  ))}
                </div>
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

          {/* Opening Hours Card */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Opening Hours</h4>
            </div>
            <div className="card-content">
              {Object.entries(restaurant.openingHours || defaultOpeningHours).map(([day, hours]) => (
                <div key={day} className="flex-between mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: '500' }}>{day}</span>
                  <span className="text-muted">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Menu & Booking */}
        <div>
          {/* Available Times Card */}
          <div className="card mb-lg">
            <div className="card-header">
              <h4 className="card-title">Available Time Slots</h4>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)' }}>
                {(restaurant.availableTimeSlots || defaultTimeSlots).map((time) => (
                  <button
                    key={time}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '14px' }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Card */}
          {menuItems.length > 0 && (
            <div className="card mb-lg">
              <div className="card-header">
                <h4 className="card-title">Sample Menu</h4>
              </div>
              <div className="card-content">
                {menuItems.map((item) => (
                  <div key={item.id} className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex-between mb-sm" style={{ alignItems: 'flex-start' }}>
                      <h5 style={{ margin: 0 }}>{item.name}</h5>
                      <span style={{ fontWeight: '600', color: 'var(--success)' }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '14px', marginBottom: 'var(--spacing-sm)' }}>
                      {item.description}
                    </p>
                    {item.allergens && item.allergens.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                        {item.allergens.map((allergen) => (
                          <span
                            key={allergen}
                            className="badge"
                            style={{
                              background: getAllergenBadge(allergen),
                              color: '#000',
                              fontSize: '12px',
                              padding: '2px 8px'
                            }}
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
