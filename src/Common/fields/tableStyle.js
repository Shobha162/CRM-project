export const tableStyle = {
  headRow: {
    style: {
      background: "var(--gradient-primary)",
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: "14px",
      minHeight: "45px",
      whiteSpace: "normal",
      wordBreak: "break-word",
    },
  },
  rows: {
    style: {
      borderBottomStyle: "solid",
      borderBottomWidth: "1px",
      borderBottomColor: "rgba(129, 140, 248, 0.15)",
      cursor: "pointer",
      color: "var(--text-secondary)",
      fontSize: "13px",
      minHeight: "50px",
    },
  },
  table: {
    style: {
      overflowX: "auto",
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
      border: "1px solid rgba(129, 140, 248, 0.15)",
      borderRadius: "8px",
    },
  },
  headCells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingTop: "12px",
      paddingBottom: "12px",
      fontSize: "14px",
      fontWeight: "700",
      color: "#ffffff",
    },
  },
  cells: {
    style: {
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingTop: "14px",
      paddingBottom: "14px",
      fontSize: "13px",
      color: "var(--text-primary)",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid rgba(129, 140, 248, 0.15)",
      minHeight: "56px",
      fontSize: "13px",
      color: "var(--text-secondary)",
    },
    pageButtonsStyle: {
      borderRadius: "6px",
      height: "32px",
      width: "32px",
      padding: "4px",
      margin: "0 4px",
      cursor: "pointer",
      color: "var(--text-secondary)",
      fill: "var(--text-secondary)",
      backgroundColor: "transparent",
      "&:hover:not(:disabled)": {
        backgroundColor: "rgba(244, 114, 182, 0.1)",
      },
      "&:focus": {
        outline: "none",
        backgroundColor: "rgba(129, 140, 248, 0.15)",
      },
    },
  },
};
