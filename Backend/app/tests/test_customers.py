"""Customer endpoint tests."""


def test_create_customer_success(client):
    r = client.post(
        "/api/customers",
        json={"full_name": "Ada Lovelace", "email": "ada@analytical.test", "phone": "+1 555 0199"},
    )
    assert r.status_code == 201
    assert r.json()["data"]["email"] == "ada@analytical.test"


def test_email_unique(client):
    payload = {"full_name": "A", "email": "dupe@x.test"}
    assert client.post("/api/customers", json=payload).status_code == 201
    r = client.post("/api/customers", json={**payload, "full_name": "B"})
    assert r.status_code == 409
    assert r.json()["code"] == "email_conflict"


def test_email_validation(client):
    r = client.post("/api/customers", json={"full_name": "X", "email": "not-an-email"})
    assert r.status_code == 422


def test_phone_validation(client):
    r = client.post(
        "/api/customers",
        json={"full_name": "X", "email": "ok@x.test", "phone": "abc"},
    )
    assert r.status_code == 422


def test_list_get_update_delete(client):
    cid = client.post(
        "/api/customers",
        json={"full_name": "Test", "email": "t@t.test"},
    ).json()["data"]["id"]
    assert client.get(f"/api/customers/{cid}").status_code == 200
    r = client.put(f"/api/customers/{cid}", json={"full_name": "Renamed"})
    assert r.status_code == 200
    assert r.json()["data"]["full_name"] == "Renamed"
    assert client.delete(f"/api/customers/{cid}").status_code == 200
    assert client.get(f"/api/customers/{cid}").status_code == 404
