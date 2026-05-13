import { Trash2 } from "lucide-react";

// ✅ HTML tags aur entities dono clean karne ka helper
const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/<[^>]*>?/gm, "")   // HTML tags hatao
    .replace(/&nbsp;/g, " ")      // &nbsp; → space
    .replace(/&amp;/g, "&")       // &amp; → &
    .replace(/&lt;/g, "<")        // &lt; → <
    .replace(/&gt;/g, ">")        // &gt; → >
    .replace(/&quot;/g, '"')      // &quot; → "
    .replace(/&#39;/g, "'")       // &#39; → '
    .trim();
};

export const getSupplierColumns = (handleDeleteClick, role) => {
  const columns = [
    {
      name: "Name of the Party",
      selector: (row) =>
        Array.isArray(row.names)
          ? row.names.filter(Boolean).join(", ")
          : row.nameOfParty || "-",
      sortable: true,
      grow: 2,
    },
    {
      name: "Phone No",
      selector: (row) =>
        Array.isArray(row.phones)
          ? row.phones.filter(Boolean).join(", ")
          : row.phoneNo || "-",
      grow: 2,
    },
    {
      name: "Address",
      // ✅ FIXED: cleanText se &nbsp; aur baaki HTML entities bhi handle hongi
      selector: (row) =>
        Array.isArray(row.addresses)
          ? row.addresses
              .map((a) => cleanText(a.address))
              .filter(Boolean)
              .join(", ")
          : "-",
      grow: 2,
    },
  ];

  if (role === "superAdmin") {
    columns.push({
      name: "Actions",
      cell: (row) =>
        row && row._id ? (
          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
              className="p-2 rounded-full border border-red-400 text-red-500 hover:bg-red-400 hover:text-white transition duration-150 ease-in-out"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          "-"
        ),
      ignoreRowClick: true,
    });
  }

  return columns;
};