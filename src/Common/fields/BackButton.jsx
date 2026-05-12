import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronsLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="p-1 rounded-lg md:block transition-all duration-300 hover:scale-110 cursor-pointer"
      style={{
        background: "var(--gradient-primary)",
      }}
    >
      <ChevronsLeft color="white" width={22} />
    </button>
  );
};

export default BackButton;
