import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies success variant classes", () => {
    render(<Badge variant="success">Active</Badge>);
    const el = screen.getByText("Active");
    expect(el.className).toMatch(/emerald/);
  });
});
