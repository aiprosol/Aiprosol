# Distribution templates — paste-ready

Companion to the approved plan at `~/.claude/plans/jaunty-baking-toucan.md`.
Every template below is brand-locked (USD, global, Arora not "Mama" / "Claude") and calibrated to your actual status (pre-revenue, second-year CS at Edinburgh Napier, illustrative case studies until pilots ship).

---

## Tier 1B · Hacker News "Show HN" submission

**Submit at:** https://news.ycombinator.com/submit
**Best time:** Sunday 17:00–20:00 UTC (peak HN traffic window for non-US-business-hours audiences)

**Title (use exactly — HN title etiquette is strict):**
```
Show HN: I let an AI run my company. Here's what happened.
```

**URL:** the published Substack URL of Essay #1 (`srijanpaudel.substack.com/p/why-my-ceo-is-an-ai` or similar)

**First comment to leave on the thread within 5 min of submission** (HN convention — frame what's going on):
```
Author here. I'm a second-year CS student at Edinburgh Napier building Aiprosol — an AI automation consultancy where the "CEO" role is filled by an AI agent (Arora) coordinating ten other agents, with one human chairman seat (me). This essay is the first issue of my Substack documenting how that actually works day-to-day.

Specifically interested in feedback on:
1. The four-component agent framework (named roles + structured outputs + audit logging + human approval gate) — is this what "AI-led" should mean, or should the bar be higher?
2. What I haven't yet figured out — long-horizon calibration, customer-relationship state tracking, cross-agent disagreement resolution. Anyone solved these in production?

Happy to share any specific implementation detail. Live agent dashboard: aiprosol.com/agents
```

**Reply duty for the first 60 min:** Answer every comment substantively. Don't link-drop. Don't get defensive on skeptical takes — engage with the strongest critique honestly.

---

## Tier 3A · Cold-email batch for Edinburgh SMB pilots

**Subject line A** (test against B):
```
Free AI pilot — Edinburgh CS student offering
```
**Subject line B** (alternative):
```
1 free workflow automation — exchange for case study
```

**Body template (mail-merge-able):**
```
Hi {{first_name}},

I'm Srijan, a CS undergrad at Edinburgh Napier building Aiprosol — a small AI automation studio I run on the side. We're operationally led by an AI agent (Arora) and I oversee.

I'm offering ONE free workflow automation to 10 Edinburgh businesses in exchange for case-study rights (anonymous or named, your call). The goal on my end is real receipts, not theoretical demos.

If interested, just reply with which one repetitive workflow eats your team's most hours — anything from {{example_use_case_for_industry}}. I'll write back the same day with a 1-paragraph scoping note. No call required to find out if it's a fit.

If not for you but you know someone whose team is drowning in admin, forwarding is appreciated.

Best,
Srijan Paudel
Founder, Aiprosol — aiprosol.com
linkedin.com/in/srijan-paudel
```

**`example_use_case_for_industry` swap list:**
- Law firm: contract review, intake triage, billable-time logging
- Real estate agency: lead response, listing distribution, viewing-scheduling
- Accounting practice: month-end reconciliation, client onboarding, expense categorisation
- E-commerce single-location: support deflection, returns workflow, supplier-restock pings
- Marketing/design agency: client reporting, social scheduling, proposal drafts
- Recruitment agency: candidate sourcing, intake screening, follow-up cadence

**Target picklist — 100 Edinburgh SMBs, by category (aim for ~16 per category):**
- Law firms 5–20 partners (Google: "small law firm Edinburgh")
- Independent real estate agencies (Google: "estate agent Edinburgh independent")
- Accounting practices ≤ 20 staff (Google: "chartered accountants Edinburgh")
- Independent e-commerce / single-location retail
- Boutique marketing / branding agencies
- Recruitment agencies < 30 staff

**Use:** LinkedIn Sales Nav free trial OR https://hunter.io free tier OR Apollo.io free tier to get emails. Cap outbound at 25/day to stay under spam thresholds.

**Tracking:** Use a single Google Sheet with columns: Company / Contact / Industry / Email Subject / Sent date / Reply (Y/N/maybe) / Pilot in flight (Y/N) / Outcome.

---

## Tier 4A · DM template for AI-niche thought leaders

**Targets** (DM on X first, fall back to LinkedIn if no X presence):
1. **Swyx (Shawn Wang)** — @swyx — Latent Space podcast
2. **Ben Tossell** — @bentossell — Ben's Bites newsletter
3. **Dan Shipper** — @danshipper — Every / Chain of Thought
4. **Sahil Lavingia** — @shl — Gumroad / indie founder
5. **Pieter Levels** — @levelsio — Nomad List / build-in-public OG
6. **Lenny Rachitsky** — @lennysan — Lenny's Newsletter
7. **Olivia O'Sullivan** — @oliviaossullivn — AI ops adjacent
8. **Eugene Yan** — @eugeneyan — applied ML, agent thinking
9. **Linus Lee** — @thesephist — agentic UX
10. **Reid Hoffman's network adjacents** (Greylock, Charlie Songhurst's circle)

