#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────
# AIPROSOL · GUMROAD · BULK ENABLE
#
# Run this AFTER you've uploaded delivery files to each product's Content
# tab in Gumroad admin. It calls PUT /v2/products/{id}/enable on all 15 +
# (optionally) the Complete Vault if you've added its ID below.
#
# Usage:   bash gumroad-publish-all.sh
# Verify:  curl -s "https://srijan07.gumroad.com/l/roi-pitch-deck" | grep -q "I want this"
# ─────────────────────────────────────────────────────────────────────────

set -e
ENV_FILE="/Users/user/Airprosol/web/.env.local"
TOKEN=$(grep "^GUMROAD_ACCESS_TOKEN=" "$ENV_FILE" | cut -d= -f2)

if [ -z "$TOKEN" ]; then
  echo "ERROR: GUMROAD_ACCESS_TOKEN missing from $ENV_FILE" >&2
  exit 1
fi

python3 - "$TOKEN" <<'PY'
import sys, urllib.parse, urllib.request, json, time
token = sys.argv[1]

# id, slug, price, name — 15 existing Aiprosol products
PRODUCTS = [
    ("ua7aX-60tdC_dV5MDUHTOg==", "roi-pitch-deck",        17, "Automation ROI Pitch Deck Template"),
    ("iC0bIBYdyiTUDcyKq8wuDA==", "audit-checklist",       37, "Business Process Audit Checklist"),
    ("CyQEOdthFm2tAOcFDGX76Q==", "roi-calculator",        47, "AI Automation ROI Calculator"),
    ("UAp7ZS13OAjqHqmSOPoCRQ==", "30-day-challenge",      47, "30-Day Business Automation Challenge"),
    ("NbJOM8vGs2saUBlgjE1xgQ==", "ai-tools-guide",        67, "AI Tools Master Comparison Guide 2026"),
    ("BnYZ8Fpj3z4Mt3DM9sBeqg==", "starter-bundle",        79, "The Starter Bundle"),
    ("OByGZhDdfTc7ucAyfRDdLA==", "starter-pack",          97, "Global Business Automation Starter Pack"),
    ("4a-LUCbAIvcPtMwkXuo5Sw==", "workflow-playbook",     97, "Workflow Automation Playbook"),
    ("r4axsfgHEqxdKNHO0i-IDw==", "prompt-vault",          97, "ChatGPT Business Prompt Vault"),
    ("BCGwsTKm8JXIw7SSCGoteA==", "lead-gen-playbook",    127, "Lead Generation Automation Playbook"),
    ("bsyAUBYFloTfYZTifW8RSQ==", "tools-vault",          147, "The AI Tools Vault"),
    ("wgDWmCA3uxbM_sANV-_lJA==", "stack-starter-kit",    197, "AI Tools Stack Starter Kit"),
    ("etN5xvUe7i3JrLT1tNTYlQ==", "zapier-make-power",    197, "Zapier + Make Power User Bundle"),
    ("h4LvXzTL2sAni_h3CLdHwA==", "playbook-pack",        197, "The Playbook Pack"),
    ("-1mPf7iueNBQcNK__AmyFw==", "enterprise-readiness", 397, "Enterprise AI Readiness Assessment Kit"),
    # Add Complete Vault here once created in UI: ("XXXXXX==", "complete-vault", 997, "The Complete Vault"),
]

def call(method, path, params=None):
    p = {"access_token": token, **(params or {})}
    req = urllib.request.Request(
        f"https://api.gumroad.com{path}?{urllib.parse.urlencode(p)}",
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode())

print(f"{'slug':28} {'price':>6}  enabled?  has-file?")
print("-" * 60)

ok = 0
warn = []
for pid, slug, price, name in PRODUCTS:
    enc = urllib.parse.quote(pid, safe="")
    # Pre-check: does it have content?
    info = call("GET", f"/v2/products/{enc}")
    fi = info.get("product", {}).get("file_info", {})
    has_file = bool(fi)

    if not has_file:
        warn.append(slug)
        print(f"{slug:28} ${price:>5}    SKIPPED   (no file — SKIPPED for safety)")
        continue

    r = call("PUT", f"/v2/products/{enc}/enable")
    is_ok = bool(r.get("success"))
    msg = "" if is_ok else f" [{r.get('message', '')[:30]}]"
    print(f"{slug:28} ${price:>5}    {'YES' if is_ok else 'NO'}{msg}       YES")
    if is_ok: ok += 1
    time.sleep(0.25)

print()
print(f"Enabled: {ok}/{len(PRODUCTS)}")
if warn:
    print(f"\nSKIPPED ({len(warn)}) — upload delivery file in Gumroad UI first:")
    for s in warn: print(f"  • {s}")
PY
