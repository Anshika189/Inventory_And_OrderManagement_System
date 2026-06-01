import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, Plus, Search, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR, EmptyTable } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { TableSkeleton } from "@/components/shared/Loaders";
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/utils/format";
import { DEFAULT_PAGE_SIZE } from "@/config";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function CustomersListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data, isLoading, isFetching } = useCustomers({
    page,
    size: DEFAULT_PAGE_SIZE,
    search: debounced || undefined,
  });
  const deleteCustomer = useDeleteCustomer();

  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  function handleDelete() {
    if (!pendingDelete) return;
    deleteCustomer.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success(`Removed “${pendingDelete.full_name}”`);
        setPendingDelete(null);
      },
      onError: (err) => toast.error(err.message || "Couldn’t delete customer"),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Customers"
        description="Your buyers, vendors, and everyone in between."
        actions={
          <Button onClick={() => navigate("/customers/new")}>
            <Plus className="h-4 w-4" /> New customer
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <Table>
            <TBody>
              <TableSkeleton rows={6} cols={4} />
            </TBody>
          </Table>
        ) : items.length === 0 ? (
          <EmptyTable
            icon={Users}
            title={search ? "No matches" : "No customers yet"}
            description={
              search
                ? "Try a different search term."
                : "Add your first customer to start placing orders."
            }
            action={
              !search && (
                <Button onClick={() => navigate("/customers/new")} className="mt-2">
                  <Plus className="h-4 w-4" /> Add customer
                </Button>
              )
            }
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Contact</TH>
                  <TH>Joined</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody className={isFetching ? "opacity-60" : ""}>
                {items.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Avatar name={c.full_name} />
                        <div>
                          <p className="text-sm font-semibold">{c.full_name}</p>
                          <p className="text-xs text-muted-foreground">ID {c.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" /> {c.email}
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {c.phone}
                          </p>
                        )}
                      </div>
                    </TD>
                    <TD className="text-xs text-muted-foreground">{formatDate(c.created_at)}</TD>
                    <TD>
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setPendingDelete(c)}
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
            {items.length} of {total} {total === 1 ? "customer" : "customers"}
          </span>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleteCustomer.isPending}
        title="Remove this customer?"
        description={
          pendingDelete
            ? `“${pendingDelete.full_name}” and their order history will be removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Remove customer"
      />
    </div>
  );
}
