# Gumroad cover + thumbnail upload — 3-minute checklist

15 products. Each is one tab → drag cover → drag thumbnail → Save. Cover files are pre-staged and named to match.

---

## Per-product steps (same for all 15)

1. Open the edit URL in a new tab
2. Find the **Cover** section (top of the edit page)
3. Open Finder at `/Users/user/Airprosol/products catalogue/_covers/`
4. Drag the matching `*-cover-1280x720.png` file into the cover drop zone
5. Scroll to **Thumbnail** section (just below cover)
6. Drag `/Users/user/Airprosol/web/public/products/<slug>-thumb.png` into thumb drop zone
7. Click **Save** (top-right)

---

## The 15 products

| Product | Edit URL | Cover file (drag into cover slot) | Thumbnail (drag into thumb slot) |
|---|---|---|---|
| The Playbook Pack | https://gumroad.com/products/playbook-pack/edit *(find via dashboard if URL 404s)* | `the-playbook-pack-cover-1280x720.png` | `/products/the-playbook-pack-thumb.png` |
| The Starter Bundle | https://gumroad.com/products/vvsstt/edit | `the-starter-bundle-cover-1280x720.png` | `/products/the-starter-bundle-thumb.png` |
| Enterprise AI Readiness Kit | https://gumroad.com/products/ttuovj/edit | `enterprise-ai-readiness-assessment-kit-cover-1280x720.png` | `/products/enterprise-ai-readiness-assessment-kit-thumb.png` |
| Zapier + Make Power User Bundle | https://gumroad.com/products/rmqehf/edit | `zapier-make-power-user-bundle-cover-1280x720.png` | `/products/zapier-make-power-user-bundle-thumb.png` |
| AI Tools Stack Starter Kit | https://gumroad.com/products/dnwxdd/edit | `ai-tools-stack-starter-kit-cover-1280x720.png` | `/products/ai-tools-stack-starter-kit-thumb.png` |
| The AI Tools Vault | https://gumroad.com/products/wxcsws/edit | `the-ai-tools-vault-cover-1280x720.png` | `/products/the-ai-tools-vault-thumb.png` |
| Lead Generation Automation Playbook | https://gumroad.com/products/nyzocz/edit | `lead-generation-automation-playbook-cover-1280x720.png` | `/products/lead-generation-automation-playbook-thumb.png` |
| Workflow Automation Playbook | https://gumroad.com/products/workflow-playbook/edit *(find via dashboard if URL 404s)* | `workflow-automation-playbook-cover-1280x720.png` | `/products/workflow-automation-playbook-thumb.png` |
| Global Business Automation Starter Pack | https://gumroad.com/products/sijolw/edit | `global-business-automation-starter-pack-cover-1280x720.png` | `/products/global-business-automation-starter-pack-thumb.png` |
| 30-Day Business Automation Challenge | https://gumroad.com/products/aieujt/edit | `30-day-business-automation-challenge-cover-1280x720.png` | `/products/30-day-business-automation-challenge-thumb.png` |
| Automation ROI Pitch Deck Template | https://gumroad.com/products/cfyhds/edit | `automation-roi-pitch-deck-template-cover-1280x720.png` | `/products/automation-roi-pitch-deck-template-thumb.png` |
| Business Process Audit Checklist | https://gumroad.com/products/datilu/edit | `business-process-audit-checklist-cover-1280x720.png` | `/products/business-process-audit-checklist-thumb.png` |
| AI Tools Master Comparison Guide 2026 | https://gumroad.com/products/vaxped/edit | `ai-tools-master-comparison-guide-2026-cover-1280x720.png` | `/products/ai-tools-master-comparison-guide-2026-thumb.png` |
| ChatGPT Business Prompt Vault | https://gumroad.com/products/hwxhkp/edit | `chatgpt-business-prompt-vault-cover-1280x720.png` | `/products/chatgpt-business-prompt-vault-thumb.png` |
| AI Automation ROI Calculator | https://gumroad.com/products/woavib/edit | `ai-automation-roi-calculator-cover-1280x720.png` | `/products/ai-automation-roi-calculator-thumb.png` |

---

## Tips for speed

- **Open all 15 tabs first:** Cmd+click each URL in this checklist to open in a new tab. Then go tab-by-tab.
- **Keep Finder open:** Open `/Users/user/Airprosol/products catalogue/_covers/` once and keep it visible. Drag-drop is fastest.
- **Thumbnails too:** Open `/Users/user/Airprosol/web/public/products/` for thumbnail files (look for `*-thumb.png` ones).
- **Auto-save:** Gumroad auto-saves field changes. Cover/thumbnail uploads need an explicit Save click.

---

## After all 15 are uploaded

Run from the repo root:

```bash
bash /Users/user/Airprosol/scripts/gumroad-publish-all.sh
```

This re-enables every SKU that now has files attached.
