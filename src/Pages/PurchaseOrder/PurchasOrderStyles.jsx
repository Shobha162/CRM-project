  import { StyleSheet } from "@react-pdf/renderer";

  export const styles = StyleSheet.create({
    page: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      fontSize: 10,
      fontFamily: "Helvetica",
      lineHeight: 1.2,
    },
    bold: {
      fontWeight: "bold",
    },
    section: {
      marginBottom: 4,
    },
    row: {
      flexDirection: "row",
      width: "100%",
    },
    col: (w) => ({
      width: w,
      padding: 1,
    }),
    box: {
      border: "0.5pt solid black",
      padding: 1,
    },
    box1: {
      flexGrow: 1,
      flexDirection: "column",
      border: "1pt solid black",
    },
    right: {
      textAlign: "right",
    },
    center: {
      textAlign: "center",
    },
    cell: {
      padding: 3,
      borderRight: "0.5pt solid black",
      borderBottom: "0.5pt solid black",
    },
    cell2: {
      padding: 3,
      paddingRight: 0,
      borderRight: "0.5pt solid black",
      borderBottom: "0.5pt solid black",
    },
    noBorderRight: {
      borderRight: 0,
    },
    underlineBox: {
      borderTop: "0.5pt solid black",
      marginTop: 2,
    },
  });
