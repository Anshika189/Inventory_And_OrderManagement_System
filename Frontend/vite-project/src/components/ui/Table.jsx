import { cn } from "@/utils/cn";

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({ className, children, ...props }) {
  return (
    <thead
      className={cn(
        "border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TBody({ className, children, ...props }) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TR({ className, children, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-border/60 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TH({ className, children, ...props }) {
  return (
    <th
      className={cn(
        "h-11 px-4 text-left align-middle font-semibold text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({ className, children, ...props }) {
  return (
    <td
      className={cn("p-4 align-middle text-foreground/90", className)}
      {...props}
    >
      {children}
    </td>
  );
}

export function EmptyTable({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      {Icon && (
        <div className="rounded-full bg-muted p-3 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
