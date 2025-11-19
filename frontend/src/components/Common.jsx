export function Card({ children, className = "", styles }) {
  return (
    <div className={`card ${className}`} style={styles}>
      {children}
    </div>
  );
}

Card.Header = function Header({ children, className, title }) {
  return (
    <div className={`card-header ${className}`}>
      {title && <h4 className="card-title">{title}</h4>}
      {children}
    </div>
  );
};

Card.Content = function Content({ children, className, styles }) {
  return (
    <div className={`card-content ${className}`} style={styles}>
      {children}
    </div>
  );
};

Card.Footer = function Footer({ children, className, styles }) {
  return (
    <div className={`card-footer ${className}`} style={styles}>
      {children}
    </div>
  );
};

export function TextContainer({ children, text, data }) {
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

export function FormInput({
  type,
  name,
  value,
  onChange,
  text,
  placeholder,
  children,
  required = false,
}) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{text}</label>
      {children ? (
        children
      ) : (
        <input
          id={name}
          type={type ? type : "text"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}
