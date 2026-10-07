import test from "node:test";
import assert from "node:assert/strict";
import { cleanExtractedText } from "./textCleanup.js";

test("PDF artifacts are removed while genuine question marks survive", () => {
  assert.equal(cleanExtractedText("React\u0000 \ufffd ?? web?developer\nWhy?"), "React web developer Why?");
  assert.equal(cleanExtractedText(null), "");
});
