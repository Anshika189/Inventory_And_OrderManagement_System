import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Edit3, Package, Trash2 } from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/shared/Loaders";
import { StockBadge } from "@/components/shared/StatusBadges";
import { formatCurrency, formatDate, timeAgo } from "@/utils/format";
import { useDeleteProduct, useProduct } from "@/hooks/useProducts";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error } = useProduct(id);
  const deleteProduct = useDeleteProduct();
  const [confirm, setConfirm] = useState(false);

  if (isLoading) return <PageLoader label="Loading product…" />;
  if (isError || !product) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Product not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error?.message || "It may have been deleted."}</p>
        <Button className="mt-4" onClick={() => navigate("/products")}>Back to products</Button>
      </div>
    );
  }

  function handleDelete() {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success("Product deleted");
        navigate("/products");
      },
      onError: (err) => toast.error(err.message || "Couldn’t delete"),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title={product.name}
        description={product.sku}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate("/products")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)}>
              <Edit3 className="h-4 w-4" /> Edit
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
            <CardTitle>Overview</CardTitle>
            <CardDescription>Catalog information</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow label="Name" value={product.name} />
            <DetailRow label="SKU" value={product.sku} mono />
            <DetailRow label="Price" value={formatCurrency(product.price)} />
            <DetailRow
              label="Stock"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="font-semibold">{product.stock_quantity}</span>
                  <StockBadge quantity={product.stock_quantity} />
                </span>
              }
            />
            <DetailRow label="Created" value={`${formatDate(product.created_at)} · ${timeAgo(product.created_at)}`} />
            <DetailRow label="Updated" value={timeAgo(product.updated_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Quick actions
            </CardTitle>
            <CardDescription>Manage this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={() => navigate(`/products/${id}/edit`)}>
              <Edit3 className="h-4 w-4" /> Edit product
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to="/orders/new">Create order with this product</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        loading={deleteProduct.isPending}
        title="Delete this product?"
        description="This action cannot be undone. Orders referencing this product may prevent deletion."
        confirmLabel="Delete product"
      />
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
