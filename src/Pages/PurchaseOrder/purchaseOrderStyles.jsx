// src/Pages/PurchaseOrder/purchaseOrderStyles.js
import { StyleSheet } from "@react-pdf/renderer";

const base = StyleSheet.create({
    page: {
        fontSize: 9,
        fontFamily: "Helvetica",
        padding: 30,
        color: "#000",
        backgroundColor: "#fff",
    },
    box1: {
        border: "0.5pt solid black",
        flexGrow: 1,
        flexDirection: "column",
    },
    row: {
        flexDirection: "row",
    },
    cell: {
        borderRight: "0.5pt solid black",
        borderBottom: "0.5pt solid black",
        padding: 4,
        fontSize: 9,
    },
    bold: {
        fontFamily: "Helvetica-Bold",
    },
    noBorderRight: {
        borderRight: 0,
    },
});

// styles.col(width) — function style, width as string e.g. "65%"
export const styles = {
    ...base,
    col: (width) => ({
        width,
        flexDirection: "column",
    }),
};