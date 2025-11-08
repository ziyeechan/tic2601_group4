import { useState } from "react";

export function Header({ currentView, onViewChange, userRole }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderNavButtons = () => {
    if (userRole === "customer") {
      return (
        <>
          <button
            className={`tab-button ${currentView === "home" ? "active" : ""}`}
            onClick={() => {
              onViewChange("home");
              setMobileMenuOpen(false);
            }}
            style={{ border: "none", background: "none" }}
          >
            🏠 Discover
          </button>
          <button
            className={`tab-button ${
              currentView === "my-bookings" ? "active" : ""
            }`}
            onClick={() => {
              onViewChange("my-bookings");
              setMobileMenuOpen(false);
            }}
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
            className={`tab-button ${
              currentView === "admin-bookings" ? "active" : ""
            }`}
            onClick={() => {
              onViewChange("admin-bookings");
              setMobileMenuOpen(false);
            }}
            style={{ border: "none", background: "none" }}
          >
            📋 All Bookings
          </button>
          <button
            className={`tab-button ${
              currentView === "seating" ? "active" : ""
            }`}
            onClick={() => {
              onViewChange("seating");
              setMobileMenuOpen(false);
            }}
            style={{ border: "none", background: "none" }}
          >
            🪑 Table Layout
          </button>
          <button
            className={`tab-button ${
              currentView === "analytics" ? "active" : ""
            }`}
            onClick={() => {
              onViewChange("analytics");
              setMobileMenuOpen(false);
            }}
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
        <div
          className="flex gap-md"
          style={{ flex: 1, alignItems: "center", minWidth: 0 }}
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

          {currentView === "home" && (
            <div
              style={{
                position: "relative",
                flex: 1,
                maxWidth: "300px",
                display: "none",
              }}
              className="show-desktop-search"
            >
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    fontSize: "18px",
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: "36px", fontSize: "14px" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="hide-desktop"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            border: "none",
            background: "none",
            fontSize: "24px",
            cursor: "pointer",
            padding: "8px",
            marginLeft: "var(--spacing-sm)",
          }}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Desktop Navigation */}
        <nav
          style={{ display: mobileMenuOpen ? "flex" : "none" }}
          className="nav-menu"
        >
          {renderNavButtons()}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              alert("Profile menu - Add dropdown menu later");
              setMobileMenuOpen(false);
            }}
          >
            👤 Profile
          </button>
        </nav>

        {/* Desktop Navigation - Always visible on desktop */}
        <nav className="hide-mobile" style={{ display: "flex" }}>
          {renderNavButtons()}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              alert("Profile menu - Add dropdown menu later");
            }}
          >
            👤 Profile
          </button>
        </nav>
      </div>

      {/* Mobile Menu - Full width */}
      {mobileMenuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
            padding: "var(--spacing-md)",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-light)",
          }}
          className="hide-desktop"
        >
          {currentView === "home" && (
            <div
              style={{
                position: "relative",
                marginBottom: "var(--spacing-sm)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  fontSize: "16px",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "36px", width: "100%" }}
              />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
