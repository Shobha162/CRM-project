export const formatCurrency = (num) =>
  Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const getPlaceOfSupply = (billToText) => {
  if (!billToText || typeof billToText !== "string") return "-";

  const cleanText = billToText.replace(/\s+/g, " ").trim();

  const gstinMatch = cleanText.match(
    /([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[A-Z]{1}[0-9A-Z]{1})/i,
  );

  if (gstinMatch) {
    const stateCode = gstinMatch[1].substring(0, 2);
    const stateMap = {
      "01": "01-Jammu & Kashmir",
      "02": "02-Himachal Pradesh",
      "03": "03-Punjab",
      "04": "04-Chandigarh",
      "05": "05-Uttarakhand",
      "06": "06-Haryana",
      "07": "07-Delhi",
      "08": "08-Rajasthan",
      "09": "09-Uttar Pradesh",
      10: "10-Bihar",
      11: "11-Sikkim",
      12: "12-Arunachal Pradesh",
      13: "13-Nagaland",
      14: "14-Manipur",
      15: "15-Mizoram",
      16: "16-Tripura",
      17: "17-Meghalaya",
      18: "18-Assam",
      19: "19-West Bengal",
      20: "20-Jharkhand",
      21: "21-Odisha",
      22: "22-Chhattisgarh",
      23: "23-Madhya Pradesh",
      24: "24-Gujarat",
      25: "25-Daman & Diu",
      26: "26-Dadra & Nagar Haveli",
      27: "27-Maharashtra",
      29: "29-Karnataka",
      30: "30-Goa",
      31: "31-Lakshadweep",
      32: "32-Kerala",
      33: "33-Tamil Nadu",
      34: "34-Puducherry",
      36: "36-Telangana",
      37: "37-Andhra Pradesh",
    };
    return stateMap[stateCode] || `${stateCode}-State`;
  }
  return "-";
};

export const stripHTML = (html) => html?.replace(/<[^>]*>/g, "") || "-";

export const convertToIndianWords = (num) => {
  const number = Math.floor(Math.abs(Number(num) || 0));

  if (number === 0) return "Zero";

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertChunk = (n) => {
    if (n === 0) return "";
    let result = "";

    if (n >= 100000) {
      result += convertChunk(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }
    if (n >= 1000) {
      result += convertChunk(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }
    if (n >= 100) {
      result += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + " ";
      return result.trim();
    }
    if (n > 0) result += units[n] + " ";
    return result.trim();
  };

  return convertChunk(number);
};

// ✅ FIXED - inter = 18% (IGST), intra = 18% total (9%+9%)
export const getGstRate = (taxType) => 18;

export const generateHsnTaxData = (inv) => {
  const hsnMap = {};
  const gstRate = getGstRate(inv.taxType); // always 18

  inv.products.forEach((item) => {
    const hsn = item.hsn || "MISC";
    const qty = Number(item.qty || 0);
    const rate = Number(item.rate || 0);
    const taxableAmount = rate * qty;
    const igstAmount = (taxableAmount * gstRate) / 100;
    const totalTax = igstAmount;

    if (!hsnMap[hsn]) {
      hsnMap[hsn] = {
        taxableAmount: 0,
        igstRate: gstRate,
        igstAmount: 0,
        totalTax: 0,
      };
    }
    hsnMap[hsn].taxableAmount += taxableAmount;
    hsnMap[hsn].igstAmount += igstAmount;
    hsnMap[hsn].totalTax += totalTax;
  });

  return Object.entries(hsnMap).map(([hsnSac, data]) => ({
    hsnSac,
    taxableAmount: data.taxableAmount,
    igstRate: data.igstRate,
    igstAmount: data.igstAmount,
    totalTax: data.totalTax,
  }));
};
