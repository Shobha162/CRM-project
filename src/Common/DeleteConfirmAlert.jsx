import Swal from "sweetalert2";

const DeleteConfirmAlert = async ({
  title = "Are you sure?",
  text = "You won't be able to revert this!",
  confirmButtonText = "Yes, delete it!",
  cancelButtonText = "Cancel",
  icon = "warning",
}) => {
  const root = getComputedStyle(document.documentElement);
  const pinkSoft = root.getPropertyValue("--pink-soft").trim();
  const purpleSoft = root.getPropertyValue("--purple-soft").trim();
  const redSoft = root.getPropertyValue("--red-soft").trim();
  const textPrimary = root.getPropertyValue("--text-primary").trim();

  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    background: "#e0f2fe",
    color: textPrimary,
    iconColor: pinkSoft,
    customClass: {
      popup: "swal2-rounded",
      confirmButton: "swal2-gradient-confirm",
      cancelButton: "swal2-gradient-cancel",
    },
    buttonsStyling: false,
    didOpen: () => {
      const confirmBtn = document.querySelector(".swal2-gradient-confirm");
      const cancelBtn = document.querySelector(".swal2-gradient-cancel");

      if (confirmBtn) {
        confirmBtn.style.background = `linear-gradient(135deg, ${redSoft}, ${pinkSoft})`;
        confirmBtn.style.color = "#ffffff";
        confirmBtn.style.padding = "10px 24px";
        confirmBtn.style.borderRadius = "8px";
        confirmBtn.style.fontWeight = "600";
        confirmBtn.style.fontSize = "14px";
        confirmBtn.style.border = "none";
        confirmBtn.style.cursor = "pointer";
        confirmBtn.style.boxShadow = `0 2px 8px ${redSoft}40`;
        confirmBtn.style.transition = "all 0.3s";

        confirmBtn.onmouseenter = () => {
          confirmBtn.style.boxShadow = `0 4px 12px ${redSoft}60`;
        };
        confirmBtn.onmouseleave = () => {
          confirmBtn.style.boxShadow = `0 2px 8px ${redSoft}40`;
        };
      }

      if (cancelBtn) {
        cancelBtn.style.background = `linear-gradient(135deg, ${pinkSoft}, ${purpleSoft})`;
        cancelBtn.style.color = "#ffffff";
        cancelBtn.style.padding = "10px 24px";
        cancelBtn.style.borderRadius = "8px";
        cancelBtn.style.fontWeight = "600";
        cancelBtn.style.fontSize = "14px";
        cancelBtn.style.border = "none";
        cancelBtn.style.cursor = "pointer";
        cancelBtn.style.boxShadow = `0 2px 8px ${purpleSoft}40`;
        cancelBtn.style.transition = "all 0.3s";
        cancelBtn.style.marginLeft = "12px";

        cancelBtn.onmouseenter = () => {
          cancelBtn.style.boxShadow = `0 4px 12px ${purpleSoft}60`;
        };
        cancelBtn.onmouseleave = () => {
          cancelBtn.style.boxShadow = `0 2px 8px ${purpleSoft}40`;
        };
      }
    },
  });

  return result.isConfirmed;
};

export default DeleteConfirmAlert;
