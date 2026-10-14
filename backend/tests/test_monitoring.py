def test_trigger_social_monitoring(client):
    payload = {"brand_id": "razorpay", "use_demo_fixtures": True}
    response = client.post("/api/monitoring/social/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["brand_id"] == "razorpay"
    assert data["channel"] == "social"
    assert data["status"] == "COMPLETED"
    assert data["provenance"] == "demo_fixture"
    assert data["is_live"] is False
    assert data["candidates_scanned"] >= 3
    assert data["threats_detected"] >= 1
    assert len(data["findings"]) >= 3


def test_trigger_apps_monitoring(client):
    payload = {"brand_id": "razorpay", "use_demo_fixtures": True}
    response = client.post("/api/monitoring/apps/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["brand_id"] == "razorpay"
    assert data["channel"] == "apps"
    assert data["status"] == "COMPLETED"
    assert data["provenance"] == "demo_fixture"
    assert data["candidates_scanned"] >= 2
    assert len(data["findings"]) >= 2


def test_trigger_monitoring_invalid_brand(client):
    payload = {"brand_id": "nonexistent_brand", "use_demo_fixtures": True}
    response = client.post("/api/monitoring/social/run", json=payload)
    assert response.status_code == 404
