import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "destructive",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-destructive/10 p-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone}
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
