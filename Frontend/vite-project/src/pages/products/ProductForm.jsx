import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError, FieldDescription } from "@/components/ui/Input";
import { Spinner } from "@/components/shared/Loaders";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(64)
    .transform((v) => v.toUpperCase()),
  price: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n > 0, "Price must be greater than 0"),
  stock_quantity: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n >= 0, "Stock must be 0 or more"),
});

export default function ProductForm({ title, initialValues, onSubmit, isSubmitting, error }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialValues?.name || "",
      sku: initialValues?.sku || "",
      price: initialValues?.price ?? "",
      stock_quantity: initialValues?.stock_quantity ?? "",
    },
  });

  function submit(values) {
    onSubmit(values, {
      onSuccess: (data) => {
        toast.success(initialValues ? "Product updated" : "Product created");
        navigate(`/products/${data.id}`);
      },
      onError: (err) => {
        toast.error(err?.message || "Couldn’t save product");
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title={title}
        description="Keep your catalog clean and your stock accurate."
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit(submit)} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Product details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Aurora Headphones"
                error={errors.name}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="AUD-001"
                  error={errors.sku}
                  {...register("sku")}
                />
                <FieldDescription>Must be unique. Letters and dashes only.</FieldDescription>
                <FieldError>{errors.sku?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="99.00"
                  error={errors.price}
                  {...register("price")}
                />
                <FieldError>{errors.price?.message}</FieldError>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock_quantity">Stock quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                step="1"
                placeholder="42"
                error={errors.stock_quantity}
                {...register("stock_quantity")}
              />
              <FieldDescription>Cannot be negative.</FieldDescription>
              <FieldError>{errors.stock_quantity?.message}</FieldError>
            </div>

            {error && !isSubmitting && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link to="/products">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : <Save className="h-4 w-4" />}
                {initialValues ? "Save changes" : "Create product"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
