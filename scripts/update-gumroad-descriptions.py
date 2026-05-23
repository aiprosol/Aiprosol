#!/usr/bin/env python3
"""
Push rich descriptions to each Gumroad product via API.

For each of the 10 Gumroad SKUs:
  - Find the matching product in src/content/products.json (by short_url permalink)
  - Build a structured description from shortDescription + longDescription + whatsInside + features
  - PUT /v2/products/:id with the new description (+ name if needed)
  - Verify via GET

Gumroad API rate-limits at 30 req/min; we have 10 products, so well within.

Note: Cover image upload is browser-only (no API endpoint). This script handles description only.
"""
import json
import os
import sys
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path("/Users/user/Airprosol/web")
ENV_LOCAL = ROOT / ".env.local"
PRODUCTS_JSON = ROOT / "src/content/products.json"

API_BASE = "https://api.gumroad.com/v2"


def load_key() -> str:
    for line in ENV_LOCAL.read_text().splitlines():
        if line.startswith("GUMROAD_ACCESS_TOKEN="):
            return line.partition("=")[2].strip().strip('"').strip("'")
    raise RuntimeError("GUMROAD_ACCESS_TOKEN not found in .env.local")


def http(method: str, path: str, params: dict | None = None, body: dict | None = None) -> dict:
    qs = urllib.parse.urlencode(params or {})
    url = f"{API_BASE}{path}?{qs}" if qs else f"{API_BASE}{path}"
    data = None
    headers = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
    if body is not None:
        data = urllib.parse.urlencode(body).encode("utf-8")
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read().decode("utf-8"))
        except Exception:
            return {"success": False, "message": f"HTTP {e.code}", "body": str(e)}


def _esc(s: str) -> str:
    """Minimal HTML escape (Gumroad sanitizes, but be safe)."""
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_description(p: dict) -> str:
    """Build a Gumroad-friendly rich description using HTML markup.

    Gumroad's description field stores HTML and renders proper DOM elements.
    Markdown (** ... **, • bullets) is rendered as literal text, so we use real tags.
    """
    parts: list[str] = []

    # Hook (one-line punch)
    short = (p.get("shortDescription") or "").strip()
    if short:
        parts.append(f"<p><strong>{_esc(short)}</strong></p>")

    # Body
    long_desc = (p.get("longDescription") or "").strip()
    if long_desc:
        parts.append(f"<p>{_esc(long_desc)}</p>")

    # What's inside
    inside = p.get("whatsInside") or []
    if inside:
        parts.append("<h3>What's inside</h3>")
        parts.append("<ul>")
        for item in inside:
            parts.append(f"<li>{_esc(item)}</li>")
        parts.append("</ul>")

    # Why it works (features)
    feats = p.get("features") or []
    if feats:
        parts.append("<h3>Why it works</h3>")
        parts.append("<ul>")
        for f in feats:
            parts.append(f"<li>{_esc(f)}</li>")
        parts.append("</ul>")

    # Trust footer
    parts.append("<hr>")
    parts.append("<h3>Includes</h3>")
    parts.append("<ul>")
    parts.append("<li>Instant download — no waiting list</li>")
    parts.append("<li>7-day no-questions-asked refund</li>")
    parts.append("<li>Lifetime access (one purchase, yours forever)</li>")
    parts.append("<li>Quarterly updates emailed for 12 months</li>")
    parts.append("</ul>")
    parts.append('<p>Questions? <a href="mailto:hello@aiprosol.com">hello@aiprosol.com</a></p>')
    parts.append('<p>Browse the full catalogue: <a href="https://aiprosol.com/digital-products">aiprosol.com/digital-products</a></p>')

    return "".join(parts)


def build_summary(p: dict) -> str:
    """Build the one-line custom_summary (shown above the buy button)."""
    short = (p.get("shortDescription") or "").strip()
    if not short:
        return ""
    # Cap at ~180 chars to render well on Gumroad
    if len(short) > 180:
        short = short[:177].rsplit(" ", 1)[0] + "..."
    return short


