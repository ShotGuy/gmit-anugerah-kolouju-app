import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

export default function LoadingScreen({
  size = 140,
  message = "",
  imageFront = "/logo-GMIT.png",
  imageBack = "/logo-GMIT.png",
  paused = false,
  isLoading = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  if (!isLoading || !mounted) return null;

  const px = typeof size === "number" ? `${size}px` : size;

  const loadingContent = (
    <div
      className="loading-screen-backdrop"
      role="presentation"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.3s ease-in-out",
      }}
    >
      {/* Content Container */}
      <div
        className="loading-screen-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          animation: "scaleIn 0.4s ease-in-out",
        }}
      >
        {/* Coin Spinner */}
        <div
          className="coin-spinner-container"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: "1200px",
          }}
        >
          <div
            className={`coin-spinner ${paused ? "paused" : ""}`}
            style={{
              position: "relative",
              width: px,
              height: px,
              transformStyle: "preserve-3d",
              animation: paused ? "none" : "coinFlip 1.6s ease-in-out infinite",
            }}
          >
            {/* Coin shell */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Front face */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #ffffff, #f3f4f6)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <img
                  alt="GMIT Logo Front"
                  className="coin-logo"
                  src={imageFront}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "1rem",
                  }}
                />
              </div>

              {/* Back face */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #ffffff, #f3f4f6)",
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <img
                  alt="GMIT Logo Back"
                  className="coin-logo"
                  src={imageBack}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "1rem",
                  }}
                />
              </div>
            </div>

            {/* Outer glow ring */}
            <div
              className="outer-glow-ring"
              style={{
                position: "absolute",
                inset: "-8px",
                borderRadius: "50%",
                pointerEvents: "none",
                border: "2px solid rgba(59, 130, 246, 0.3)",
                animation: "rotateRing 3s linear infinite",
              }}
            />

            {/* Inner rim effect */}
            <div
              style={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                pointerEvents: "none",
                border: "1px solid rgba(203, 213, 225, 1)",
              }}
            />
          </div>
        </div>

        {/* Loading Message */}
        {message && (
          <div
            className="loading-message"
            style={{
              textAlign: "center",
              animation: "fadeInUp 0.4s ease-in-out 0.2s backwards",
            }}
          >
            <p
              style={{
                color: "white",
                fontWeight: 500,
                fontSize: "1.125rem",
                marginBottom: "0.5rem",
              }}
            >
              {message}
            </p>
            <div
              className="loading-dots"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
              }}
            >
              <span
                className="dot"
                style={{
                  display: "inline-block",
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  animation: "dotPulse 0.8s ease-in-out infinite",
                  animationDelay: "0s",
                }}
              />
              <span
                className="dot"
                style={{
                  display: "inline-block",
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  animation: "dotPulse 0.8s ease-in-out infinite",
                  animationDelay: "0.2s",
                }}
              />
              <span
                className="dot"
                style={{
                  display: "inline-block",
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  animation: "dotPulse 0.8s ease-in-out infinite",
                  animationDelay: "0.4s",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes coinFlip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        @keyframes rotateRing {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dotPulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .coin-spinner.paused {
          animation: none !important;
        }
      `}</style>
    </div>
  );

  // Render using portal at document.body level
  return typeof document !== "undefined"
    ? createPortal(loadingContent, document.body)
    : null;
}

LoadingScreen.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  message: PropTypes.string,
  imageFront: PropTypes.string,
  imageBack: PropTypes.string,
  paused: PropTypes.bool,
  isLoading: PropTypes.bool,
};
