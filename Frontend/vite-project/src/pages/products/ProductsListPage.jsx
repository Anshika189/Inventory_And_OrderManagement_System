import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, ArrowUpDown, Download, Package } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR, EmptyTable } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/shared/Loaders";
import { StockBadge } from "@/components/shared/StatusBadges";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useDeleteProduct,
  useProducts,
} from "@/hooks/useProducts";
import { DEFAULT_PAGE_SIZE } from "@/config";
import { formatCurrency, formatDate } from "@/utils/format";
import { exportToCSV } from "@/utils/csv";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const SORT_OPTIONS = [
  { value: "created_at", label: "Newest" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "stock_quantity", label: "Stock" },
];

export default function ProductsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const debouncedSearch = useDebounce(search, 300);
  const [pendingDelete, setPendingDelete] = useState(null);

  const params = {
    page,
    size: DEFAULT_PAGE_SIZE,
    search: debouncedSearch || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
  };

  const { data, isLoading, isFetching } = useProducts(params);
  const deleteProduct = useDeleteProduct();

  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  function toggleSort(field) {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  function handleExport() {
    if (!items.length) {
      toast.error("No products to export");
      return;
    }
    exportToCSV(
      `products-${new Date().toISOString().slice(0, 10)}.csv`,
      items,
      [
        { key: "name", label: "Name" },
        { key: "sku", label: "SKU" },
        { key: "price", label: "Price" },
        { key: "stock_quantity", label: "Stock" },
        { key: "created_at", label: "Created" },
      ]
    );
  }

  function handleDelete() {
    if (!pendingDelete) return;
    deleteProduct.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success(`Deleted “${pendingDelete.name}”`);
        setPendingDelete(null);
      },
      onError: (err) => {
        toast.error(err.message || "Couldn’t delete product");
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage your inventory, pricing, and stock levels."
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => navigate("/products/new")}>
              <Plus className="h-4 w-4" /> New product
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Button variant="outline" size="icon" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Table>
            <TBody>
              <TableSkeleton rows={8} cols={5} />
            </TBody>
          </Table>
        ) : items.length === 0 ? (
          <EmptyTable
            icon={Package}
            title={search ? "No matches found" : "No products yet"}
            description={
              search
                ? "Try a different search term."
                : "Add your first product to start tracking inventory."
            }
            action={
              !search && (
                <Button onClick={() => navigate("/products/new")} className="mt-2">
                  <Plus className="h-4 w-4" /> Add product
                </Button>
              )
            }
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH>SKU</TH>
                  <TH>
                    <button onClick={() => toggleSort("price")} className="inline-flex items-center gap-1 hover:text-foreground">
                      Price <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TH>
                  <TH>
                    <button onClick={() => toggleSort("stock_quantity")} className="inline-flex items-center gap-1 hover:text-foreground">
                      Stock <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TH>
                  <TH>Status</TH>
                  <TH>Created</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody className={isFetching ? "opacity-60" : ""}>
                {items.map((p) => (
                  <TR key={p.id}>
                    <TD>
                      <Link
                        to={`/products/${p.id}`}
                        className="text-sm font-semibold hover:text-primary"
                      >
                        {p.name}
                      </Link>
                    </TD>
                    <TD className="font-mono text-xs text-muted-foreground">{p.sku}</TD>
                    <TD>{formatCurrency(p.price)}</TD>
                    <TD className="font-medium">{p.stock_quantity}</TD>
                    <TD>
                      <StockBadge quantity={p.stock_quantity} />
                    </TD>
                    <TD className="text-xs text-muted-foreground">{formatDate(p.created_at)}</TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${p.id}/edit`)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setPendingDelete(p)}>
                          Delete
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
            Showing {items.length} of {total} {total === 1 ? "product" : "products"}
          </span>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleteProduct.isPending}
        title="Delete this product?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be permanently removed. Orders referencing this product may block deletion.`
            : ""
        }
        confirmLabel="Delete product"
      />
    </div>
  );
}
