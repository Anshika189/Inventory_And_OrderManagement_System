import { cn } from "@/utils/cn";
import { initials } from "@/utils/format";

const palette = [
  "from-indigo-500 to-fuchsia-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-rose-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-purple-500",
];

function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function Avatar({ name = "", size = "md", className }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  const tone = palette[hash(name) % palette.length];
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white bg-gradient-to-br shadow-soft",
        tone,
        sizes[size],
        className
      )}
      aria-hidden
    >
      {initials(name) || "?"}
    </div>
  );
}
