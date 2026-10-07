import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { cleanExtractedText } from "./textCleanup.js";

GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractPdfText(fileOrBlob) {
  const data = await fileOrBlob.arrayBuffer();
  const task = getDocument({ data });
  try {
    const pdf = await task.promise;
    const pages = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      try {
        const content = await page.getTextContent();
        pages.push(content.items.map((item) =>
          "str" in item ? `${item.str}${item.hasEOL ? "\n" : " "}` : ""
        ).join(""));
      } finally {
        page.cleanup();
      }
    }
    return cleanExtractedText(pages.join("\n\n"));
  } finally {
    await task.destroy();
  }
}
