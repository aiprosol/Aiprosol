# Aiprosol — 30-60-90 Day Post-Launch Plan

**Owner:** Srijan Paudel
**Created:** 2026-05-21
**Day 0 = today.** This plan sequences every queued initiative — press, directories, customer acquisition, Wikipedia, technical work — into a calendar so nothing fires out of order.

**Underlying assumption:** The site, agent infrastructure, schema, brand independence, and Wikidata entity graph are all complete. Day 0 starts with everything from this repo's READMEs/playbooks already shipped. Vercel auth + Bing token + headshot are the only remaining user-action blockers.

**Single thing that defines success:** Customer #1 (paying, on record, willing to be named) by Day 90. Everything else exists to make that more likely.

---

## Days 1–7 — Unblock + activate

**Theme:** Remove the autonomy blockers + push everything queued to production.

### Day 1
- [ ] `npx vercel login` with the patricorpglobal account → ships ~600 schema improvements (Round 2 deploy)
- [ ] Run `node scripts/audit-internal-links.mjs` to confirm 0 broken links post-deploy
- [ ] Run `node scripts/validate-schema.mjs` — expect warnings down from 1,355 → ~750

### Day 2
- [ ] Register Aiprosol Ltd at Companies House (£12, 10 min) — closes the legal-entity accuracy gap
- [ ] Once company number issued, add P5297 (Companies House ID) to Wikidata Q139821891

### Day 3
- [ ] Sign into bing.com/webmasters, copy the verification token, send to me — I add the env var + redeploy
- [ ] Submit sitemap to Bing Webmaster Tools manually
- [ ] Submit to Yandex Webmaster (free, similar flow)

### Day 4
- [ ] Upload a headshot to Wikimedia Commons (CC-BY-SA), claim P18 on Q139821959
- [ ] Verify Google Knowledge Graph shows the photo on a "Srijan Paudel" search within 7 days

### Day 5–6
- [ ] Approve or skip the n8n workflow open-source repo (staged at `/tmp/aiprosol-n8n-workflows/`)
- [ ] If approved: push to github.com/aiprosol/n8n-workflows + cross-link from llms.txt + .github profile README

### Day 7
- [ ] Review the live site end-to-end against `BRAND-VOICE-STYLE-GUIDE.md` — fix any voice slips on the canonical pages
- [ ] Send first monthly update via the template in `MONTHLY-UPDATE-TEMPLATE.md` (Month 1 intro format) to the initial 5-15 person list

**Success metric for Week 1:** All autonomy blockers removed. Round 2 deployed. First monthly update in inboxes.

---

## Days 8–30 — Discoverable + outbound active

**Theme:** Start the discoverability flywheel + run the CRO agent's outbound at meaningful volume.

### Day 8–10
- [ ] Activate the cold outreach sequence (`COLD-OUTREACH-SEQUENCE.md`) — first 25 prospects from a researched list
- [ ] Pin the Show HN draft from `OUTREACH-DRAFTS.md` — don't submit yet, but have it loaded in a ready-to-paste state
- [ ] Post LinkedIn launch update from Srijan's personal account (3-4 paragraphs, link to manifesto + agent dashboard)

