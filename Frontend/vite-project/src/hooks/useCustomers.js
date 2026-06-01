import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { customersApi } from "@/services/api";

export const customerKeys = {
  all: ["customers"],
  list: (params) => ["customers", "list", params],
  detail: (id) => ["customers", "detail", id],
};

export function useCustomers(params) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => customersApi.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
