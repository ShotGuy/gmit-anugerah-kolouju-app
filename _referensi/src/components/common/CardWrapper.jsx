export default function CardWrapper({ children }) {
  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "2rem",
        }}
      >
        {children}
      </div>
    </div>
  );
}
