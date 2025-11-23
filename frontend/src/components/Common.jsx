import { useState, useEffect } from "react";

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

export function TextContainer({ children, text, data, className }) {
  return (
    <div
      className={className}
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

export function Toast({ type, text, onClose, duration }) {
  let color = "";
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          setVisible(false);
          setTimeout(onClose, 200);
          return 0;
        }
        return prev - 100 / (duration / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  switch (type) {
    case "info":
      color = "var(--info)";
      break;
    case "warning":
      color = "var(--warning)";
      break;
    case "success":
      color = "var(--success)";
      break;
    case "danger":
      color = "var(--danger)";
      break;
    default:
      color = "var(--primary)";
      break;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 32,
        right: 16,
        minWidth: 400,
        minHeight: 50,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255)",
        zIndex: 2000,
        padding: "16px 16px 0px",
        borderLeftColor: color,
        borderLeftStyle: "solid",
        borderLeftWidth: 12,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.25)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-10px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <div className="flex-between mb-md">
        <p style={{ marginRight: "var(--spacing-md)" }}>{text}</p>
        <div onClick={() => onClose()} style={{ cursor: "pointer" }}>
          {" "}
          X
        </div>
      </div>

      <div
        style={{
          width: "100%",
          borderRadius: 8,
          height: 4,
        }}
      >
        <div
          style={{
            backgroundColor: color,
            height: 4,
            transition: "all 0.2s ease",
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}
