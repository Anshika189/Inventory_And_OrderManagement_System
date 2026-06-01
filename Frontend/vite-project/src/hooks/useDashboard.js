import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api";

export const dashboardKeys = {
  all: ["dashboard"],
  detail: () => ["dashboard", "detail"],
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.detail(),
    queryFn: () => dashboardApi.get(),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
