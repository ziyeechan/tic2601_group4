import { useState } from 'react';
import { mockBookings } from '../mockData';

export function MyBookings() {
  const [bookings, setBookings] = useState(mockBookings);
  const [activeTab, setActiveTab] = useState('upcoming');

  const today = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter(b =>
    (b.status === 'confirmed' || b.status === 'pending') && b.date >= today
  );

  const pastBookings = bookings.filter(b =>
    (b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show') || b.date < today
  );

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'confirmed': 'status-confirmed',
      'pending': 'status-pending',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'no_show': 'status-no_show',
      'seated': 'status-seated'
    };
    return statusClasses[status] || '';
  };

  const handleCancel = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    }
  };

  const handleEdit = (booking) => {
    alert(`Edit booking: ${booking.id} - This feature will be implemented in the next phase.`);
  };

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📅 My Bookings</h2>

      {/* Tabs */}
      <div className="tabs mb-lg">
        <button
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
          style={{ border: 'none', background: 'none' }}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
          style={{ border: 'none', background: 'none' }}
        >
          Past Bookings ({pastBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {displayBookings.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
          {displayBookings.map((booking) => (
            <div key={booking.id} className="card">
              <div className="card-content">
                <div className="flex-between mb-md" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                      {booking.restaurantName}
                    </h4>
                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '12px' }}>
                    Booking ID: {booking.id}
                  </div>
                </div>

                {/* Booking Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>📅 Date & Time</span>
                    <p style={{ fontWeight: '600', margin: 0 }}>
                      {new Date(booking.date).toLocaleDateString()} at {booking.time}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>👥 Party Size</span>
                    <p style={{ fontWeight: '600', margin: 0 }}>
                      {booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>📞 Phone</span>
                    <p style={{ fontWeight: '600', margin: 0 }}>{booking.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>📧 Email</span>
                    <p style={{ fontWeight: '600', margin: 0 }}>{booking.customerEmail}</p>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mb-md" style={{ paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                    <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>💬 Special Requests</span>
                    <p style={{ margin: 0 }}>{booking.specialRequests}</p>
                  </div>
                )}

                {/* Booking Date */}
                <div className="text-muted" style={{ fontSize: '12px', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <div className="card-footer" style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(booking)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(booking.id)}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
          <h3>No bookings found</h3>
          <p>
            {activeTab === 'upcoming'
              ? 'You don\'t have any upcoming bookings yet. Start exploring restaurants!'
              : 'You don\'t have any past bookings.'}
          </p>
        </div>
      )}
    </div>
  );
}
