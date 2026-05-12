const GradientLoader = ({ size = 32, className = "" }) => {
  const boxSize = size * 0.35;
  const gap = size * 0.08;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          display: "grid",
          gridTemplate: "1fr 1fr / 1fr 1fr",
          gap: `${gap}px`,
        }}
      >
        <div
          className="box-animate"
          style={{
            width: boxSize,
            height: boxSize,
            background: "var(--pink-soft)",
            borderRadius: "3px",
            animationDelay: "0s",
          }}
        />
        <div
          className="box-animate"
          style={{
            width: boxSize,
            height: boxSize,
            background: "var(--purple-soft)",
            borderRadius: "3px",
            animationDelay: "0.5s",
          }}
        />
        <div
          className="box-animate"
          style={{
            width: boxSize,
            height: boxSize,
            background: "var(--red-soft)",
            borderRadius: "3px",
            animationDelay: "1s",
          }}
        />
        <div
          className="box-animate"
          style={{
            width: boxSize,
            height: boxSize,
            background: "var(--gradient-primary)",
            borderRadius: "3px",
            animationDelay: "1.5s",
          }}
        />
      </div>

      <style>{`
        .box-animate {
          animation: boxShuffle 2s ease-in-out infinite;
        }

        @keyframes boxShuffle {
          0%,
          100% {
            transform: scale(1) translate(0, 0);
            opacity: 1;
          }
          25% {
            transform: scale(0.8) translate(8px, -8px);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1) translate(-8px, 8px);
            opacity: 0.9;
          }
          75% {
            transform: scale(0.9) translate(8px, 8px);
            opacity: 0.8;
          }
        }

        @media (max-width: 640px) {
          .box-animate {
            animation-duration: 2.5s;
          }
        }
      `}</style>
    </div>
  );
};

export default GradientLoader;
