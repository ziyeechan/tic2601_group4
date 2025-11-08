import { mockBookings } from '../mockData';

export function Analytics() {
  const bookings = mockBookings;

  // Calculate statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const noShowBookings = bookings.filter(b => b.status === 'no_show').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
  const noShowRate = totalBookings > 0 ? Math.round((noShowBookings / totalBookings) * 100) : 0;
  const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

  // Group bookings by restaurant
  const bookingsByRestaurant = {};
  bookings.forEach(b => {
    if (!bookingsByRestaurant[b.restaurantName]) {
      bookingsByRestaurant[b.restaurantName] = 0;
    }
    bookingsByRestaurant[b.restaurantName]++;
  });

  // Group bookings by party size
  const bookingsByPartySize = {};
  bookings.forEach(b => {
    if (!bookingsByPartySize[b.partySize]) {
      bookingsByPartySize[b.partySize] = 0;
    }
    bookingsByPartySize[b.partySize]++;
  });

  const avgPartySize = bookings.length > 0
    ? (bookings.reduce((sum, b) => sum + b.partySize, 0) / bookings.length).toFixed(1)
    : 0;

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📊 Analytics & Business Insights</h2>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }} className="analytics-grid">
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
              {totalBookings}
            </div>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Total Bookings</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)', marginBottom: 'var(--spacing-sm)' }}>
              {confirmedBookings}
            </div>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Confirmed</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: 'var(--spacing-sm)' }}>
              {completedBookings}
            </div>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Completed</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--danger)', marginBottom: 'var(--spacing-sm)' }}>
              {noShowBookings}
            </div>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>No Shows</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
              {cancelledBookings}
            </div>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Cancelled</p>
          </div>
        </div>
      </div>

      {/* Performance Rates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }} className="metric-card">
        <div className="card">
          <div className="card-content">
            <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>Completion Rate</p>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)', marginBottom: 'var(--spacing-md)' }}>
              {completionRate}%
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${completionRate}%`,
                height: '100%',
                backgroundColor: 'var(--success)',
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>No-Show Rate</p>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger)', marginBottom: 'var(--spacing-md)' }}>
              {noShowRate}%
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${noShowRate}%`,
                height: '100%',
                backgroundColor: 'var(--danger)',
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>Cancellation Rate</p>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--warning)', marginBottom: 'var(--spacing-md)' }}>
              {cancellationRate}%
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${cancellationRate}%`,
                height: '100%',
                backgroundColor: 'var(--warning)',
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        {/* Bookings by Restaurant */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Bookings by Restaurant</h4>
          </div>
          <div className="card-content">
            {Object.entries(bookingsByRestaurant).map(([restaurant, count]) => (
              <div key={restaurant} className="mb-md">
                <div className="flex-between mb-xs">
                  <span style={{ fontWeight: '500' }}>{restaurant}</span>
                  <span style={{ fontWeight: '700' }}>{count}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(count / totalBookings) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Party Size Distribution */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Party Size Distribution</h4>
          </div>
          <div className="card-content">
            <div className="mb-lg" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
              <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>Average Party Size</p>
              <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{avgPartySize} people</p>
            </div>

            {Object.entries(bookingsByPartySize)
              .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
              .map(([size, count]) => (
              <div key={size} className="mb-md">
                <div className="flex-between mb-xs">
                  <span style={{ fontWeight: '500' }}>{size} {parseInt(size) === 1 ? 'person' : 'people'}</span>
                  <span style={{ fontWeight: '700' }}>{count}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(count / totalBookings) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--info)',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Booking Status Breakdown</h4>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--spacing-md)' }}>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>Pending</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--warning)' }}>{pendingBookings}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>Confirmed</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--success)' }}>{confirmedBookings}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>Completed</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#10b981' }}>{completedBookings}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>Cancelled</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-muted)' }}>{cancelledBookings}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>No Shows</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--danger)' }}>{noShowBookings}</p>
            </div>
            <div>
              <p className="text-muted" style={{ margin: 0, fontSize: '12px', marginBottom: 'var(--spacing-sm)' }}>Total</p>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--primary)' }}>{totalBookings}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
