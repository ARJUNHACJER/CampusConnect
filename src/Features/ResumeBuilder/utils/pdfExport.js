// Client-side PDF export using html2pdf.js (bundles html2canvas + jsPDF).
// Install once in the CampusConnect project:
//   npm install html2pdf.js
import html2pdf from "html2pdf.js";

export async function downloadResumePdf(node, filename = "resume.pdf") {
  if (!node) return;
  const opt = {
    margin: 0,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    pagebreak: { mode: ["css", "legacy"] },
    jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
  };
  await html2pdf().set(opt).from(node).save();
}

export function printResumeNode(node) {
  if (!node) return;
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Resume</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; }
        </style>
      </head>
      <body>${node.outerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}
