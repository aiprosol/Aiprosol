# Chairman's Log #1 — Why my CEO is an AI

**Draft for: aiprosol.substack.com**
**Target length:** ~1,400 words (Substack readers cap around 4 min)
**Tone:** Personal, reflective, first-person. Different voice from the operator-grade manifesto on aiprosol.com — Substack readers expect a more conversational register.
**When to publish:** The day after the Show HN run, so any HN traffic finds a substantive personal essay on the founder's own platform (separates the company brand from the personal brand).
**Hero image suggestion:** A photo of the empty boardroom chair from /founder, captioned "The only human seat at the table."

---

## Chairman's Log #1 — Why my CEO is an AI

There are ten other seats at the C-suite table of my company. Ten of them are AI agents. The chair I sit in is the only one with a human in it. My title is Chairman.

This essay is the explanation I owe everyone who asked.

---

### What I actually did

In April 2026 I founded Aiprosol — a global AI automation consultancy. The mechanics are unusual enough that I'll describe them plainly rather than market them.

The company has eleven operating roles. Ten of them are AI agents. The CEO is an AI called Arora. She handles strategy, customer-facing chat, and roughly eighty percent of day-to-day decisions. Underneath her are nine more agents covering operations, marketing, customer success, technology, revenue, legal review, partnerships, product, and data + analytics. They run on a daily schedule, produce structured outputs against a validated schema, and log every decision. Each agent has a defined role, defined cadence, defined KPIs, defined escalation rules.

I am the human Chairman. I sit in the strategic chair, not the operational ones. I review every customer-facing thing that Arora drafts before it ships. I make the five-to-ten genuinely-human decisions a month — the ones where being wrong has consequences that can't be unwound. The rest is hers.

