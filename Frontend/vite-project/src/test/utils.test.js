import { describe, expect, it } from "vitest";
import { cn } from "@/utils/cn";
import { formatCurrency, initials } from "@/utils/format";
import { stockStatus } from "@/utils/stock";

describe("cn", () => {
  it("merges classes and resolves conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", false && "text-blue-500", "text-green-500")).toBe("text-green-500");
  });
});

describe("formatCurrency", () => {
  it("formats USD", () => {
    expect(formatCurrency(10)).toBe("$10.00");
  });
  it("handles null", () => {
    expect(formatCurrency(null)).toBe("—");
  });
});

describe("initials", () => {
  it("returns first letters", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
  });
  it("handles single name", () => {
    expect(initials("Cher")).toBe("C");
  });
  it("returns empty for empty input", () => {
    expect(initials("")).toBe("");
  });
});

describe("stockStatus", () => {
  it("classifies 0 as out", () => {
    expect(stockStatus(0)).toBe("out");
  });
  it("classifies low stock", () => {
    expect(stockStatus(5)).toBe("critical");
  });
  it("classifies healthy", () => {
    expect(stockStatus(50)).toBe("healthy");
  });
});
