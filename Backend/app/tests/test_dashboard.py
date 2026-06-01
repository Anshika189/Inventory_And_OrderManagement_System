"""Dashboard endpoint tests."""


def test_dashboard_returns_aggregates(client):
    # Add a product, customer, and order
    cust = client.post(
        "/api/customers", json={"full_name": "C", "email": "c@d.test"}
    ).json()["data"]["id"]
    pid = client.post(
        "/api/products",
        json={"name": "D", "sku": "DASH-1", "price": "5.00", "stock_quantity": 1},
    ).json()["data"]["id"]
    client.post(
        "/api/orders",
        json={"customer_id": cust, "items": [{"product_id": pid, "quantity": 1}]},
    )

    r = client.get("/api/dashboard")
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["total_customers"] >= 1
    assert data["total_products"] >= 1
    assert data["total_orders"] >= 1
    assert "inventory_value" in data
    assert "recent_orders" in data
    assert "low_stock_items" in data
    assert "top_products" in data
    assert "order_trend" in data


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] in {"ok", "degraded"}
