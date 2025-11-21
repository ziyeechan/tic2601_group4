import { useState, useEffect } from "react";
import { promotionAPI } from "../utils/api";
import { Card } from "./Common";

export function AllPromotions({ onBack }) {
  const [promotions, setPromotions] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activePromos, setActivePromos] = useState([]);
  const [upcomingPromos, setUpcomingPromos] = useState([]);
  const [expiredPromos, setExpiredPromos] = useState([]);

  useEffect(() => {
    // Get all promotions
    promotionAPI
      .getAllPromotions()
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
            return isActive(p.startAt, p.endAt);
          })
        );

        setUpcomingPromos(
          promotions.filter((p) => p.startAt > new Date().toISOString().split("T")[0])
        );

        setExpiredPromos(
          promotions.filter((p) => p.endAt < new Date().toISOString().split("T")[0])
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

  const handleCancel = () => {
    setSelectedPromo(null);
  };

  return (
    refresh && (
      <div>
        {/* Back Button */}
        <button className="btn btn-secondary mb-lg" onClick={onBack} style={{ border: "none" }}>
          ← Back
        </button>

        <h2 style={{ marginBottom: "var(--spacing-lg)" }}>🎉 Current Promotions & Offers</h2>

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
                <Card key={promo.id} styles={{ borderLeft: "4px solid var(--success)" }}>
                  <Card.Content>
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
                          {promo.discount}
                        </code>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleCopyCode(promo.discount)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor:
                              copiedCode === promo.discount ? "var(--success)" : "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          {copiedCode === promo.discount ? "✓ Copied" : "📋 Copy"}
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
                        {new Date(promo.endAt).toLocaleDateString()}
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
                      {promo.termsNCond}
                    </p>

                    <button
                      className="btn btn-primary btn-full"
                      onClick={() => setSelectedPromo(promo)}
                      style={{ padding: "8px 16px", fontSize: "14px" }}
                    >
                      View Details
                    </button>
                  </Card.Content>
                </Card>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "var(--spacing-lg)" }}>
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
                <Card
                  key={promo.id}
                  styles={{
                    borderLeft: "4px solid var(--warning)",
                    opacity: 0.8,
                  }}
                >
                  <Card.Content>
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
                      <p style={{ margin: 0, fontWeight: "600" }}>{promo.description}</p>
                    </div>

                    <div
                      className="mb-md"
                      style={{
                        padding: "var(--spacing-md)",
                        backgroundColor: "var(--bg-light)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <p className="text-muted" style={{ margin: 0, fontSize: "12px" }}>
                        Starts on {new Date(promo.startAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      className="btn btn-secondary btn-full"
                      onClick={() => setSelectedPromo(promo)}
                      style={{ padding: "8px 16px", fontSize: "14px" }}
                    >
                      View Details
                    </button>
                  </Card.Content>
                </Card>
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
                <Card
                  key={promo.id}
                  styles={{
                    borderLeft: "4px solid var(--text-muted)",
                    opacity: 0.6,
                  }}
                >
                  <Card.Content>
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
                    <p className="text-muted" style={{ fontSize: "12px", margin: 0 }}>
                      Ended on {new Date(promo.endAt).toLocaleDateString()}
                    </p>
                  </Card.Content>
                </Card>
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
            <Card className="mb-lg" styles={{ maxWidth: "550px", width: "90%" }}>
              <Card.Header className="flex-between">
                <h4>{selectedPromo.description}</h4>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCancel()}
                  style={{ padding: "10px 20px", marginLeft: "20px" }}
                >
                  X
                </button>
              </Card.Header>
              <Card.Content>
                <div
                  className="mb-lg"
                  style={{
                    paddingBottom: "var(--spacing-md)",
                    borderBottom: "1px solid var(--border-color)",
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
                        fontSize: "18px",
                        fontWeight: "700",
                        padding: "8px 12px",
                        backgroundColor: "var(--bg-light)",
                        borderRadius: "4px",
                        flex: 1,
                      }}
                    >
                      {selectedPromo.discount}
                    </code>
                    <button
                      onClick={() => handleCopyCode(selectedPromo.discount)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor:
                          copiedCode === selectedPromo.discount
                            ? "var(--success)"
                            : "var(--primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                      }}
                    >
                      {copiedCode === selectedPromo.discount ? "✓ Copied!" : "📋 Copy"}
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
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    Valid Period
                  </p>
                  <p style={{ margin: 0, fontWeight: "600" }}>
                    {new Date(selectedPromo.startAt).toLocaleDateString()} to{" "}
                    {new Date(selectedPromo.endAt).toLocaleDateString()}
                  </p>
                  <p
                    className="text-muted"
                    style={{ margin: 0, fontSize: "12px", marginTop: "4px" }}
                  >
                    {isActive(selectedPromo.startAt, selectedPromo.endAt)
                      ? "✓ Currently Active"
                      : "Not Active"}
                  </p>
                </div>

                <div className="mb-lg">
                  <p
                    className="text-muted"
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    Terms & Conditions
                  </p>
                  <p style={{ margin: 0 }}>{selectedPromo.termsNCond}</p>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>
    )
  );
}
