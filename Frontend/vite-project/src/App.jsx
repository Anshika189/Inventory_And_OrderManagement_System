import "./App.css";
import AppRoutes from "@/routes";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import CommandPalette from "@/components/shared/CommandPalette";
import GlobalHotkeys from "@/components/shared/GlobalHotkeys";

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <CommandPalette />
      <GlobalHotkeys />
    </ErrorBoundary>
  );
}