### Day 11–15
- [ ] Pitch Sifted (UK/Edinburgh angle) using draft from `OUTREACH-DRAFTS.md`
- [ ] Pitch Practical AI podcast (`PODCAST-PITCH-LIST.md` Tier 1 #5)
- [ ] Submit Aiprosol to AI Agents Directory (free, requires account — user action)
- [ ] Submit to BetaList (free tier)

### Day 16–20
- [ ] Post the first Substack Chairman's Log (from `SUBSTACK-DRAFT-001-chairmans-log.md`)
- [ ] X thread amplifying the Substack post (one tweet linking, not a flood)
- [ ] Pitch Indie Hackers Podcast — Tier 1 #1
- [ ] Reach out to 3 specific advisors / supporters / Aiprosol-curious people directly with the manifesto link, asking for honest feedback

### Day 21–25
- [ ] Pitch Latent Space podcast — Tier 1 #2 (technical angle)
- [ ] Submit nomination for Forbes 30 Under 30 (if the annual cycle is open — typically July-September)
- [ ] Activate the next 25 cold-outreach prospects

### Day 26–30
- [ ] Send Month 2 update (last working day of the month, using `MONTHLY-UPDATE-TEMPLATE.md`)
- [ ] Tally outbound stats: reply rate, meetings booked, pilots in motion
- [ ] Re-audit live site for new SEO/GEO opportunities given new content surface

**Success metrics for Day 30:**
- 5+ cold-outreach replies (positive or "later")
- 1–2 podcast bookings secured (recorded or scheduled)
- 1 press pitch responded to (any direction)
- Show HN drafted + reviewer-ready, but not yet posted
- Customer #1 in active conversation (not necessarily signed)
- Round 2 + accessibility fixes shipped

---

## Days 31–60 — Press momentum + customer #1

**Theme:** Convert the inbound interest from Days 1-30 into press placements and customer #1.

### Day 31–35
- [ ] Show HN launch — pick a Tuesday-Thursday 9am-noon PT
- [ ] Have 2 hours blocked to respond to comments in real time (this is what makes HN work)
- [ ] Within 24h of HN: cross-post the discussion link to Aiprosol's Substack + LinkedIn

### Day 36–40
- [ ] Convert HN discovery traffic via the ROI Audit — measure CAC by funnel step
- [ ] Pitch The Information (`OUTREACH-DRAFTS.md`) — only if customer #1 has agreed to be named in conversations
- [ ] Apply for Indie Hackers Founder Community (good for warm intros even if you're not posting)

### Day 41–45
- [ ] Reddit posts in r/Entrepreneur + r/SaaS + r/AI_Agents (from `OUTREACH-DRAFTS.md` § Reddit playbook)
- [ ] Don't post all three on the same day — 3-7 days apart for each
- [ ] Pitch Cognitive Revolution podcast — Tier 1 #3

### Day 46–50
- [ ] First podcast recording (if anyone said yes from the Tier 1 pitches)
- [ ] Pre-call: review the recording prep checklist in `PODCAST-PITCH-LIST.md`
- [ ] Post-recording: thank-you email + ask host for permission to use any pull-quote in marketing

### Day 51–55
- [ ] Customer #1 kickoff call (if signed) — use `CUSTOMER-ONBOARDING-EMAILS.md` from Email #1
- [ ] If still not signed: review pipeline + adjust ICP based on actual cold-outreach data

### Day 56–60
- [ ] Send Month 3 monthly update — should include customer #1 (if signed) + podcast bookings + press momentum
- [ ] Re-run schema validator + accessibility audit + internal link audit (monthly hygiene)
- [ ] Tally Day 60 metrics — see "Success metrics" below

**Success metrics for Day 60:**
- 1 podcast recorded (Tier 1) + 1+ scheduled
- Customer #1 either signed (best case) OR in late-stage negotiation
- Show HN run complete (any outcome — front page or not, it's an artifact)
- 1 press response from Sifted/The Information (any direction — even "not now" is signal)
- 10+ cold-outreach replies cumulative
- MRR > $0

---

## Days 61–90 — Convert + compound

**Theme:** Turn one-off wins into compounding signals. Lock in customer #1, get the case study, set up the Wikipedia submission path.

### Day 61–65
- [ ] Customer #1 mid-engagement (Day 30 of their onboarding by now) — use Email #3 + #4 from `CUSTOMER-ONBOARDING-EMAILS.md`
- [ ] If podcast #1 has aired: pin it on X + LinkedIn for a week
- [ ] Pitch Knowledge Project + Cognitive Revolution if not already responded to

### Day 66–70
- [ ] Second Substack Chairman's Log post (from the 6 future post candidates in the Substack draft)
- [ ] First case-study-style blog post on aiprosol.com/blog about a learning from customer #1 (anonymous if not yet named)

### Day 71–75
- [ ] Pitch Lenny's Podcast (now you have customer evidence to anchor the product-management angle)
- [ ] Apply to Indie Hackers podcast a second time if first attempt didn't land
- [ ] Look for trade-press opportunities — Information Week, Computer Weekly, etc. (consulting-industry beat)

### Day 76–80
- [ ] Customer #2 in pipeline by now (if cold outreach + inbound is producing)
- [ ] Run pricing experiment if signal warrants (don't A/B without N > 5 customers minimum)
- [ ] Audit cost economics: should be tracking ~$5-50/mo per pilot at this scale

### Day 81–85
- [ ] Refresh `WIKIPEDIA-DRAFT.md` notability scorecard — count secondary sources accumulated to date
- [ ] If sources are 3+: prepare actual Wikipedia draft submission (`Draft:Aiprosol` on en.wiki)
- [ ] If sources are < 3: don't submit; identify which 1-2 sources still needed + which pitches go out next month to land them

### Day 86–90
- [ ] Customer #1 hits Day 90 reclaim audit (Email #7 from `CUSTOMER-ONBOARDING-EMAILS.md`)
- [ ] Send Month 4 monthly update — this is the milestone-heavy month
- [ ] Year-1 anniversary planning (Aiprosol founded April 14 2026 → April 14 2027 = Day 365)

**Success metrics for Day 90:**
- Customer #1 hit or exceeded their 35hr/wk reclaim target → the 90-day guarantee was met
- 2+ podcasts aired + 1 podcast scheduled
- 2+ press placements (any tier — even local UK papers count toward Wikipedia notability)
- MRR > $1,997 (= 1 Starter + 1 Growth plan minimum)
- Wikipedia draft within 1 source of submission-ready, OR submitted
- ~ 50-100 cold-outreach prospects touched total
- 1 named case study agreement secured (any customer who agrees to be public)

---

## Cross-cutting milestones (not tied to specific days)

| Milestone | Trigger to start |
|---|---|
| Wikipedia article submitted | 3+ secondary sources qualify; Day 90 earliest |
| Forbes 30 Under 30 nomination | When annual cycle opens (typically July-September); use draft in `OUTREACH-DRAFTS.md` |
| Trademark filing (UK / EU / US) | Whenever first customer signs an MSA — wait until legal entity has weight |
| Hire eleventh seat (likely CFO/COO) | When 5+ paying customers in flight; not before |
| Product launch #2 (after the original 19) | Q4 2026 at earliest; don't dilute the catalogue narrative |
| Open-source any other internal tool | Only if the maintenance cost is genuinely lower than the visibility gain |

---

## What's NOT on this plan (and why)

| Initiative | Why deferred |
|---|---|
| **Paid ads (Google / LinkedIn / Meta)** | Bootstrapped + CAC unknown until 10+ organic conversions analyzed |
| **VC fundraise** | Aiprosol's positioning depends on staying bootstrapped — the AI-led-operations story loses force with a $5M cheque |
| **Crypto / Web3 angles** | Off-brand; categorically reject |
| **AI consultancy partnerships** | Cannibalises our own service offer; defer until we're at scale to refer out overflow |
| **Geographic expansion** (specific UK / NA / APAC pushes) | Brand is "global / borderless"; explicit geographic targeting muddies that |
| **Sub-brand or product spin-out** | Single-brand discipline for at least year 1 |
| **Hiring beyond eleventh seat** | The whole differentiator is "one human + ten AI"; second human is a quality threshold, not a scaling lever |

---

## Re-planning triggers

Throw this plan out + replan in 24h if any of these fire:

- Customer #1 churns or refunds within 90 days → diagnose before continuing acquisition
- A press placement creates >10× normal inbound (front page of HN, mention in The Information, etc.) → drop everything and respond
- The Vercel/CI/agent infrastructure has a >24h outage → stabilise before any new initiative
- Wikidata Q-IDs are deleted/merged by an editor → reclaim or migrate before any external pitches
- Aiprosol.au sends a legal letter about the name → pause public outreach, get UK counsel involved

---

## Tools the user should actually use this with

- Drop the items above into your tool of choice (Notion / Linear / Things / a piece of paper). One tool. Pick now.
- Check off as you go. Visible progress > invisible progress.
- Don't pivot the plan mid-week unless a re-planning trigger fires. Pivot at week or month boundaries only.
- Re-read this plan at the end of Day 30 and Day 60. Update with what you've learned. The plan is a living artifact, not a contract.

---

## Versioning

| v | Date | Changes |
|---|---|---|
| 0.1 | 2026-05-21 | Initial 90-day plan |