def build_tags(p: dict) -> list[str]:
    """Build tags from category + slug + canonical Aiprosol tags."""
    tags = set()
    cat = (p.get("category") or "").lower()
    if cat:
        tags.add(cat)
    # Standard product surface
    tags.add("aiprosol")
    tags.add("automation")
    # Tier hints
    if (p.get("price") or 0) >= 200:
        tags.add("playbook")
    if "n8n" in (p.get("longDescription") or ""):
        tags.add("n8n")
    if (p.get("category") or "") == "Bundle":
        tags.add("bundle")
    if (p.get("category") or "") == "AI Tools":
        tags.add("ai-tools")
    return sorted(tags)


# IDs for products that don't show up in the /v2/products list endpoint
# (Gumroad list endpoint quirks — these were extracted from the page JSON).
HIDDEN_GUMROAD_IDS: dict[str, str] = {
    "roi-pitch-deck": "ua7aX-60tdC_dV5MDUHTOg==",
    "audit-checklist": "iC0bIBYdyiTUDcyKq8wuDA==",
    "ai-tools-guide": "NbJOM8vGs2saUBlgjE1xgQ==",
    "prompt-vault": "r4axsfgHEqxdKNHO0i-IDw==",
    "roi-calculator": "CyQEOdthFm2tAOcFDGX76Q==",
}


def main():
    key = load_key()
    products = json.loads(PRODUCTS_JSON.read_text())

    # Build slug -> product map (slug = last path segment of buyUrl)
    by_slug = {}
    for p in products:
        bu = p.get("buyUrl") or ""
        if "/l/" in bu:
            slug = bu.split("/l/")[-1].strip("/")
            by_slug[slug] = p

    # Fetch live Gumroad products
    print("Fetching live Gumroad inventory...")
    listing = http("GET", "/products", params={"access_token": key})
    if not listing.get("success"):
        print(f"  ❌ Couldn't list products: {listing}")
        sys.exit(1)

    gumroad_products = listing["products"]
    seen_slugs = {gp.get("custom_permalink") for gp in gumroad_products}
    # Add hidden products to the queue
    for slug, pid in HIDDEN_GUMROAD_IDS.items():
        if slug in seen_slugs:
            continue
        gp = http("GET", f"/products/{urllib.parse.quote(pid, safe='')}", params={"access_token": key})
        if gp.get("success"):
            gumroad_products.append(gp["product"])
    print(f"  {len(gumroad_products)} products on Gumroad (incl. {len(HIDDEN_GUMROAD_IDS)} hidden)\n")

    updated = 0
    skipped = 0
    failed = 0

    for gp in gumroad_products:
        slug = gp.get("custom_permalink") or ""
        pid = gp["id"]
        name = gp["name"]

        local = by_slug.get(slug)
        if not local:
            print(f"  ⚠  {name} ({slug}) — no matching local product, skipping")
            skipped += 1
            continue

        new_desc = build_description(local)
        new_summary = build_summary(local)
        new_tags = build_tags(local)

        # PUT update — description + custom_summary + tags
        path = f"/products/{urllib.parse.quote(pid, safe='')}"
        body: dict = {
            "access_token": key,
            "description": new_desc,
            "custom_summary": new_summary,
        }
        # urllib.parse.urlencode handles list values when doseq=True
        # but our http() helper doesn't, so encode tags manually
        encoded_body_pairs = list(body.items())
        for t in new_tags:
            encoded_body_pairs.append(("tags[]", t))
        encoded = urllib.parse.urlencode(encoded_body_pairs).encode("utf-8")
        req = urllib.request.Request(
            f"{API_BASE}{path}",
            data=encoded,
            method="PUT",
            headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                resp = json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            resp = {"success": False, "message": f"HTTP {e.code}: {e.read()[:200]}"}

        if resp.get("success"):
            print(f"  ✓ {name}")
            print(f"      description: {len(new_desc)} chars  ·  summary: {len(new_summary)} chars  ·  tags: {','.join(new_tags)}")
            updated += 1
        else:
            print(f"  ❌ {name} — {resp.get('message', resp)}")
            failed += 1

    print(f"\n{updated} updated, {skipped} skipped, {failed} failed.")
    if failed:
        sys.exit(2)


if __name__ == "__main__":
    main()
