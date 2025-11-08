import { useState } from 'react';
import { mockBookings } from '../mockData';

export function AdminBookings() {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

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

  // Filter bookings
  let filtered = bookings;

  if (searchTerm) {
    filtered = filtered.filter(b =>
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (statusFilter !== 'all') {
    filtered = filtered.filter(b => b.status === statusFilter);
  }

  if (dateFilter) {
    filtered = filtered.filter(b => b.date === dateFilter);
  }

  // Handle status updates
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(bookings.map(b =>
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
  };

  const getActionButtons = (booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <>
            <button
              className="btn btn-success btn-sm"
              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
            >
              ✓ Confirm
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
            >
              ✕ Reject
            </button>
          </>
        );
      case 'confirmed':
        return (
          <>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => updateBookingStatus(booking.id, 'seated')}
            >
              👤 Seat
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => updateBookingStatus(booking.id, 'no_show')}
            >
              ✕ No Show
            </button>
          </>
        );
      case 'seated':
        return (
          <button
            className="btn btn-success btn-sm"
            onClick={() => updateBookingStatus(booking.id, 'completed')}
          >
            ✓ Complete
          </button>
        );
      default:
        return (
          <span className="text-muted" style={{ fontSize: '12px' }}>No actions available</span>
        );
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📋 All Bookings Management</h2>

      {/* Filters Card */}
      <div className="card mb-lg">
        <div className="card-header">
          <h4 className="card-title">Filters & Search</h4>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }} className="admin-filters">
            {/* Search */}
            <div className="form-group">
              <label htmlFor="search">🔍 Search</label>
              <input
                id="search"
                type="text"
                placeholder="Name, email, or restaurant"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="form-group">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="seated">Seated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="form-group">
              <label htmlFor="dateFilter">📅 Date</label>
              <input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {filtered.length > 0 ? (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Date & Time</th>
                  <th>Party Size</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div>
                        <p style={{ fontWeight: '600', margin: 0 }}>{booking.customerName}</p>
                      </div>
                    </td>
                    <td>{booking.restaurantName}</td>
                    <td>
                      <div>
                        <p style={{ margin: 0 }}>📅 {new Date(booking.date).toLocaleDateString()}</p>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px' }}>⏰ {booking.time}</p>
                      </div>
                    </td>
                    <td>👥 {booking.partySize}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        <p style={{ margin: 0, marginBottom: '4px' }}>📞 {booking.customerPhone}</p>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>📧 {booking.customerEmail}</p>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                        {getActionButtons(booking)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No bookings found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }} className="stats-cards">
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <p className="text-muted" style={{ margin: 0 }}>Confirmed</p>
          </div>
        </div>
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning)' }}>
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <p className="text-muted" style={{ margin: 0 }}>Pending</p>
          </div>
        </div>
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <p className="text-muted" style={{ margin: 0 }}>Completed</p>
          </div>
        </div>
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger)' }}>
              {bookings.filter(b => b.status === 'no_show').length}
            </div>
            <p className="text-muted" style={{ margin: 0 }}>No Shows</p>
          </div>
        </div>
      </div>
    </div>
  );
}
