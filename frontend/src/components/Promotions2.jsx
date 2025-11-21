import { useState, useEffect } from "react";
import { promotionAPI } from "../utils/api";
import { Card, FormInput, Toast, TextContainer } from "./Common";

export function Promotions({ onBack, restaurantId }) {
  const [promotions, setPromotions] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activePromos, setActivePromos] = useState([]);
  const [upcomingPromos, setUpcomingPromos] = useState([]);
  const [expiredPromos, setExpiredPromos] = useState([]);
  const [isEditingPromotions, setIsEditingPromotions] = useState(false);
  const [isAddingPromotions, setIsAddingPromotions] = useState(false);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    // Get all promotions for restaurant with ID restaurantID
    promotionAPI
      .getPromotionsByRestaurant(restaurantId)
      .then((res) => {
        setPromotions(res.data.promotionInfo || []);
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

  const handleDeletePromotion = async (promotionId) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      await promotionAPI
        .deletePromotion(promotionId)
        .then(() => handleToast("success", "Promotion has been successfully deleted!"))
        .catch((error) => console.error(error));
      setRefresh(false);
      setSelectedPromo(null);
    }
  };

  const isActive = (startDate, endDate) => {
    const today = new Date().toISOString().split("T")[0];
    return today >= startDate && today <= endDate;
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePromotionChange = (e) => {
    const { name, value } = e.target;
    setSelectedPromo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPromotion = async (e) => {
    e.preventDefault();

    if (selectedPromo.startAt >= selectedPromo.endAt) {
      handleToast("warning", "End date cannot be before start data!");
      return;
    }

    await promotionAPI
      .updatePromotion(selectedPromo.promotionId, selectedPromo)
      .then(() => {
        setRefresh(false);
        setIsEditingPromotions(false);
        setSelectedPromo(null);
        handleToast("success", "Promotion has been successfully updated!");
      })
      .catch((error) => console.error(error));
  };

  const handleToast = (type, message) => {
    setShow(true);
    setType(type);
    setMessage(message);
  };

  const handleCreatePromotion = async (e) => {
    e.preventDefault();

    if (selectedPromo.startAt >= selectedPromo.endAt) {
      handleToast("warning", "End date cannot be before start data!");
      return;
    }

    await promotionAPI
      .createPromotion(restaurantId, selectedPromo)
      .then(() => {
        setRefresh(false);
        setIsAddingPromotions(false);
        setSelectedPromo(null);
        handleToast("success", "Promotion has been successfully created!");
        setIsEditingPromotions(false);
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    setSelectedPromo(null);
    setIsEditingPromotions(false);
  };

  return (
    refresh && (
      <div>
        {/* Back Button */}
        <button className="btn btn-secondary mb-lg" onClick={onBack} style={{ border: "none" }}>
          ← Back
        </button>

        <div className="flex-between">
          <h2 style={{ marginBottom: "var(--spacing-lg)" }}>🎉 Current Promotions & Offers</h2>
          <button
            className="btn btn-success btn-sm"
            onClick={() => {
              setIsEditingPromotions(true);
              setSelectedPromo({
                description: "",
                discount: "",
                termsNCond: "",
                startAt: new Date().toISOString(),
                endAt: new Date().toISOString(),
              });
              setIsAddingPromotions(true);
            }}
            style={{
              alignSelf: "start",
            }}
          >
            ➕ Create Promotion
          </button>
        </div>

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
                <Card key={promo.id} style={{ borderLeft: "4px solid var(--success)" }}>
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

                    <TextContainer
                      className="mb-md"
                      title="Valid Until"
                      data={new Date(promo.endAt).toLocaleDateString()}
                    />

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
                  style={{
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
                  key={promo.promotionId}
                  style={{
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
                    <div className="flex-between">
                      <p className="text-muted" style={{ fontSize: "12px", margin: 0 }}>
                        Ended on {new Date(promo.endAt).toLocaleDateString()}
                      </p>
                      <p
                        onClick={() => handleDeletePromotion(promo.promotionId)}
                        style={{ cursor: "pointer" }}
                      >
                        🗑️
                      </p>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </div>
        )}
        {show && (
          <Toast type={type} text={message} duration={2500} onClose={() => setShow(false)} />
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
              {!isEditingPromotions ? (
                <Card.Content>
                  <TextContainer className="mb-lg" title="Restaurant">
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>
                      {selectedPromo.restaurantName}
                    </p>
                  </TextContainer>

                  <TextContainer className="mb-lg" title="Discount Code">
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
                  </TextContainer>

                  <TextContainer
                    className="mb-lg"
                    title="Valid Period"
                    data={`${new Date(selectedPromo.startAt).toLocaleDateString()} to${" "}${new Date(selectedPromo.endAt).toLocaleDateString()}`}
                  >
                    <p
                      className="text-muted"
                      style={{ margin: 0, fontSize: "12px", marginTop: "4px" }}
                    >
                      {isActive(selectedPromo.startAt, selectedPromo.endAt)
                        ? "✓ Currently Active"
                        : "Not Active"}
                    </p>
                  </TextContainer>

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

                  {/* Action Buttons */}
                  <div className="flex-between">
                    <button
                      className="btn btn-danger btn-full"
                      style={{ marginRight: "20px" }}
                      onClick={() => handleDeletePromotion(selectedPromo.promotionId)}
                    >
                      🗑️ Delete
                    </button>
                    <button
                      className="btn btn-primary btn-full"
                      style={{ marginLeft: "20px" }}
                      onClick={() => {
                        setIsEditingPromotions(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </Card.Content>
              ) : (
                <form onSubmit={isAddingPromotions ? handleCreatePromotion : handleSubmitPromotion}>
                  <Card.Content>
                    <FormInput name="description" text="Description">
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Enter description"
                        value={selectedPromo.description}
                        onChange={handlePromotionChange}
                        required
                      />
                    </FormInput>
                    <FormInput
                      name="discount"
                      text="Discount"
                      placeholder="Enter discount"
                      value={selectedPromo.discount}
                      onChange={handlePromotionChange}
                      required={true}
                    />
                    <FormInput name="termsNCond" text="Terms and Condition">
                      <textarea
                        id="termsNCond"
                        name="termsNCond"
                        value={selectedPromo.termsNCond}
                        placeholder="Enter terms and condition"
                        onChange={handlePromotionChange}
                        required
                      />
                    </FormInput>
                    <div className="form-row">
                      <FormInput
                        name="startAt"
                        text="Start Date"
                        type="datetime-local"
                        value={selectedPromo.startAt.slice(0, 16)}
                        onChange={handlePromotionChange}
                        required={true}
                      />
                      <FormInput
                        name="endAt"
                        text="End Date"
                        type="datetime-local"
                        value={selectedPromo.endAt.slice(0, 16)}
                        onChange={handlePromotionChange}
                        required={true}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        style={{ padding: "12px 24px", fontSize: "16px" }}
                      >
                        ✓ Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-full"
                        onClick={handleCancel}
                        style={{ padding: "12px 24px", fontSize: "16px" }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </Card.Content>
                </form>
              )}
            </Card>
          </div>
        )}
      </div>
    )
  );
}
