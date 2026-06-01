import { stockStatus, stockTone, orderStatusTone } from "@/utils/stock";
import { Badge } from "@/components/ui/Badge";

export function StockBadge({ quantity, threshold = 10 }) {
  const status = stockStatus(quantity, threshold);
  const tone = stockTone[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone.bg} ${tone.border} ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {tone.label}
    </span>
  );
}

export function OrderStatusBadge({ status }) {
  const tone = orderStatusTone[status] || orderStatusTone.pending;
  return (
    <Badge variant="default" className={`${tone.bg} ${tone.text} ${tone.border} border`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {tone.label}
    </Badge>
  );
}
