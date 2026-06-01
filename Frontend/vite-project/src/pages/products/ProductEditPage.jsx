import { useParams } from "react-router-dom";
import ProductForm from "./ProductForm";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
import { PageLoader } from "@/components/shared/Loaders";

export default function ProductEditPage() {
  const { id } = useParams();
  const { data: product, isLoading, isError, error } = useProduct(id);
  const update = useUpdateProduct();

  if (isLoading) return <PageLoader label="Loading product…" />;
  if (isError || !product) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Product not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error?.message || "It may have been deleted."}</p>
      </div>
    );
  }

  return (
    <ProductForm
      title={`Edit “${product.name}”`}
      initialValues={product}
      onSubmit={(values, callbacks) =>
        update.mutate({ id, payload: values }, callbacks)
      }
      isSubmitting={update.isPending}
      error={update.error?.message}
    />
  );
}
