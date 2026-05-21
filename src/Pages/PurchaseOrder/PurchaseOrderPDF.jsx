import React from "react";
import { Page, Text, View, Document } from "@react-pdf/renderer";
import { styles } from "./purchaseOrderStyles";
import { getPlaceOfSupply, stripHTML } from "../../utils/challanHelper";

const PurchaseOrderDocument = ({ pi }) => {
  const isInter = pi?.gstType === "inter";

  const decodeEntities = (html) => {
    return html
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  const renderFormattedDescription = (html) => {
    if (!html) return null;
    const output = [];
    let index = 0;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const walk = (node, parentStyle = {}) => {
      const elements = [];
      if (node.nodeType === 3) {
        const text = node.nodeValue;
        if (text.trim()) {
          elements.push(
            <Text key={`text-${index++}`} style={parentStyle}>
              {decodeEntities(text)}
            </Text>,
          );
        }
      } else if (node.nodeType === 1) {
        const tag = node.nodeName.toLowerCase();
        let style = { ...parentStyle };
        if (tag === "strong" || tag === "b") style.fontWeight = "bold";
        if (tag === "em" || tag === "i") style.fontStyle = "italic";
        if (tag === "u") style.textDecoration = "underline";
        if (tag === "br") {
          elements.push(<Text key={`br-${index++}`}>{"\n"}</Text>);
          return elements;
        }
        if (tag === "p" || tag === "div") {
          const children = [];
          node.childNodes.forEach((child) =>
            children.push(...walk(child, style)),
          );
          elements.push(
            <Text key={`p-${index++}`} style={{ marginBottom: 4, ...style }}>
              {children}
            </Text>,
          );
          return elements;
        }
        if (tag === "ul" || tag === "ol") {
          const isOrdered = tag === "ol";
          let counter = 1;
          Array.from(node.children).forEach((li) => {
            if (li.nodeName.toLowerCase() === "li") {
              const liChildren = walk(li, style);
              const prefix = isOrdered ? `${counter++}. ` : "• ";
              elements.push(
                <Text
                  key={`li-${index++}`}
                  style={{ marginLeft: 10, ...style }}
                >
                  {prefix}
                  {liChildren}
                </Text>,
              );
            }
          });
          return elements;
        }
        if (tag === "li") {
          const children = [];
          node.childNodes.forEach((child) =>
            children.push(...walk(child, style)),
          );
          elements.push(
            <Text key={`li-${index++}`} style={{ marginLeft: 10, ...style }}>
              {children}
            </Text>,
          );
          return elements;
        }
        node.childNodes.forEach((child) =>
          elements.push(...walk(child, style)),
        );
      }
      return elements;
    };

    doc.body.childNodes.forEach((node) => output.push(...walk(node)));
    return output;
  };

  const renderPlainText = (html) => {
    if (!html) return "-";
    return stripHTML(String(html));
  };

  const subTotal = (pi?.products || []).reduce((acc, p) => {
    return acc + Number(p.qty || 1) * Number(p.rate || 0);
  }, 0);

  const totalGst = (pi?.products || []).reduce((acc, p) => {
    const qty = Number(p.qty || 1);
    const rate = Number(p.rate || 0);
    const taxPercent = Number(p.taxPercentage || 0);
    return acc + (qty * rate * taxPercent) / 100;
  }, 0);

  const totalBeforeRound = subTotal + totalGst;
  const roundedTotal = Math.round(totalBeforeRound);
  const roundOff = (roundedTotal - totalBeforeRound).toFixed(2);

  const gstRateGroups = {};
  (pi?.products || []).forEach((p) => {
    const qty = Number(p.qty || 1);
    const rate = Number(p.rate || 0);
    const taxPercent = Number(p.taxPercentage || 0);
    const gstAmt = (qty * rate * taxPercent) / 100;
    if (!gstRateGroups[taxPercent]) {
      gstRateGroups[taxPercent] = { rate: taxPercent, amount: 0 };
    }
    gstRateGroups[taxPercent].amount += gstAmt;
  });
  const gstRateSummary = Object.values(gstRateGroups).sort(
    (a, b) => a.rate - b.rate,
  );

  const convertToIndianWords = (num) => {
    const number = Math.floor(Math.abs(Number(num) || 0));
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertChunk = (n) => {
      if (n === 0) return "";
      let result = "";
      if (n >= 10000000) { result += convertChunk(Math.floor(n / 10000000)) + " Crore "; n %= 10000000; }
      if (n >= 100000)   { result += convertChunk(Math.floor(n / 100000))   + " Lakh ";  n %= 100000;   }
      if (n >= 1000)     { result += convertChunk(Math.floor(n / 1000))     + " Thousand "; n %= 1000;  }
      if (n >= 100)      { result += units[Math.floor(n / 100)] + " Hundred "; n %= 100; }
      if (n >= 20)       { result += tens[Math.floor(n / 10)] + " "; n %= 10; }
      else if (n >= 10)  { result += teens[n - 10] + " "; return result.trim(); }
      if (n > 0)           result += units[n] + " ";
      return result.trim();
    };

    return convertChunk(number);
  };

  const totalInWords = `Rupees ${convertToIndianWords(roundedTotal)} Only`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const dateObj = new Date(dateStr);
    const day   = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year  = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Page size="A4" style={styles.page}>
      <Text
        style={{ fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 4 }}
      >
        Purchase Order
      </Text>

      <View style={styles.box1}>
        {/* ── Header Section ───────────────────────────────── */}
        <View style={styles.row}>
          <View style={styles.col("65%")}>
            {/* Seller Info */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                borderBottom: "0.5pt solid black",
                padding: 4,
              }}
            >
              <View style={{ width: 150, height: 100, marginRight: 8 }}>
                <Image
                  src={img1}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </View>
              <View style={{ flex: 1, fontSize: 10 }}>
                <Text>Invoice To</Text>
                <Text style={styles.bold}>Crystal Ion Engineers</Text>
                <Text>Plot No.-138</Text>
                <Text>Sector-3</Text>
                <Text>Ballabhgarh, Faridabad</Text>
                <Text>Haryana</Text>
                <Text>GSTIN/UIN : 06AAHPJ5618GIZT</Text>
                <Text>India - 121004</Text>
                <Text>Contact: 9810092138</Text>
                <Text>Email: crystalioneng@hotmail.com</Text>
                <Text>www.crystalionengineers.com</Text>
              </View>
            </View>

            {/* Ship To */}
            <View style={{ borderBottom: "0.5pt solid black", padding: 4 }}>
              <Text>Consignee (Ship to)</Text>
              {renderFormattedDescription(pi?.supplier?.shipTo)}
            </View>

            {/* Bill To */}
            <View style={{ padding: 4 }}>
              <Text>Supplier (Bill from)</Text>
              {renderFormattedDescription(pi?.supplier?.billTo)}
              {pi?.gstNumber && (
                <Text style={{ marginTop: 4 }}>GST Number: {pi.gstNumber}</Text>
              )}
            </View>
          </View>

          {/* Invoice Info — Right Column */}
          <View style={[styles.col("35%"), { borderLeft: "0.5pt solid black", padding: 0 }]}>
            {[
              ["PO-No",                   pi?.voucherNo || "-"],
              ["Dated",                   formatDate(pi?.date) || "-"],
              ["Mode/Terms of Payment",   pi?.paymentMethod || "-"],
              ["Dispatched through",      pi?.dispatchedThrough || "-"],
              ...(getPlaceOfSupply(
                renderPlainText(pi?.supplier?.shipTo) ||
                renderPlainText(pi?.supplier?.billTo),
              )?.trim()
                ? [["Place of Supply", getPlaceOfSupply(
                    renderPlainText(pi?.supplier?.shipTo) ||
                    renderPlainText(pi?.supplier?.billTo),
                  )]]
                : []),
            ].map(([label, value], i) => (
              <View key={i} style={styles.row}>
                <View style={[styles.cell, { width: "50%", fontSize: 9 }]}>
                  <Text style={styles.bold}>{label}</Text>
                </View>
                <View style={[styles.cell, { width: "50%" }, styles.noBorderRight]}>
                  <Text>{value}</Text>
                </View>
              </View>
            ))}

            {/* Terms of Delivery */}
            <View style={{ flexDirection: "column" }}>
              <Text style={[styles.cell, { width: "100%", fontSize: 9, borderRight: 0 }]}>
                <Text style={styles.bold}>Terms of Delivery</Text>
              </Text>
              <View style={[styles.cell, { width: "100%", fontSize: 9 }, styles.noBorderRight]}>
                {renderFormattedDescription(pi?.termsOfDelivery)}
              </View>
            </View>
          </View>
        </View>

        {/* ── Product Table ─────────────────────────────────── */}
        <View
          style={{
            borderTop: "0.5pt solid black",
            justifyContent: "space-between",
            flexGrow: 1,
            flexDirection: "column",
          }}
        >
          {/* Table Header */}
          <View style={styles.row} wrap={false}>
            <Text style={[styles.cell, { width: "4%"  }, styles.bold]}>S.n</Text>
            <Text style={[styles.cell, { width: "40%" }, styles.bold]}>Description of Goods</Text>
            <Text style={[styles.cell, { width: "11%" }, styles.bold]}>Qty</Text>
            <Text style={[styles.cell, { width: "12%" }, styles.bold]}>Rate</Text>
            <Text style={[styles.cell, { width: "14%" }, styles.bold]}>
              {isInter ? "IGST" : "CGST+SGST"}
            </Text>
            <Text style={[styles.cell, { width: "8%"  }, styles.bold]}>Per</Text>
            <Text style={[styles.cell, { width: "11%" }, styles.bold, styles.noBorderRight]}>Amount</Text>
          </View>

          {/* Product Rows */}
          {pi?.products?.map((product, index) => {
            const qty        = Number(product.qty || 1);
            const rate       = Number(product.rate || 0);
            const taxPercent = Number(product.taxPercentage || 0);
            const halfRate   = taxPercent / 2;
            const amount     = qty * rate;
            const productGst = (amount * taxPercent) / 100;

            return (
              <View style={styles.row} key={index} wrap={false}>
                <Text style={[styles.cell, { width: "4%"  }]}>{index + 1}</Text>
                <View style={[styles.cell, { width: "40%" }]}>
                  {renderFormattedDescription(product.description)}
                </View>
                <Text style={[styles.cell, { width: "11%" }]}>{qty.toFixed(2)}</Text>
                <Text style={[styles.cell, { width: "12%" }]}>{rate.toFixed(2)}</Text>
                <Text style={[styles.cell, { width: "14%" }]}>
                  {productGst.toFixed(2)}
                  {isInter ? `(${taxPercent}%)` : `(${halfRate}%+${halfRate}%)`}
                </Text>
                <Text style={[styles.cell, { width: "8%"  }]}>{product.uom || "Each"}</Text>
                <Text style={[styles.cell, { width: "11%" }, styles.noBorderRight]}>
                  {amount.toFixed(2)}
                </Text>
              </View>
            );
          })}

          {/* Spacer */}
          <View style={[styles.row, { flexGrow: 1 }]} wrap={false}>
            {["4%", "40%", "11%", "12%", "14%", "8%"].map((w, i) => (
              <Text key={i} style={[styles.cell, { width: w, borderBottom: 0, alignSelf: "stretch" }]} />
            ))}
            <Text style={[styles.cell, { width: "11%", borderBottom: 0, alignSelf: "stretch" }, styles.noBorderRight]} />
          </View>

          {/* Subtotal */}
          <View style={[styles.row, { borderTop: "0.5pt solid black" }]} wrap={false}>
            <Text style={[styles.cell, { width: "89%" }]}>Sub Total</Text>
            <Text style={[styles.cell, { width: "11%" }, styles.noBorderRight]}>{subTotal.toFixed(2)}</Text>
          </View>

          {/* GST rows */}
          {isInter
            ? gstRateSummary.map((g, i) => (
                <View style={styles.row} key={i} wrap={false}>
                  <Text style={[styles.cell, { width: "89%" }]}>IGST @ {g.rate}%</Text>
                  <Text style={[styles.cell, { width: "11%" }, styles.noBorderRight]}>{g.amount.toFixed(2)}</Text>
                </View>
              ))
            : gstRateSummary.map((g, i) => (
                <React.Fragment key={i}>
                  <View style={styles.row} wrap={false}>
                    <Text style={[styles.cell, { width: "89%" }]}>CGST @ {(g.rate / 2).toFixed(1)}%</Text>
                    <Text style={[styles.cell, { width: "11%" }, styles.noBorderRight]}>{(g.amount / 2).toFixed(2)}</Text>
                  </View>
                  <View style={styles.row} wrap={false}>
                    <Text style={[styles.cell, { width: "89%" }]}>SGST @ {(g.rate / 2).toFixed(1)}%</Text>
                    <Text style={[styles.cell, { width: "11%" }, styles.noBorderRight]}>{(g.amount / 2).toFixed(2)}</Text>
                  </View>
                </React.Fragment>
              ))}

          {/* Total before round */}
          <View style={styles.row} wrap={false}>
            <Text style={[styles.cell, { width: "89%" }, styles.bold]}>Total</Text>
            <Text style={[styles.cell, { width: "11%" }, styles.bold, styles.noBorderRight]}>{totalBeforeRound.toFixed(2)}</Text>
          </View>

          {/* Round Off */}
          <View style={styles.row} wrap={false}>
            <Text style={[styles.cell, { width: "89%" }]}>Round Off</Text>
            <Text style={[styles.cell, { width: "11%" }, styles.noBorderRight]}>
              {Number(roundOff) >= 0 ? `+${roundOff}` : roundOff}
            </Text>
          </View>

          {/* Grand Total */}
          <View style={styles.row} wrap={false}>
            <Text style={[styles.cell, { width: "89%" }, styles.bold]}>Total :</Text>
            <Text style={[styles.cell, { width: "11%" }, styles.bold, styles.noBorderRight]}>{roundedTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* ── Amount in Words ───────────────────────────────── */}
        <View style={{ marginTop: 4, marginLeft: 4 }}>
          <Text>Amount Chargeable (in words):</Text>
          <Text style={styles.bold}>{totalInWords}</Text>
        </View>

        {/* ── Declaration & Signature (no stamp) ───────────── */}
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            borderTop: "0.5pt solid black",
            paddingTop: 6,
          }}
        >
          {/* Declaration */}
          <View style={{ width: "60%" }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", marginLeft: 4 }}>
              Declaration
            </Text>
            <Text style={{ fontSize: 9, marginLeft: 4 }}>
              We declare that this invoice shows the actual price of the goods
              described and that all particulars are true and correct.
            </Text>
          </View>

          {/* Authorised Signatory */}
          <View
            style={{
              width: "40%",
              borderLeft: "0.5pt solid black",
              paddingLeft: 6,
              paddingRight: 10,
              paddingBottom: 6,
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            {/* Signature line */}
            <View
              style={{
                borderTop: "0.5pt solid black",
                width: "80%",
                marginBottom: 4,
              }}
            />
            <Text style={[styles.bold, { fontSize: 9, textAlign: "right" }]}>
              for Crystal Ion Engineers
            </Text>
            <Text style={{ fontSize: 8, color: "#555", textAlign: "right" }}>
              Authorised Signatory
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
};

const PurchaseOrder = ({ pi }) => (
  <Document>
    <PurchaseOrderDocument pi={pi} />
  </Document>
);

export default PurchaseOrder;