import { http } from "./client";

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */
export const productsApi = {
  list: (params) => http.get("/products", { params }),
  get: (id) => http.get(`/products/${id}`),
  create: (payload) => http.post("/products", payload),
  update: (id, payload) => http.put(`/products/${id}`, payload),
  remove: (id) => http.delete(`/products/${id}`),
};

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */
export const customersApi = {
  list: (params) => http.get("/customers", { params }),
  get: (id) => http.get(`/customers/${id}`),
  create: (payload) => http.post("/customers", payload),
  update: (id, payload) => http.put(`/customers/${id}`, payload),
  remove: (id) => http.delete(`/customers/${id}`),
};

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */
export const ordersApi = {
  list: (params) => http.get("/orders", { params }),
  get: (id) => http.get(`/orders/${id}`),
  create: (payload) => http.post("/orders", payload),
  remove: (id) => http.delete(`/orders/${id}`),
};

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */
export const dashboardApi = {
  get: () => http.get("/dashboard"),
};
