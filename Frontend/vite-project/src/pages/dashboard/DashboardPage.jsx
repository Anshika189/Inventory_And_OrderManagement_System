import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Boxes,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency, formatNumber, formatDate, timeAgo } from "@/utils/format";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR, EmptyTable } from "@/components/ui/Table";
import { StockBadge, OrderStatusBadge } from "@/components/shared/StatusBadges";
import PageHeader from "@/components/shared/PageHeader";
import { PageLoader, CardSkeleton, TableSkeleton } from "@/components/shared/Loaders";
import { exportToCSV } from "@/utils/csv";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CardSkeleton className="lg:col-span-2" />
          <CardSkeleton />
        </div>
        <PageLoader label="Loading dashboard…" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyTable
        icon={AlertTriangle}
        title="Couldn’t load dashboard"
        description="There was a problem fetching the latest data. Please try refreshing."
      />
    );
  }

  const {
    total_products,
    total_customers,
    total_orders,
    low_stock_products,
    inventory_value,
    recent_orders,
    low_stock_items,
    top_products,
    order_trend,
  } = data;

  const chartData = (order_trend || []).map((p) => ({
    date: format(parseISO(p.date), "MMM d"),
    orders: p.orders,
    revenue: Number(p.revenue),
  }));

  function exportDashboard() {
    exportToCSV(
      `dashboard-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { metric: "Total products", value: total_products },
        { metric: "Total customers", value: total_customers },
        { metric: "Total orders", value: total_orders },
        { metric: "Low stock products", value: low_stock_products },
        { metric: "Inventory value", value: inventory_value },
      ],
      [
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
      ]
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Welcome back to InventoryFlow"
        description="A real-time pulse on your products, customers, and orders."
        actions={
          <Button variant="outline" size="md" onClick={exportDashboard}>
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={formatNumber(total_products)}
          icon={Package}
          tone="primary"
          hint="Active SKUs in your catalog"
        />
        <StatCard
          label="Total Customers"
          value={formatNumber(total_customers)}
          icon={Users}
          tone="info"
          hint="People & companies you serve"
        />
        <StatCard
          label="Total Orders"
          value={formatNumber(total_orders)}
          icon={ShoppingCart}
          tone="violet"
          hint="All-time order volume"
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(inventory_value)}
          icon={DollarSign}
          tone="success"
          hint="Stock priced at retail"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Order trend
                  </CardTitle>
                  <CardDescription>Last 14 days of order activity</CardDescription>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <Sparkles className="h-3 w-3" /> Live
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.4}
                      fill="url(#orders)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Low stock alerts
              </CardTitle>
              <CardDescription>
                {low_stock_products} {low_stock_products === 1 ? "item" : "items"} need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton h-12 w-full" />
                  ))}
                </div>
              ) : (low_stock_items || []).length === 0 ? (
                <EmptyTable
                  icon={Sparkles}
                  title="All stocked up"
                  description="No products are running low. Nice work."
                />
              ) : (
                <ul className="space-y-2">
                  {low_stock_items.slice(0, 6).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                      <StockBadge quantity={p.stock_quantity} />
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/products"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View all products <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent orders</CardTitle>
                <CardDescription>Your latest 5 orders</CardDescription>
              </div>
              <Link
                to="/orders"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Table>
                <TBody>
                  <TableSkeleton rows={5} cols={5} />
                </TBody>
              </Table>
            ) : (recent_orders || []).length === 0 ? (
              <EmptyTable
                icon={ShoppingCart}
                title="No orders yet"
                description="When customers place orders, they will show up here."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Order</TH>
                    <TH>Customer</TH>
                    <TH>Status</TH>
                    <TH>Items</TH>
                    <TH className="text-right">Total</TH>
                  </TR>
                </THead>
                <TBody>
                  {recent_orders.map((o) => (
                    <TR key={o.id} className="cursor-pointer">
                      <TD>
                        <Link
                          to={`/orders/${o.id}`}
                          className="font-mono text-xs text-muted-foreground hover:text-foreground"
                        >
                          #{o.id.slice(0, 8)}
                        </Link>
                        <p className="text-xs text-muted-foreground">{timeAgo(o.created_at)}</p>
                      </TD>
                      <TD>
                        <p className="text-sm font-medium">{o.customer_name || "—"}</p>
                      </TD>
                      <TD>
                        <OrderStatusBadge status={o.status} />
                      </TD>
                      <TD className="text-sm text-muted-foreground">{o.items_count}</TD>
                      <TD className="text-right font-semibold">
                        {formatCurrency(o.total_amount)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top selling products</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 w-full" />
                ))}
              </div>
            ) : (top_products || []).length === 0 ? (
              <EmptyTable
                icon={Boxes}
                title="No data yet"
                description="Top sellers will appear after the first orders."
              />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={top_products.map((p) => ({ name: p.sku, value: Number(p.revenue) }))}
                    layout="vertical"
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
