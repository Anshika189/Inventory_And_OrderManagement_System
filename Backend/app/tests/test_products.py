"""Product endpoint tests."""


def test_create_product_success(client):
    payload = {
        "name": "Test Lamp",
        "sku": "LMP-1001",
        "price": "49.99",
        "stock_quantity": 12,
    }
    r = client.post("/api/products", json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["success"] is True
    assert body["data"]["sku"] == "LMP-1001"
    assert body["data"]["stock_quantity"] == 12


def test_create_product_invalid_price(client):
    r = client.post(
        "/api/products",
        json={"name": "X", "sku": "BAD-1", "price": "-1", "stock_quantity": 1},
    )
    assert r.status_code == 422
    assert r.json()["success"] is False


def test_create_product_negative_stock(client):
    r = client.post(
        "/api/products",
        json={"name": "X", "sku": "NEG-1", "price": "1.00", "stock_quantity": -3},
    )
    assert r.status_code == 422


def test_sku_must_be_unique(client):
    payload = {"name": "A", "sku": "DUPL-1", "price": "10.00", "stock_quantity": 1}
    r1 = client.post("/api/products", json=payload)
    assert r1.status_code == 201
    r2 = client.post("/api/products", json={**payload, "name": "B"})
    assert r2.status_code == 409
    assert r2.json()["code"] == "sku_conflict"


def test_list_products_paginated(client):
    for i in range(3):
        client.post(
            "/api/products",
            json={
                "name": f"P{i}",
                "sku": f"P-{i}",
                "price": "1.00",
                "stock_quantity": 1,
            },
        )
    r = client.get("/api/products?page=1&size=2")
    assert r.status_code == 200
    body = r.json()["data"]
    assert body["total"] >= 3
    assert len(body["items"]) == 2
    assert body["pages"] >= 2


def test_get_update_delete_product(client):
    create = client.post(
        "/api/products",
        json={"name": "A", "sku": "UPD-1", "price": "5.00", "stock_quantity": 1},
    ).json()["data"]
    pid = create["id"]

    r = client.get(f"/api/products/{pid}")
    assert r.status_code == 200

    r = client.put(f"/api/products/{pid}", json={"name": "Updated"})
    assert r.status_code == 200
    assert r.json()["data"]["name"] == "Updated"

    r = client.delete(f"/api/products/{pid}")
    assert r.status_code == 200

    r = client.get(f"/api/products/{pid}")
    assert r.status_code == 404


def test_search_products(client):
    client.post(
        "/api/products",
        json={"name": "Aurora Headphones", "sku": "AUD-1001", "price": "1.00", "stock_quantity": 1},
    )
    r = client.get("/api/products?search=aurora")
    assert r.status_code == 200
    assert r.json()["data"]["total"] >= 1
