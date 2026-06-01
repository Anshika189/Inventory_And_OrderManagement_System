import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-md text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          4<span className="gradient-text">0</span>4
        </h1>
        <h2 className="text-lg font-semibold">Lost in inventory</h2>
        <p className="text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist. Try the dashboard, or
          head back to safety.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Go back
          </Button>
          <Button asChild>
            <Link to="/">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
