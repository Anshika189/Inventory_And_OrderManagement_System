import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Spinner } from "@/components/shared/Loaders";
import { useCreateCustomer } from "@/hooks/useCustomers";

const customerSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[+0-9\s().-]{6,32}$/.test(v),
      "Phone format looks off"
    ),
});

export default function CustomerCreatePage() {
  const navigate = useNavigate();
  const create = useCreateCustomer();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(customerSchema) });

  function onSubmit(values) {
    const payload = { ...values, phone: values.phone || null };
    create.mutate(payload, {
      onSuccess: (data) => {
        toast.success("Customer added");
        navigate(`/customers`);
      },
      onError: (err) => toast.error(err.message || "Couldn’t save customer"),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Add a new customer"
        description="Capture the basics — you can fill in more later."
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" /> Customer details
            </CardTitle>
            <CardDescription>All fields are required unless marked optional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" placeholder="Ada Lovelace" error={errors.full_name} {...register("full_name")} />
              <FieldError>{errors.full_name?.message}</FieldError>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ada@analytical.test"
                  error={errors.email}
                  {...register("email")}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  placeholder="+1 555 0100"
                  error={errors.phone}
                  {...register("phone")}
                />
                <FieldError>{errors.phone?.message}</FieldError>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link to="/customers">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? <Spinner /> : <Save className="h-4 w-4" />}
                Create customer
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
