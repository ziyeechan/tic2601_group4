import { useState, useEffect } from "react";
import { promotionAPI } from "../api";
export function Promotions({ onBack }) {
  const [promotions, setPromotions] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activePromos, setActivePromos] = useState([]);
  const [upcomingPromos, setUpcomingPromos] = useState([]);
  const [expiredPromos, setExpiredPromos] = useState([]);

  useEffect(() => {
    // Get all promotions for restaurant with ID 1
    promotionAPI
      .getPromotionsByRestaurant(1)
      .then((res) => {
        setPromotions(res.data || []);
        setRefresh(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [refresh]);

  useEffect(() => {
    if (promotions) {
      {
        setActivePromos(
          promotions.filter((p) => {
            isActive(p.startAt, p.endAt);
          })
        );

        setUpcomingPromos(
          promotions.filter(
            (p) => p.startAt > new Date().toISOString().split("T")[0]
          )
        );

        setExpiredPromos(
          promotions.filter(
            (p) => p.endAt < new Date().toISOString().split("T")[0]
          )
        );
      }
    }
  }, [promotions]);

  const isActive = (startDate, endDate) => {
    const today = new Date().toISOString().split("T")[0];
    return today >= startDate && today <= endDate;
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    refresh && (
      <div>
        {/* Back Button */}
        <button
          className="btn btn-secondary mb-lg"
          onClick={onBack}
          style={{ border: "none" }}
        >
          ← Back
        </button>

        <h2 style={{ marginBottom: "var(--spacing-lg)" }}>
          🎉 Current Promotions & Offers
        </h2>

        {/* Active Promotions */}
        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <h3
            style={{
              marginBottom: "var(--spacing-md)",
              color: "var(--success)",
            }}
          >
            ✓ Active Promotions ({activePromos.length})
          </h3>
          {activePromos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--spacing-md)",
              }}
            >
              {activePromos.map((promo) => (
                <div
                  key={promo.id}
                  className="card"
                  style={{ borderLeft: "4px solid var(--success)" }}
                >
                  <div className="card-content">
                    <div className="mb-md">
                      <h5
                        style={{
                          margin: 0,
                          marginBottom: "var(--spacing-xs)",
                          color: "var(--primary)",
                        }}
                      >
                        {promo.restaurantName}
                      </h5>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "600",
                          color: "var(--success)",
                        }}
                      >
                        {promo.description}
                      </p>
                    </div>

                    <div
                      className="mb-md"
                      style={{
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--primary-light)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <p
                        className="text-muted"
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        Discount Code
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--spacing-sm)",
                          alignItems: "center",
                        }}
                      >
                        <code
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            padding: "4px 8px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            flex: 1,
                          }}
                        >
                          {promo.discountCode}
                        </code>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleCopyCode(promo.discountCode)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor:
                              copiedCode === promo.discountCode
                                ? "var(--success)"
                                : "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          {copiedCode === promo.discountCode
                            ? "✓ Copied"
                            : "📋 Copy"}
                        </button>
                      </div>
                    </div>

                    <div
                      className="mb-md"
                      style={{
                        paddingBottom: "var(--spacing-md)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <p
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                          marginBottom: "4px",
                        }}
                      >
                        Valid Until
                      </p>
                      <p style={{ margin: 0, fontWeight: "600" }}>
                        {new Date(promo.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <p
                      className="text-muted"
                      style={{
                        fontSize: "12px",
                        margin: 0,
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      {promo.termsAndConditions}
                    </p>

                    <button
                      className="btn btn-primary btn-full"
                      onClick={() => setSelectedPromo(promo)}
                      style={{ padding: "8px 16px", fontSize: "14px" }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="empty-state"
              style={{ padding: "var(--spacing-lg)" }}
            >
              <p className="text-muted">No active promotions at the moment.</p>
            </div>
          )}
        </div>

        {/* Upcoming Promotions */}
        {upcomingPromos.length > 0 && (
          <div style={{ marginBottom: "var(--spacing-xl)" }}>
            <h3
              style={{
                marginBottom: "var(--spacing-md)",
                color: "var(--warning)",
              }}
            >
              📅 Upcoming Promotions ({upcomingPromos.length})
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--spacing-md)",
              }}
            >
              {upcomingPromos.map((promo) => (
                <div
                  key={promo.id}
                  className="card"
                  style={{
                    borderLeft: "4px solid var(--warning)",
                    opacity: 0.8,
                  }}
                >
                  <div className="card-content">
                    <div className="mb-md">
                      <h5
                        style={{
                          margin: 0,
                          marginBottom: "var(--spacing-xs)",
                          color: "var(--primary)",
                        }}
                      >
                        {promo.restaurantName}
                      </h5>
                      <p style={{ margin: 0, fontWeight: "600" }}>
                        {promo.description}
                      </p>
                    </div>

                    <div
                      className="mb-md"
                      style={{
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--bg-light)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <p
                        className="text-muted"
                        style={{ margin: 0, fontSize: "12px" }}
                      >
                        Starts on{" "}
                        {new Date(promo.startDate).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      className="btn btn-secondary btn-full"
                      onClick={() => setSelectedPromo(promo)}
                      style={{ padding: "8px 16px", fontSize: "14px" }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expired Promotions */}
        {expiredPromos.length > 0 && (
          <div>
            <h3
              style={{
                marginBottom: "var(--spacing-md)",
                color: "var(--text-muted)",
              }}
            >
              ✕ Expired Promotions ({expiredPromos.length})
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--spacing-md)",
              }}
            >
              {expiredPromos.map((promo) => (
                <div
                  key={promo.id}
                  className="card"
                  style={{
                    borderLeft: "4px solid var(--text-muted)",
                    opacity: 0.6,
                  }}
                >
                  <div className="card-content">
                    <div className="mb-md">
                      <h5
                        style={{
                          margin: 0,
                          marginBottom: "var(--spacing-xs)",
                          color: "var(--primary)",
                        }}
                      >
                        {promo.restaurantName}
                      </h5>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "600",
                          textDecoration: "line-through",
                        }}
                      >
                        {promo.description}
                      </p>
                    </div>
                    <p
                      className="text-muted"
                      style={{ fontSize: "12px", margin: 0 }}
                    >
                      Ended on {new Date(promo.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Modal */}
        {selectedPromo && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div className="card" style={{ maxWidth: "500px", width: "90%" }}>
              <div className="card-header">
                <h4 className="card-title">{selectedPromo.description}</h4>
              </div>
              <div className="card-content">
                <div
                  className="mb-lg"
                  style={{
                    paddingBottom: "var(--spacing-md)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <p
                    className="text-muted"
                    style={{ margin: 0, fontSize: "12px", marginBottom: "4px" }}
                  >
                    Restaurant
                  </p>
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>
                    {selectedPromo.restaurantName}
                  </p>
                </div>

                <div
                  className="mb-lg"
                  style={{
                    paddingBottom: "var(--spacing-md)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <p
                    className="text-muted"
                    style={{ margin: 0, fontSize: "12px", marginBottom: "4px" }}
                  >
                    Discount Code
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--spacing-sm)",
                      alignItems: "center",
                    }}
                  >
                    <code
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        padding: "8px 12px",
                        backgroundColor: "var(--bg-light)",
                        borderRadius: "4px",
                        flex: 1,
                      }}
                    >
                      {selectedPromo.discountCode}
                    </code>
                    <button
                      onClick={() => handleCopyCode(selectedPromo.discountCode)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor:
                          copiedCode === selectedPromo.discountCode
                            ? "var(--success)"
                            : "var(--primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                      }}
                    >
                      {copiedCode === selectedPromo.discountCode
                        ? "✓ Copied!"
                        : "📋 Copy"}
                    </button>
                  </div>
                </div>

                <div
                  className="mb-lg"
                  style={{
                    paddingBottom: "var(--spacing-md)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <p
                    className="text-muted"
                    style={{ margin: 0, fontSize: "12px", marginBottom: "4px" }}
                  >
                    Valid Period
                  </p>
                  <p style={{ margin: 0, fontWeight: "600" }}>
                    {new Date(selectedPromo.startDate).toLocaleDateString()} to{" "}
                    {new Date(selectedPromo.endDate).toLocaleDateString()}
                  </p>
                  <p
                    className="text-muted"
                    style={{ margin: 0, fontSize: "12px", marginTop: "4px" }}
                  >
                    {isActive(selectedPromo.startDate, selectedPromo.endDate)
                      ? "✓ Currently Active"
                      : "Not Active"}
                  </p>
                </div>

                <div className="mb-lg">
                  <p
                    className="text-muted"
                    style={{ margin: 0, fontSize: "12px", marginBottom: "4px" }}
                  >
                    Terms & Conditions
                  </p>
                  <p style={{ margin: 0 }}>
                    {selectedPromo.termsAndConditions}
                  </p>
                </div>

                <button
                  className="btn btn-secondary btn-full"
                  onClick={() => setSelectedPromo(null)}
                  style={{ padding: "10px 20px" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
}
