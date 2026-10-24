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



# -------------------------------------------------------------
# Takedown Report Draft Persistence Tests (Task 2)
# -------------------------------------------------------------
def test_create_takedown_report_success(client):
    # Ensure findings exist
    client.post("/api/monitoring/social/run", json={"brand_id": "razorpay"})
    findings = client.get("/api/findings?brand_id=razorpay").json()
    assert len(findings) > 0
    target_id = findings[0]["id"]

    res = client.post(
        "/api/reports/takedown",
        json={
            "finding_id": target_id,
            "analyst_name": "Sarah Vance",
            "analyst_designation": "Head of Brand Protection"
        }
    )
    assert res.status_code == 201
    data = res.json()

    assert data["id"].startswith("RPT-TKD-")
    assert data["finding_id"] == target_id
    assert data["brand_id"] == "razorpay"
    assert data["document_status"] == "Demonstration Draft — Not Sent"
    assert data["review_state"] == "DRAFT"
    assert data["analyst_name"] == "Sarah Vance"
    assert data["analyst_designation"] == "Head of Brand Protection"
    assert "# SAMPLE — DIGITAL IMPERSONATION TAKEDOWN NOTICE" in data["content_markdown"]
    assert "Demonstration Draft — Not Sent" in data["content_markdown"]


def test_create_takedown_report_rejects_nonexistent_finding(client):
    res = client.post(
        "/api/reports/takedown",
        json={"finding_id": "NONEXISTENT_FND_999"}
    )
    assert res.status_code == 404
    assert "does not exist" in res.json()["detail"].lower()


def test_create_takedown_report_rejects_mismatched_brand(client):
    findings = client.get("/api/findings?brand_id=razorpay").json()
    target_id = findings[0]["id"]

    res = client.post(
        "/api/reports/takedown",
        json={
            "finding_id": target_id,
            "brand_id": "phonepe"  # Deliberate mismatch
        }
    )
    assert res.status_code == 400
    assert "mismatched brand_id" in res.json()["detail"].lower()


def test_retrieve_saved_reports_for_finding(client):
    findings = client.get("/api/findings?brand_id=razorpay").json()
    target_id = findings[0]["id"]

    res = client.get(f"/api/reports/takedown/{target_id}")
    assert res.status_code == 200
    reports = res.json()
    assert isinstance(reports, list)
    assert len(reports) >= 1
    assert reports[0]["finding_id"] == target_id
    assert reports[0]["document_status"] == "Demonstration Draft — Not Sent"


def test_retrieve_reports_nonexistent_finding(client):
    res = client.get("/api/reports/takedown/NONEXISTENT_FND_999")
    assert res.status_code == 404


def test_retrieve_report_detail_endpoint(client):
    findings = client.get("/api/findings?brand_id=razorpay").json()
    target_id = findings[0]["id"]

    reports = client.get(f"/api/reports/takedown/{target_id}").json()
    report_id = reports[0]["id"]

    detail_res = client.get(f"/api/reports/takedown/detail/{report_id}")
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["id"] == report_id
    assert data["finding_id"] == target_id


def test_retrieve_report_detail_nonexistent(client):
    res = client.get("/api/reports/takedown/detail/RPT-TKD-NONEXISTENT")
    assert res.status_code == 404


def test_update_takedown_report_content_and_review(client):
    findings = client.get("/api/findings?brand_id=razorpay").json()
    target_id = findings[0]["id"]

    reports = client.get(f"/api/reports/takedown/{target_id}").json()
    report_id = reports[0]["id"]

    updated_text = "# EDITED FORMAL NOTICE\nReviewed and edited by authorized legal counsel."
    put_res = client.put(
        f"/api/reports/takedown/{report_id}",
        json={
            "content_markdown": updated_text,
            "subject": "Formal Takedown Demand Notice — Case Escalated",
            "analyst_name": "Lead Counsel",
            "analyst_designation": "VP Legal Affairs",
            "review_state": "UNDER_REVIEW"
        }
    )
    assert put_res.status_code == 200
    data = put_res.json()

    assert data["id"] == report_id
    assert data["finding_id"] == target_id  # Unchanged
    assert data["brand_id"] == "razorpay"    # Unchanged
    assert data["content_markdown"] == updated_text
    assert data["subject"] == "Formal Takedown Demand Notice — Case Escalated"
    assert data["analyst_name"] == "Lead Counsel"
    assert data["review_state"] == "UNDER_REVIEW"
    assert data["document_status"] == "Demonstration Draft — Not Sent"


def test_update_takedown_report_rejects_nonexistent(client):
    res = client.put(
        "/api/reports/takedown/RPT-TKD-NONEXISTENT-999",
        json={"content_markdown": "Some valid content text"}
    )
    assert res.status_code == 404


def test_takedown_report_validation_errors(client):
    findings = client.get("/api/findings?brand_id=razorpay").json()
    target_id = findings[0]["id"]

    # 1. Invalid review_state claiming external submission
    bad_review = client.post(
        "/api/reports/takedown",
        json={
            "finding_id": target_id,
            "review_state": "SUBMITTED_TO_PLATFORM"  # Disallowed
        }
    )
    assert bad_review.status_code == 422

    # 2. Invalid document_status claiming it was sent
    bad_status = client.post(
        "/api/reports/takedown",
        json={
            "finding_id": target_id,
            "document_status": "Official Notice Sent"  # Disallowed
        }
    )
    assert bad_status.status_code == 422

    # 3. Content too short (< 10 chars)
    bad_content = client.post(
        "/api/reports/takedown",
        json={
            "finding_id": target_id,
            "content_markdown": "Short"
        }
    )
    assert bad_content.status_code == 422


def test_report_association_preserved_across_status_changes(client):
    findings = client.get("/api/findings?brand_id=razorpay").json()
    target_id = findings[0]["id"]

    reports = client.get(f"/api/reports/takedown/{target_id}").json()
    report_id = reports[0]["id"]

    # Transition to REVIEWED
    put_res = client.put(
        f"/api/reports/takedown/{report_id}",
        json={"review_state": "REVIEWED"}
    )
    assert put_res.status_code == 200
    assert put_res.json()["review_state"] == "REVIEWED"
    assert put_res.json()["finding_id"] == target_id
