import { Route, Routes } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProductsListPage from "@/pages/products/ProductsListPage";
import ProductCreatePage from "@/pages/products/ProductCreatePage";
import ProductEditPage from "@/pages/products/ProductEditPage";
import ProductDetailPage from "@/pages/products/ProductDetailPage";
import CustomersListPage from "@/pages/customers/CustomersListPage";
import CustomerCreatePage from "@/pages/customers/CustomerCreatePage";
import OrdersListPage from "@/pages/orders/OrdersListPage";
import OrderCreatePage from "@/pages/orders/OrderCreatePage";
import OrderDetailPage from "@/pages/orders/OrderDetailPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="/products" element={<ProductsListPage />} />
        <Route path="/products/new" element={<ProductCreatePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/edit" element={<ProductEditPage />} />
        <Route path="/customers" element={<CustomersListPage />} />
        <Route path="/customers/new" element={<CustomerCreatePage />} />
        <Route path="/orders" element={<OrdersListPage />} />
        <Route path="/orders/new" element={<OrderCreatePage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
