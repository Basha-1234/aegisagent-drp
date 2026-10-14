def test_list_and_filter_findings(client):
    # Ensure monitoring has run so findings exist
    client.post("/api/monitoring/social/run", json={"brand_id": "razorpay"})

    # List all
    res = client.get("/api/findings")
    assert res.status_code == 200
    all_findings = res.json()
    assert len(all_findings) >= 1

    # Filter by brand
    res_brand = client.get("/api/findings?brand_id=razorpay")
    assert res_brand.status_code == 200
    for f in res_brand.json():
        assert f["brand_id"] == "razorpay"


def test_get_single_finding(client):
    # Fetch list to pick an ID
    res = client.get("/api/findings?brand_id=razorpay")
    findings = res.json()
    assert len(findings) > 0
    target = findings[0]

    single_res = client.get(f"/api/findings/{target['id']}")
    assert single_res.status_code == 200
    data = single_res.json()
    assert data["id"] == target["id"]
    assert data["suspect_handle"] == target["suspect_handle"]


def test_update_finding_review_status(client):
    res = client.get("/api/findings?brand_id=razorpay")
    target_id = res.json()[0]["id"]

    # Valid status update
    patch_res = client.patch(
        f"/api/findings/{target_id}",
        json={"review_status": "INVESTIGATING"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["review_status"] == "INVESTIGATING"

    # Confirm persistence
    get_res = client.get(f"/api/findings/{target_id}")
    assert get_res.json()["review_status"] == "INVESTIGATING"

    # Invalid status update (must return 422)
    bad_res = client.patch(
        f"/api/findings/{target_id}",
        json={"review_status": "NOT_A_VALID_STATUS"}
    )
    assert bad_res.status_code == 422
