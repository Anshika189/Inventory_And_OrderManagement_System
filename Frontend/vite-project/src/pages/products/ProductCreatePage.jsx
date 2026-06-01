import ProductForm from "./ProductForm";
import { useCreateProduct } from "@/hooks/useProducts";

export default function ProductCreatePage() {
  const create = useCreateProduct();
  return (
    <ProductForm
      title="Add a new product"
      onSubmit={(values, callbacks) =>
        create.mutate(values, callbacks)
      }
      isSubmitting={create.isPending}
      error={create.error?.message}
    />
  );
}