**DM template:**
```
Hey {{first_name}} — caught your post on {{recent_post_topic}}. Your point about {{specific_takeaway}} hit something I've been wrestling with.

I'm building Aiprosol — a consultancy where the CEO is an AI agent and I'm the only human seat. Just published the first issue of my Substack documenting how it actually works ("Why my CEO is an AI"): {{substack_url}}

No ask — just figured you'd find the underlying agent framework interesting. Would value your read if you have 8 min. Honest critique especially welcome.

— Srijan
```

**Critical rule:** **No ask for retweets / shares / introductions.** The template ends "no ask." Recipients are tired of asks. 1 in 10 will engage organically — that's the play.

---

## Tier 4B · DM template for Substack recommendation exchange

**Targets** (mid-sized Substacks in adjacent niches, 500–10k subs):
1. **Working Theorys** (Jasmine Sun) — AI + tech culture
2. **Latent Space** (Swyx) — AI engineering
3. **The Generalist** (Mario Gabriele) — early-stage strategy
4. **Not Boring** (Packy McCormick) — adjacent, larger but worth trying
5. **Stratechery-adjacent indies** (smaller pubs in same niche)
6. **Indie writers in AI ops / agentic systems** — search Substack discover under "AI agents"

**DM template (use Substack's DM, NOT email):**
```
Hi {{name}} — fellow Substack writer here. Just published the first issue of The Chairman's Log (srijanpaudel.substack.com) — field notes from running an AI-led automation consultancy as the only human at a 10-AI-agent C-suite.

Audience overlap with yours feels real (both reading the {{adjacent_topic}} space). Would you be open to a Recommendations exchange? I'll recommend you on my Subscribe modal if you do the same for me. No long-term commitment — we can swap recs in for the first month and re-evaluate.

— Srijan
```

**Critical rule:** Only DM Substacks whose audience genuinely overlaps. Spamming irrelevant recs costs you both reputation.

---

## LinkedIn comment-marketing playbook (Tier 2A)

**Daily rule:** 10 thoughtful comments before any of your own posts. Find posts via:
- LinkedIn search: "AI agents" / "AI-led" / "automation consultancy" / "indie founder"
- Topics you follow: AI, Automation, Startups, Founders
- People you should follow (start with the Tier 4A list)

**Comment formats that work:**
1. **Specific question:** "Did you find {{specific_thing}} held up at higher scale, or just at the demo level?"
2. **Counter-data:** "On our end {{specific_number from your own ops}} — slightly different from your read. Curious if industry matters."
3. **Concrete add:** "One thing we do that overlaps — {{specific_pattern}}. Saved {{specific_thing}}."
4. **Honest disagreement:** "Strong take. The pushback I'd offer: {{specific_critique with reasoning}}."

**Comment formats to AVOID:**
- "Great post!"
- "Love this!"
- Anything with a 🔥 / 🚀 emoji
- Self-promotional pivots ("Speaking of which, I built X...")

**Aim:** Each comment 30–80 words. Engage with replies to your comment. Don't tag yourself in. The point is the post-author's followers reading your comment and clicking your name.

---

## Daily X / build-in-public template (Tier 2B)

**Format:**
```
Day {{N}} of building Aiprosol publicly.

Today: {{ONE specific micro-update — what shipped, what broke, what surprised}}

{{ONE concrete number}}

{{Optional: ONE open question for the audience}}
```

**Examples:**
```
Day 47 of building Aiprosol publicly.

Today: shipped a cold-email batch to 25 Edinburgh law firms offering a free workflow pilot. 

Response rate target: 8%. Will report Friday.

Anyone here pitched SMBs as a student-founder? What worked?
```

```
Day 48.

Arora (our AI CEO) drafted a customer reply that I overrode this morning. She wanted to mention a case study I haven't independently verified yet. Cut it.

Big-feeling moment: discovering my own AI was about to LARP credibility.

Lesson logged in our internal "what Arora doesn't get yet" doc.
```

Weekly hashtag: `#buildinpublic` (Tuesday) + `#AIagents` (Friday).

---

## Status as of this drop

✅ Substack publication "The Chairman's Log" live at srijanpaudel.substack.com
✅ Essay #1 ("Why my CEO is an AI") published
✅ About page brand-aligned
✅ Welcome email brand-personal
✅ LinkedIn headline updated (founder-first hybrid)
✅ LinkedIn URL synced across codebase (linkedin.com/in/srijan-paudel)
✅ Essay #1 staged as LinkedIn draft article at /article/edit/7463064651216347136/

⏳ Pending you:
- Open LinkedIn draft (URL above) → apply Style → Heading 2 to section headers in the body → swap `--` → `—` if desired → upload cover image → hit Next → Publish
- Submit Essay #1 to Hacker News (use templates above)
- Cold-email batch 1 (25 SMBs from picklist)
- DM 5 thought leaders + 3 Substack writers (use templates above)
- Apply to Bright Red Triangle + Entrepreneur First
- Claim Indie Hackers + BetaList directories
- First Edinburgh CodeBase meetup
