"""Order endpoint and business-rule tests."""

from decimal import Decimal


def _create_customer(client) -> str:
    r = client.post(
        "/api/customers",
        json={"full_name": "Buyer", "email": "buyer@x.test"},
    )
    assert r.status_code == 201
    return r.json()["data"]["id"]


def _create_product(client, sku: str, price: str, stock: int) -> str:
    r = client.post(
        "/api/products",
        json={"name": sku, "sku": sku, "price": price, "stock_quantity": stock},
    )
    assert r.status_code == 201, r.text
    return r.json()["data"]["id"]


def test_create_order_deducts_stock(client):
    cust = _create_customer(client)
    pid = _create_product(client, "ORD-1", "20.00", 10)

    r = client.post(
        "/api/orders",
        json={
            "customer_id": cust,
            "items": [{"product_id": pid, "quantity": 3}],
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["success"] is True
    assert Decimal(body["data"]["total_amount"]) == Decimal("60.00")

    p = client.get(f"/api/products/{pid}").json()["data"]
    assert p["stock_quantity"] == 7


def test_insufficient_stock_rejected(client):
    cust = _create_customer(client)
    pid = _create_product(client, "ORD-2", "10.00", 2)

    r = client.post(
        "/api/orders",
        json={
            "customer_id": cust,
            "items": [{"product_id": pid, "quantity": 5}],
        },
    )
    assert r.status_code == 422
    assert r.json()["code"] == "insufficient_stock"
    # stock unchanged
    assert client.get(f"/api/products/{pid}").json()["data"]["stock_quantity"] == 2


def test_multi_item_order_totals(client):
    cust = _create_customer(client)
    p1 = _create_product(client, "MUL-1", "10.00", 5)
    p2 = _create_product(client, "MUL-2", "2.50", 5)

    r = client.post(
        "/api/orders",
        json={
            "customer_id": cust,
            "items": [
                {"product_id": p1, "quantity": 2},
                {"product_id": p2, "quantity": 4},
            ],
        },
    )
    assert r.status_code == 201
    assert Decimal(r.json()["data"]["total_amount"]) == Decimal("30.00")


def test_unknown_customer_rejected(client):
    import uuid

    pid = _create_product(client, "ORD-3", "5.00", 1)
    r = client.post(
        "/api/orders",
        json={
            "customer_id": str(uuid.uuid4()),
            "items": [{"product_id": pid, "quantity": 1}],
        },
    )
    assert r.status_code == 404


def test_get_and_delete_order(client):
    cust = _create_customer(client)
    pid = _create_product(client, "ORD-4", "5.00", 1)
    oid = client.post(
        "/api/orders",
        json={
            "customer_id": cust,
            "items": [{"product_id": pid, "quantity": 1}],
        },
    ).json()["data"]["id"]

    r = client.get(f"/api/orders/{oid}")
    assert r.status_code == 200
    assert r.json()["data"]["id"] == oid
    assert client.delete(f"/api/orders/{oid}").status_code == 200
    assert client.get(f"/api/orders/{oid}").status_code == 404


def test_list_orders_pagination(client):
    cust = _create_customer(client)
    pid = _create_product(client, "ORD-5", "1.00", 20)
    for _ in range(3):
        client.post(
            "/api/orders",
            json={
                "customer_id": cust,
                "items": [{"product_id": pid, "quantity": 1}],
            },
        )
    r = client.get("/api/orders?page=1&size=2")
    assert r.status_code == 200
    assert r.json()["data"]["total"] >= 3
