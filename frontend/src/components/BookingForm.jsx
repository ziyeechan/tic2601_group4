import { useState } from 'react';

export function BookingForm({ restaurant, onBack, onBookingComplete }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    partySize: 2,
    date: '',
    time: '',
    specialRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'partySize' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customerName.trim() || !formData.customerEmail.trim() ||
        !formData.customerPhone.trim() || !formData.date || !formData.time) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage({
        type: 'success',
        text: 'Booking confirmed! Confirmation code: BK' + Math.random().toString(36).substr(2, 9).toUpperCase()
      });

      // Clear form after success
      setTimeout(() => {
        onBookingComplete();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to create booking. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Back Button */}
      <button className="btn btn-secondary mb-lg" onClick={onBack} style={{ border: 'none' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }} className="booking-form-container">
        {/* Main Form */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Complete Your Booking</h3>
            </div>
            <div className="card-content">
              {message && (
                <div className={`alert alert-${message.type} mb-lg`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Your Information</h4>

                <div className="form-group">
                  <label htmlFor="customerName">👤 Full Name *</label>
                  <input
                    id="customerName"
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customerEmail">📧 Email *</label>
                    <input
                      id="customerEmail"
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customerPhone">📞 Phone *</label>
                    <input
                      id="customerPhone"
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      placeholder="+1-555-0000"
                      required
                    />
                  </div>
                </div>

                {/* Reservation Details */}
                <h4 style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>Reservation Details</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">📅 Date *</label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={today}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="time">⏰ Time *</label>
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a time</option>
                      {restaurant.availableTimeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="partySize">👥 Party Size *</label>
                  <select
                    id="partySize"
                    name="partySize"
                    value={formData.partySize}
                    onChange={handleChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((size) => (
                      <option key={size} value={size}>
                        {size} {size === 1 ? 'person' : 'people'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Special Requests */}
                <div className="form-group">
                  <label htmlFor="specialRequests">💬 Special Requests (Optional)</label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Dietary restrictions, special occasion, seating preferences, etc."
                    style={{ minHeight: '100px' }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? '⏳ Processing...' : '✓ Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div>
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Booking Summary</h4>
            </div>
            <div className="card-content">
              <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>Restaurant</p>
                <p style={{ fontWeight: '600', margin: 0 }}>{restaurant.name}</p>
              </div>

              <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>Date & Time</p>
                <p style={{ fontWeight: '600', margin: 0 }}>
                  {formData.date ? new Date(formData.date).toLocaleDateString() : 'Not selected'}
                </p>
                <p style={{ fontWeight: '600', margin: 0 }}>
                  {formData.time || 'Not selected'}
                </p>
              </div>

              <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>Party Size</p>
                <p style={{ fontWeight: '600', margin: 0 }}>
                  {formData.partySize} {formData.partySize === 1 ? 'person' : 'people'}
                </p>
              </div>

              <div className="mb-lg">
                <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>Location</p>
                <p style={{ fontWeight: '600', margin: 0, fontSize: '14px' }}>
                  {restaurant.address}
                </p>
              </div>

              <div className="alert alert-info">
                <p style={{ margin: 0, fontSize: '14px' }}>
                  ℹ️ You'll receive a confirmation email with your booking details and confirmation code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
