export function Card({ children, className = "" }) {
  return <div className={`card mb-lg ${className}`}>{children}</div>;
}

Card.Header = function Header({ children, className, title }) {
  return (
    <div className={`card-header ${className}`}>
      {title && <h4 className="card-title">{title}</h4>}
      {children}
    </div>
  );
};

Card.Content = function Content({ children, className }) {
  return <div className={`card-content ${className}`}>{children}</div>;
};

export function Container({ children, text, data }) {
  return (
    <div
      className="mb-md"
      style={{
        paddingBottom: "var(--spacing-md)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      {text && (
        <p
          className="text-muted"
          style={{
            fontSize: "12px",
            margin: 0,
            marginBottom: "4px",
          }}
        >
          {text}
        </p>
      )}
      {data && <p style={{ fontWeight: "600", margin: 0 }}>{data}</p>}
      {children}
    </div>
  );
}

export function MutedText({ text, styles }) {
  return (
    <p className="text-muted" style={{ margin: 0, styles }}>
      {text}
    </p>
  );
}
