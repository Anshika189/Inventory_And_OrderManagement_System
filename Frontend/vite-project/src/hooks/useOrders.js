import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ordersApi } from "@/services/api";

export const orderKeys = {
  all: ["orders"],
  list: (params) => ["orders", "list", params],
  detail: (id) => ["orders", "detail", id],
};

export function useOrders(params) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
