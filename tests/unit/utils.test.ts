import { describe, it, expect } from "vitest";
import { cn, formatPersen, formatNilai, formatWaktu } from "@/lib/utils";

describe("Utility functions", () => {
  it("cn merges class names properly", () => {
    expect(cn("px-2 py-1", "bg-white", { "text-red-500": true, "text-blue-500": false })).toBe(
      "px-2 py-1 bg-white text-red-500"
    );
  });

  it("formatPersen formats numbers to Indonesian percent string", () => {
    expect(formatPersen(85.5)).toBe("85,5%");
    expect(formatPersen(100)).toBe("100,0%");
    expect(formatPersen(null)).toBe("0%");
    expect(formatPersen(undefined)).toBe("0%");
  });

  it("formatNilai formats score numbers cleanly", () => {
    expect(formatNilai(90)).toBe("90");
    expect(formatNilai(82.5)).toBe("82,5");
    expect(formatNilai(null)).toBe("-");
  });

  it("formatWaktu extracts HH:mm properly", () => {
    expect(formatWaktu("07:30:00")).toBe("07:30");
    expect(formatWaktu("12:00")).toBe("12:00");
    expect(formatWaktu(null)).toBe("-");
  });
});
