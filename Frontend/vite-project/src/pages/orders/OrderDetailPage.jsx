import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { PageLoader } from "@/components/shared/Loaders";
import { OrderStatusBadge } from "@/components/shared/StatusBadges";
import { useDeleteOrder, useOrder } from "@/hooks/useOrders";
import { formatCurrency, formatDateTime, timeAgo } from "@/utils/format";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, isError, error } = useOrder(id);
  const deleteOrder = useDeleteOrder();
  const [confirm, setConfirm] = useState(false);

  if (isLoading) return <PageLoader label="Loading order…" />;
  if (isError || !order) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Order not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error?.message || "It may have been deleted."}</p>
        <Button className="mt-4" onClick={() => navigate("/orders")}>Back to orders</Button>
      </div>
    );
  }

  function handleDelete() {
    deleteOrder.mutate(id, {
      onSuccess: () => {
        toast.success("Order deleted");
        navigate("/orders");
      },
      onError: (err) => toast.error(err.message || "Couldn’t delete"),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Order #${order.id.slice(0, 8)}`}
        title="Order details"
        description={`Placed ${timeAgo(order.created_at)}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate("/orders")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="destructive" onClick={() => setConfirm(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" /> Items
            </CardTitle>
            <CardDescription>{order.items?.length || 0} line items</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH>SKU</TH>
                  <TH>Quantity</TH>
                  <TH>Unit price</TH>
                  <TH className="text-right">Line total</TH>
                </TR>
              </THead>
              <TBody>
                {(order.items || []).map((it) => (
                  <TR key={it.id}>
                    <TD>
                      <p className="text-sm font-medium">{it.product_name || "—"}</p>
                    </TD>
                    <TD className="font-mono text-xs text-muted-foreground">
                      {it.product_sku || "—"}
                    </TD>
                    <TD>{it.quantity}</TD>
                    <TD>{formatCurrency(it.unit_price)}</TD>
                    <TD className="text-right font-semibold">
                      {formatCurrency(it.line_total)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <div className="mt-4 flex items-center justify-end">
              <div className="w-full max-w-xs space-y-2 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>{order.items?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold gradient-text">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <OrderStatusBadge status={order.status} />
              <p className="text-xs text-muted-foreground">
                Created {formatDateTime(order.created_at)}
              </p>
              <p className="text-xs text-muted-foreground">
                Updated {timeAgo(order.updated_at)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar name={order.customer_name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {order.customer_name || "—"}
                  </p>
                  {order.customer_email && (
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {order.customer_email}
                    </p>
                  )}
                </div>
              </div>
              <Link
                to="/orders/new"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Place another order
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        loading={deleteOrder.isPending}
        title="Delete this order?"
        description={`Order #${order.id.slice(0, 8)} will be removed. Stock will not be automatically restored.`}
        confirmLabel="Delete order"
      />
    </div>
  );
}
