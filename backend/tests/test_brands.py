def test_list_seeded_brands(client):
    response = client.get("/api/brands")
    assert response.status_code == 200
    brands = response.json()
    assert len(brands) >= 3
    brand_ids = [b["id"] for b in brands]
    assert "razorpay" in brand_ids
    assert "phonepe" in brand_ids
    assert "revolut" in brand_ids


def test_get_single_brand(client):
    response = client.get("/api/brands/razorpay")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "razorpay"
    assert data["name"] == "Razorpay Technologies"
    assert data["official_domain"] == "razorpay.com"
    assert len(data["verified_handles"]) >= 2


def test_get_nonexistent_brand(client):
    response = client.get("/api/brands/unknown_brand_xyz")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_create_new_brand(client):
    payload = {
        "id": "stripe",
        "name": "Stripe Global Inc.",
        "industry": "Financial Infrastructure",
        "official_handle": "@stripe",
        "support_handle": "@stripesupport",
        "official_domain": "stripe.com",
        "verified_handles": ["@stripe", "@stripesupport"],
        "official_apps": [
            {
                "appName": "Stripe Dashboard",
                "appId": "com.stripe.android.dashboard",
                "publisher": "Stripe, Inc."
            }
        ],
        "logo_url": "https://example.com/stripe.png",
        "risk_threshold": 55
    }
    response = client.post("/api/brands", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["id"] == "stripe"
    assert created["name"] == "Stripe Global Inc."

    # Test duplicate conflict
    duplicate_res = client.post("/api/brands", json=payload)
    assert duplicate_res.status_code == 409
