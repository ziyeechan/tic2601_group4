export function Header({ currentView, onViewChange, userRole }) {
  const renderNavButtons = () => {
    if (userRole === "customer") {
      return (
        <>
          <button
            className={`tab-button ${currentView === "all-promotions" ? "active" : ""}`}
            onClick={() => onViewChange("all-promotions")}
            style={{ border: "none", background: "none" }}
          >
            🎉 Promotions
          </button>
          <button
            className={`tab-button ${currentView === "home" ? "active" : ""}`}
            onClick={() => onViewChange("home")}
            style={{ border: "none", background: "none" }}
          >
            🏠 Discover
          </button>
          <button
            className={`tab-button ${currentView === "my-bookings" ? "active" : ""}`}
            onClick={() => onViewChange("my-bookings")}
            style={{ border: "none", background: "none" }}
          >
            📅 My Bookings
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            className={`tab-button ${currentView === "admin-bookings" ? "active" : ""}`}
            onClick={() => onViewChange("admin-bookings")}
            style={{ border: "none", background: "none" }}
          >
            📋 All Bookings
          </button>
          <button
            className={`tab-button ${currentView === "seating" ? "active" : ""}`}
            onClick={() => onViewChange("seating")}
            style={{ border: "none", background: "none" }}
          >
            🪑 Table Layout
          </button>
          <button
            className={`tab-button ${currentView === "analytics" ? "active" : ""}`}
            onClick={() => onViewChange("analytics")}
            style={{ border: "none", background: "none" }}
          >
            📊 Analytics
          </button>
        </>
      );
    }
  };

  return (
    <header>
      <div
        className="header-content"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => onViewChange("home")}
          className="logo"
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          🍽️ MakanTime
        </button>

        <nav>{renderNavButtons()}</nav>
      </div>
    </header>
  );
}