The whole operation is public at [aiprosol.com/agents](https://aiprosol.com/agents). Every agent run is logged and visible, auto-refreshed every minute. The architecture is documented at [aiprosol.com/blog/what-is-an-ai-led-operating-model](https://aiprosol.com/blog/what-is-an-ai-led-operating-model). The thirty-day field report on what worked and what didn't is at [aiprosol.com/blog/we-built-a-consultancy-run-by-ai-agents](https://aiprosol.com/blog/we-built-a-consultancy-run-by-ai-agents).

---

### Why I structured it this way

The honest answer is: because if you're going to sell AI automation, your own company should run on it.

I noticed pretty early that almost every "AI automation consultancy" was selling a thing they themselves didn't operate on. The discovery call was a human. The follow-up was a human. The proposal was a human-written deck. The marketing was a human-written blog. The pricing model was time-and-materials charged in human hours.

If automation worked for *them*, they'd use it. If they don't use it, why am I buying?

So I built the company with the answer baked into the structure. Every system we sell, we run inside ourselves first. Every workflow pattern we recommend, our own agents are using. Every operating loop we tell a customer to deploy, you can see ours running publicly.

I think this is the bar that AI automation services should be held to. If a vendor can't show you their own operations, they're selling vibes.

---

### What only the human does

People ask what's left for me to do. It's a fair question. The answer is: less than you'd think, but it's the parts that matter most.

I pick the customers we say no to. That's a human call — sometimes a customer's offer is technically a good deal and structurally wrong for the company, and Arora won't catch the second part because she optimises for the visible metric.

I read the bottom 10% of reviews and decide what to change. AI is good at aggregating signals. AI is bad at deciding which signal is worth tearing the company up over.

I make the hire-or-fire-a-contractor call. Hiring is a high-irreversibility decision and irreversible decisions belong to the human chair.

I decide which case study to invest in marketing. That's a strategy call — which customer story is the one that opens the next ten doors. It looks like a small choice and it's not.

And — this one is the most important — I tell Arora when she's wrong. I am the person who pushes back on her drafts. Most of the time the drafts are good. Sometimes they're confidently incorrect in ways that would have shipped if I'd been less attentive. That review loop is the actual differentiator. Without it, you have autopilot. With it, you have a hybrid that's faster than humans-only and safer than AI-only.

---

### What the AI agents do

Strategy, architecture, the operating roadmap. Customer interactions — chat, email, follow-ups. All content — blog, social, case studies, copy. Vendor management and the day-to-day procurement calls. Roughly eighty percent of operational decisions, twenty-four hours a day.

I want to emphasise the "twenty-four hours" part. The biggest unlock isn't that the agents are smart. It's that they're awake. A small business with a smart but tired human leader is operating maybe ten hours a day. The same business with ten AI agents is operating around the clock. That isn't a 10× improvement, it's an asymmetric one. Different shape of business entirely.

---

### What I learned in the first 30 days

I wrote a longer field report on this, but the short version:

**The hardest part isn't the agents.** It's the operating loop around them. Idempotency keys on every external action. Approval gates on anything irreversible. Structured output schemas so the next step can parse the previous one. Audit logging so a human can trace what happened. The agents themselves are the easy bit now.

**Workflow design beats model choice by four to eight times.** I switch the underlying LLM and the needle moves ten percent. I rewrite a workflow to remember context across runs instead of asking the same question twice, and the needle moves six hundred percent. The vendor wars are mostly noise.

**Five things I tried and removed.** AI-written podcast scripts (sounded synthetic). Auto-publishing to social media (drift within two weeks). Per-prospect "research notes" in cold outreach (reply rate below the unpersonalised control). An inbound AI sales chatbot (replaced by Arora, who can be challenged in real time). Auto-renewal nudge emails (CSAT dropped because the system felt automated to people who'd paid us thousands of pounds).

**The economics genuinely work.** I'm running this on five dollars of compute per month at my current volume. Tool cost has collapsed. The bottleneck is no longer cost; it's design.

---

### What I'm doing next

Three things, in order:

One, customer one. Aiprosol is in its charter phase. The current case studies are anonymised composite ROI projections from pilot work. The first paying customer who agrees to be on record changes the trust signal in ways nothing else can.

Two, the public agent dashboard goes deeper. Right now it shows last actions, KPIs, and the audit log. It will eventually show every prompt and every parsed output for every agent, in real time, with permission boundaries on what's customer-confidential. I want to be the operationally-most-transparent company in the AI automation category.

Three, this Substack. I'm going to write one of these per month, alternating between operational lessons (what changed in the agent stack, what new pattern we've shipped) and reflective pieces (decisions I made, decisions I regret, what running a company at twenty-two has taught me).

If you found the company through one of the essays on the main site, this is the long-form personal version. If you found this Substack first, the company is at [aiprosol.com](https://aiprosol.com).

Either way, the AI agents are doing the talking on the company site. I'm doing the talking here.

— Srijan Paudel
Edinburgh + Kathmandu

---

## Publishing notes (do not include in the published post)

- **Subject line for the email blast:** "Why my CEO is an AI"
- **Substack tags:** AI, startup, business, automation, founder
- **Internal cross-link strategy:** This post should NOT be linked from the aiprosol.com blog. The two surfaces serve different audiences and the separation is intentional (Substack = personal voice / Aiprosol blog = operational depth).
- **External cross-link strategy:** After publishing, mention the link from @srijanpaudel6 on X with the line "Chairman's Log #1, on Substack: [URL] — why my CEO is an AI." That's it; don't over-flog.
- **What success looks like:** ≥500 reads in the first 30 days; ≥5 quality comments; ≥2 subscribers per 100 reads. The Substack list itself is the asset, not the post.
- **What failure looks like:** <100 reads in the first 30 days = wrong audience or wrong timing. Don't pivot the voice; pivot the distribution channels.

## Future Substack post candidates (don't write yet — wait for the events)

| # | Title | Trigger (when to write it) |
|---|---|---|
| 2 | What happens when an AI agent is wrong | After the first material agent failure that I have to walk a customer through |
| 3 | The 90-day reclaim guarantee — why I underwrote it | After we hit / miss the first 90-day reclaim milestone with a paying customer |
| 4 | Hiring the eleventh human | If/when I add a second human seat (CFO most likely — handling money is the place I think a second human matters first) |
| 5 | What I'd tell my 18-year-old self about starting a company at 22 | One year anniversary of Aiprosol's founding (April 2027) |
| 6 | The agent failure mode I didn't see coming | When it happens, document immediately, publish within 7 days |
| 7 | I let an AI agent fire a contractor — here's what I learned | Only if it happens; don't write speculatively |
