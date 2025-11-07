import { useState } from 'react';

export function Reviews({ restaurant, onBack }) {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      restaurantId: restaurant?.id,
      customerName: 'John Doe',
      rating: 5,
      comment: 'Excellent food and service! Highly recommended.',
      createdAt: '2024-11-01'
    },
    {
      id: 2,
      restaurantId: restaurant?.id,
      customerName: 'Jane Smith',
      rating: 4,
      comment: 'Great ambiance but a bit pricey.',
      createdAt: '2024-10-28'
    },
    {
      id: 3,
      restaurantId: restaurant?.id,
      customerName: 'Mike Johnson',
      rating: 5,
      comment: 'Perfect place for special occasions!',
      createdAt: '2024-10-20'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    comment: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.comment.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newReview = {
      id: reviews.length + 1,
      restaurantId: restaurant?.id,
      customerName: formData.customerName,
      rating: formData.rating,
      comment: formData.comment,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setReviews([newReview, ...reviews]);
    setFormData({
      customerName: '',
      rating: 5,
      comment: ''
    });
    setShowForm(false);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10b981'; // green
    if (rating >= 3) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div>
      {/* Back Button */}
      <button className="btn btn-secondary mb-lg" onClick={onBack} style={{ border: 'none' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Reviews List */}
        <div>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>⭐ Reviews & Ratings</h2>

          {reviews.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
              {reviews.map((review) => (
                <div key={review.id} className="card">
                  <div className="card-content">
                    <div className="flex-between mb-md" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <h5 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                          {review.customerName}
                        </h5>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ fontSize: '16px' }}>
                                {i < review.rating ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="text-muted" style={{ fontSize: '12px' }}>
                            {review.rating}.0/5.0
                          </span>
                        </div>
                      </div>
                      <span className="text-muted" style={{ fontSize: '12px' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{ margin: 0, color: 'var(--text-dark)' }}>
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No reviews yet</h3>
              <p>Be the first to review this restaurant!</p>
            </div>
          )}
        </div>

        {/* Rating Summary Sidebar */}
        <div>
          {/* Rating Summary Card */}
          <div className="card mb-lg">
            <div className="card-header">
              <h4 className="card-title">Rating Summary</h4>
            </div>
            <div className="card-content" style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: getRatingColor(parseFloat(averageRating)),
                marginBottom: 'var(--spacing-sm)'
              }}>
                {averageRating}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: 'var(--spacing-md)' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ fontSize: '20px' }}>
                    {i < Math.round(parseFloat(averageRating)) ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
              <p className="text-muted" style={{ margin: 0, marginBottom: 'var(--spacing-md)' }}>
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>

              {/* Review Distribution */}
              <div style={{ marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(r => r.rating === rating).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                  return (
                    <div key={rating} className="mb-md">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px' }}>{rating} ⭐</span>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{count}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-light)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: getRatingColor(rating),
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Write Review Button */}
          {!showForm && (
            <button
              className="btn btn-primary btn-full"
              onClick={() => setShowForm(true)}
              style={{ padding: '12px 24px', fontSize: '16px' }}
            >
              ✏️ Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="card-header">
              <h4 className="card-title">Write Your Review</h4>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label htmlFor="customerName">👤 Your Name *</label>
                  <input
                    id="customerName"
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rating">⭐ Rating *</label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <select
                      id="rating"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      style={{ flex: 1 }}
                      required
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Very Poor</option>
                    </select>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ fontSize: '24px' }}>
                          {i < formData.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comment">💬 Your Review *</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder="Share your experience..."
                    style={{ minHeight: '120px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                  >
                    ✓ Submit Review
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
