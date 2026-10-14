def test_generate_json_evidentiary_report(client):
    # Ensure findings exist
    client.post("/api/monitoring/social/run", json={"brand_id": "razorpay"})
    findings = client.get("/api/findings?brand_id=razorpay").json()
    assert len(findings) > 0
    target_id = findings[0]["id"]

    res = client.get(f"/api/reports/{target_id}/json")
    assert res.status_code == 200
    report = res.json()

    assert report["finding_id"] == target_id
    assert report["brand_name"] == "Razorpay Technologies"
    assert report["official_domain"] == "razorpay.com"
    assert "suspect_entity" in report
    assert "forensic_evidence" in report
    assert "statutory_grounds" in report
    assert "it_rules_2021" in report["statutory_grounds"]
    assert "dmca" in report["statutory_grounds"]
    # Check SHA-256 hash length
    assert len(report["chain_of_custody_hash"]) == 64
    assert "NOTICE:" in report["disclaimer"]


def test_generate_report_nonexistent_finding(client):
    res = client.get("/api/reports/NONEXISTENT_FND_999/json")
    assert res.status_code == 404
