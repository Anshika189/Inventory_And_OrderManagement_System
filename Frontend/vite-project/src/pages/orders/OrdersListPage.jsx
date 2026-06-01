import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR, EmptyTable } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/shared/Loaders";
import { OrderStatusBadge } from "@/components/shared/StatusBadges";
import { useDeleteOrder, useOrders } from "@/hooks/useOrders";
import { DEFAULT_PAGE_SIZE } from "@/config";
import { formatCurrency, timeAgo } from "@/utils/format";
import { useDebounce } from "@/hooks/useDebounce";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const STATUS_FILTERS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function OrdersListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data, isLoading, isFetching } = useOrders({
    page,
    size: DEFAULT_PAGE_SIZE,
    status: status === "all" ? undefined : status,
  });
  const deleteOrder = useDeleteOrder();

  let items = data?.items || [];
  if (debounced) {
    const q = debounced.toLowerCase();
    items = items.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.customer_name || "").toLowerCase().includes(q)
    );
  }
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  function handleDelete() {
    if (!pendingDelete) return;
    deleteOrder.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success("Order deleted");
        setPendingDelete(null);
      },
      onError: (err) => toast.error(err.message || "Couldn’t delete order"),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        description="Track every order from creation to delivery."
        actions={
          <Button onClick={() => navigate("/orders/new")}>
            <Plus className="h-4 w-4" /> New order
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer or order id…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setPage(1);
                  setStatus(s);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  status === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Table>
            <TBody>
              <TableSkeleton rows={6} cols={6} />
            </TBody>
          </Table>
        ) : items.length === 0 ? (
          <EmptyTable
            icon={ShoppingCart}
            title="No orders yet"
            description="Create your first order to see it appear here."
            action={
              <Button onClick={() => navigate("/orders/new")} className="mt-2">
                <Plus className="h-4 w-4" /> New order
              </Button>
            }
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH>Status</TH>
                  <TH>Items</TH>
                  <TH>Total</TH>
                  <TH>Created</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody className={isFetching ? "opacity-60" : ""}>
                {items.map((o) => (
                  <TR key={o.id}>
                    <TD>
                      <Link
                        to={`/orders/${o.id}`}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground"
                      >
                        #{o.id.slice(0, 8)}
                      </Link>
                      <p className="text-xs text-muted-foreground">{timeAgo(o.created_at)}</p>
                    </TD>
                    <TD className="text-sm font-medium">{o.customer_name || "—"}</TD>
                    <TD>
                      <OrderStatusBadge status={o.status} />
                    </TD>
                    <TD className="text-sm">{o.items_count}</TD>
                    <TD className="text-sm font-semibold">{formatCurrency(o.total_amount)}</TD>
                    <TD className="text-xs text-muted-foreground">{timeAgo(o.created_at)}</TD>
                    <TD>
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setPendingDelete(o)}
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </motion.div>
        )}

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            {items.length} of {total} {total === 1 ? "order" : "orders"}
          </span>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleteOrder.isPending}
        title="Delete this order?"
        description={
          pendingDelete
            ? `Order #${pendingDelete.id.slice(0, 8)} will be removed. Stock will not be automatically restored.`
            : ""
        }
        confirmLabel="Delete order"
      />
    </div>
  );
}
