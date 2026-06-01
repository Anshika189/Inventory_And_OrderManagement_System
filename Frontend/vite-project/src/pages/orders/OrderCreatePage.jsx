import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  User as UserIcon,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/shared/Loaders";
import { StockBadge } from "@/components/shared/StatusBadges";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { useCreateOrder } from "@/hooks/useOrders";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

const STEPS = [
  { id: 1, label: "Customer", icon: UserIcon },
  { id: 2, label: "Products", icon: Package },
  { id: 3, label: "Quantities", icon: ShoppingBag },
  { id: 4, label: "Review", icon: CheckCircle2 },
];

export default function OrderCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]); // [{product, quantity}]
  const [searchProduct, setSearchProduct] = useState("");
  const create = useCreateOrder();

  const { data: customersData, isLoading: loadingCustomers } = useCustomers({
    page: 1,
    size: 50,
    search: searchCustomer || undefined,
  });
  const { data: productsData, isLoading: loadingProducts } = useProducts({
    page: 1,
    size: 50,
    search: searchProduct || undefined,
  });

  const customers = customersData?.items || [];
  const products = productsData?.items || [];

  const totals = useMemo(() => {
    const items_count = selectedProducts.reduce((acc, p) => acc + p.quantity, 0);
    const total = selectedProducts.reduce(
      (acc, p) => acc + Number(p.product.price) * p.quantity,
      0
    );
    return { items_count, total };
  }, [selectedProducts]);

  function toggleProduct(product) {
    setSelectedProducts((current) => {
      const existing = current.find((p) => p.product.id === product.id);
      if (existing) {
        return current.filter((p) => p.product.id !== product.id);
      }
      return [
        ...current,
        { product, quantity: Math.min(1, product.stock_quantity) },
      ];
    });
  }

  function setQuantity(productId, quantity) {
    setSelectedProducts((current) =>
      current.map((p) =>
        p.product.id === productId
          ? { ...p, quantity: Math.max(1, Math.min(quantity, p.product.stock_quantity || quantity)) }
          : p
      )
    );
  }

  const hasStockIssue = selectedProducts.some(
    (p) => p.quantity > (p.product.stock_quantity || 0)
  );

  function submit() {
    if (!customer || selectedProducts.length === 0) return;
    const payload = {
      customer_id: customer.id,
      items: selectedProducts.map((p) => ({
        product_id: p.product.id,
        quantity: p.quantity,
      })),
    };
    create.mutate(payload, {
      onSuccess: (order) => {
        toast.success("Order created");
        navigate(`/orders/${order.id}`);
      },
      onError: (err) => toast.error(err.message || "Couldn’t create order"),
    });
  }

  const canAdvance = (() => {
    if (step === 1) return !!customer;
    if (step === 2) return selectedProducts.length > 0;
    if (step === 3) return selectedProducts.every((p) => p.quantity >= 1) && !hasStockIssue;
    return true;
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="Create a new order"
        description="A short, focused flow to capture the essentials."
        actions={
          <Button variant="ghost" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <Stepper step={step} />

      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step
                key="customer"
                title="Select a customer"
                description="Search for the buyer placing this order."
              >
                <div className="relative w-full sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email…"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="mt-4 grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {loadingCustomers ? (
                    <div className="col-span-2 flex items-center justify-center py-10 text-sm text-muted-foreground">
                      <Spinner className="mr-2" /> Loading customers…
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="col-span-2 py-10 text-center text-sm text-muted-foreground">
                      No customers found.{" "}
                      <Link to="/customers/new" className="text-primary hover:underline">
                        Add one
                      </Link>
                      .
                    </div>
                  ) : (
                    customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCustomer(c)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                          customer?.id === c.id
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-border hover:border-primary/40 hover:bg-accent"
                        )}
                      >
                        <Avatar name={c.full_name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{c.full_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                        {customer?.id === c.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step
                key="products"
                title="Select products"
                description="Pick everything that should appear on this order."
              >
                <div className="relative w-full sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products…"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="mt-4 grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {loadingProducts ? (
                    <div className="col-span-2 flex items-center justify-center py-10 text-sm text-muted-foreground">
                      <Spinner className="mr-2" /> Loading products…
                    </div>
                  ) : products.length === 0 ? (
                    <div className="col-span-2 py-10 text-center text-sm text-muted-foreground">
                      No products match your search.
                    </div>
                  ) : (
                    products.map((p) => {
                      const selected = selectedProducts.find((s) => s.product.id === p.id);
                      const disabled = p.stock_quantity <= 0;
                      return (
                        <button
                          key={p.id}
                          onClick={() => !disabled && toggleProduct(p)}
                          disabled={disabled}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                            selected
                              ? "border-primary bg-primary/5 shadow-soft"
                              : "border-border hover:border-primary/40 hover:bg-accent",
                            disabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(p.price)} · {p.stock_quantity} in stock
                            </p>
                          </div>
                          {selected ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <StockBadge quantity={p.stock_quantity} />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
                {selectedProducts.length > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {selectedProducts.length} product{selectedProducts.length === 1 ? "" : "s"} selected
                  </p>
                )}
              </Step>
            )}

            {step === 3 && (
              <Step
                key="quantities"
                title="Set quantities"
                description="Adjust how many of each product to order."
              >
                <ul className="space-y-3">
                  {selectedProducts.map((p) => (
                    <li
                      key={p.product.id}
                      className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.product.sku} · {formatCurrency(p.product.price)} ·{" "}
                            {p.product.stock_quantity} in stock
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(p.product.id, p.quantity - 1)}
                          disabled={p.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={p.product.stock_quantity}
                          value={p.quantity}
                          onChange={(e) => setQuantity(p.product.id, Number(e.target.value || 1))}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(p.product.id, p.quantity + 1)}
                          disabled={p.quantity >= p.product.stock_quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                {hasStockIssue && (
                  <p className="mt-3 text-sm text-destructive">
                    One or more items exceed available stock.
                  </p>
                )}
              </Step>
            )}

            {step === 4 && (
              <Step
                key="review"
                title="Review and confirm"
                description="Double-check the order, then submit."
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Customer
                    </h3>
                    {customer && (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-border p-3">
                        <Avatar name={customer.full_name} />
                        <div>
                          <p className="text-sm font-semibold">{customer.full_name}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Summary
                    </h3>
                    <div className="mt-2 rounded-xl border border-border p-4 space-y-2">
                      <Row label="Items" value={totals.items_count} />
                      <Row label="Subtotal" value={formatCurrency(totals.total)} />
                      <div className="border-t border-border pt-2">
                        <Row
                          label={<span className="text-sm font-semibold">Total</span>}
                          value={
                            <span className="text-lg font-bold gradient-text">
                              {formatCurrency(totals.total)}
                            </span>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Line items
                  </h3>
                  <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                    {selectedProducts.map((p) => (
                      <li
                        key={p.product.id}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">{p.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.quantity} × {formatCurrency(p.product.price)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(p.quantity * Number(p.product.price))}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Step>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={submit}
            disabled={!canAdvance || create.isPending}
            variant="gradient"
          >
            {create.isPending ? <Spinner /> : <Check className="h-4 w-4" />}
            Place order
          </Button>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const active = step === s.id;
        const done = step > s.id;
        const Icon = s.icon;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                done && "border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
                active && "border-primary bg-primary/10 text-primary",
                !active && !done && "border-border text-muted-foreground"
              )}
            >
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  "text-xs font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden h-px flex-1 bg-border sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Step({ title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
