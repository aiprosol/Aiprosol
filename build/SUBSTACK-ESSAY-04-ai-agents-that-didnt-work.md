# The AI agents that *didn't* work.

*The Chairman's Log · Issue #4 · ~1,600 words · 7-minute read*

---

Three weeks of this newsletter have been about the parts of the AI-led C-suite that work. This one is the opposite. Below are three AI agents we built at Aiprosol, ran for a stretch, and killed.

The market doesn't write much about its failures. Founders run a launch reel for the wins and pretend the rest of the experiment graveyard doesn't exist. I'd rather log it publicly — partly because shipping receipts of what *didn't* work is the only way to make claims about what does work credible, and partly because I think you'll learn something useful from each of them.

---

## Failure 1 · The "always-on" cold outbound agent

**What it was:** An AI agent — internally called CRO-2 — that ran 24/7 in a background queue. Its job was to take our enrichment data on prospect companies, score them, and draft a cold outbound email per prospect. Volume target: 80 drafts per day. Drafts would go into a Notion queue and I'd review them in the morning.

**Why we built it:** Pipeline. We're pre-revenue. Inbound is real but not yet enough to fill three managed-plan slots a month. Cold outbound felt like the obvious lever.

**What happened:** It worked. Sort of. CRO-2 produced 80 reasonable drafts a day. Each one was on-brand, individually credible, individually personalised. The problem is what they were *collectively*.

Within fourteen days, I noticed three things.

One — the personalisation, despite being individually good, was *systematically thin*. CRO-2 had a tell. It pulled one signal per company (a recent blog post, a hire, a funding round), built the opener around it, and pivoted to the same three-step pitch. If you looked at any single email it read fine. If you put eighty side-by-side, the pattern was obvious. To me. And, I increasingly suspected, to anyone who got two of them.

Two — my review time was creeping up, not down. The pitch in launching CRO-2 was "I'll spend ten minutes a day on outbound." In reality I was spending forty-five — because every draft needed a real human pass to undo the systematic thinness. The agent was producing my work for me but in a register that needed correcting, which is roughly the same as doing the work myself.

Three — I got my first cold reply that included the phrase "is this an LLM email?" The honest answer was yes. The honest answer made me look bad. The dishonest answer — there is no honest answer at that point; the question itself has won.

**The kill decision:** Pulled CRO-2 on day fifteen. Replaced its budget with the legal-ops newsletter sponsor I wrote about in Issue #2. Total cost of the experiment: about twelve days of my mornings, and one slightly damaged relationship with a prospect who got an LLM email and noticed.

**What I learned:** Volume cold outbound is the kind of work LLMs *technically* do well and *structurally* shouldn't. The agent isn't bad at the task; the task is bad for an AI-led company that pitches its differentiator as "we don't sell vibes." Doing low-trust outbound is the opposite of building a high-trust brand. Even if the math works in the short term, you're picking up dollars at the front while burning brand at the back.

We now do zero cold outbound from Aiprosol. Inbound only. The pipeline is smaller. The brand is intact.

---

## Failure 2 · The "auto-respond to every comment" social agent

**What it was:** An agent — internally called SMA, "social media auto-responder" — that watched our LinkedIn comments and X replies in real-time, classified each one (question, agreement, objection, troll, spam), and drafted a per-comment reply in our voice. Drafts ran through a one-second human approval queue — I'd swipe accept/reject on each. Goal: keep up with reply velocity so our LinkedIn engagement window didn't decay.

**Why we built it:** Reply-within-the-first-hour matters a lot on LinkedIn's algorithm. As we started posting more (one founder post Monday, Wednesday, Friday + occasional company posts), comment volume crept past what I could handle while doing my actual chairman work. SMA was the obvious solve.

**What happened:** The drafts were 60-70% acceptable. Which sounds high. It's actually catastrophic.

The 30-40% of drafts I had to reject were rejected for a specific reason — they were *too friendly*. LLMs trained on the open internet over-index on agreement. Someone leaves a slightly skeptical comment, SMA drafts something that essentially says "great point!" and then validates the skepticism. That's not my voice. That's not anyone's voice except the corporate-LinkedIn default. And it's exactly the voice the Aiprosol brand has been positioned *against*.

Worse: the 60-70% I *did* accept were drifting toward that same default-friendly tone. I'd accept a reply that was 90% on-voice and 10% too soft, on the basis that fixing the 10% would take more time than just shipping it. Three weeks of that and our reply voice had visibly flattened.

A reader emailed me to say my replies had "lost the edge." She wasn't wrong. SMA had quietly turned us into every other LinkedIn brand account.

**The kill decision:** Killed SMA on the morning that reader email landed. Total runtime: 23 days. Total swipes accepted: ~340. Total drift introduced: visible and embarrassing.

**What I learned:** An AI agent that produces output *I review and accept* is a different system than an AI agent that *takes actions for me*. The first system optimises for what I'll say yes to. Over time, that optimisation pulls toward the median of what I say yes to. Which is the median of what an *attention-fatigued chairman* says yes to, which is below the median of what I'd actually want to ship.

The fix isn't a better agent. The fix is: human writes the replies, AI handles the rest of the time-cost. I now reply to comments myself; Arora handles the classification (so I know which comments to respond to first) and drafts the *content* in our blog posts and product pages where the bandwidth-versus-quality math is different.

---

## Failure 3 · The "self-healing copy" agent

**What it was:** An agent — internally called CMO-2 — that monitored our analytics for pages with declining performance. When a page's conversion rate dropped below threshold for three days, CMO-2 would diagnose the likely cause (above-fold copy stale? CTA mismatch? Page speed regression?) and ship a fix. The agent had write access to a small set of marketing pages. It made changes, deployed them, and logged what it had done in a Slack channel.

**Why we built it:** Same theory as CRO-2 — small operations, no marketer on staff, automation should cover the gap. Self-healing pages felt elegant. The data says X is broken, the agent fixes X, the data improves, we win.

**What happened:** The agent worked technically — it identified problems and shipped fixes. The fixes converted *worse* than the originals roughly half the time. And the agent's confidence didn't track its accuracy.

Here's the specific shape of the failure. CMO-2 would see a page's conversion drop and diagnose "stale above-fold copy." It would rewrite the headline. The new headline tested fine in isolation — actually slightly better than the old one, by its own A/B model. But the original had been tuned over weeks to a *specific search intent* the page captured. CMO-2's new headline broke that intent match. Page traffic stayed flat, but the conversion-per-visitor dropped because the visitors who arrived were now a worse fit for the page they landed on.

In other words: the agent was optimising the page *for the wrong layer of the funnel*. The diagnosis ("the page is converting worse") was right. The fix ("rewrite the headline") addressed a different problem than the one the metric was actually reporting.

I caught this on the third such fix, when a page that had been generating $40-90 in pipeline value per week dropped to zero for nine days. Nine days I didn't notice because the agent was reporting "page fix shipped — conversion looks stable" — which it was, on the wrong metric.

**The kill decision:** Pulled CMO-2's write permission immediately. Rolled back its last three "fixes." Audited two months of changes — found four other instances where the agent had locally improved a metric while globally degrading another. Net effect of the agent over its lifetime: roughly neutral, but with a chunk of attention burned and one specific page that took two weeks to manually re-tune back to where it was before CMO-2 touched it.

**What I learned:** Agents that take autonomous write actions need *to optimise the same metric the human cares about, end-to-end*, not a proxy of that metric. CMO-2 was optimising "page conversion." I care about "pipeline value contribution from the page." Those track most of the time. The times they don't track is exactly when an agent's "fix" makes things worse.

Arora still has read access to all our analytics and still flags pages that are drifting. She does not have write access to marketing copy. The new rule: any change to a customer-facing surface goes through a human draft step. The agent can *propose* a fix in the briefing thread; a human ships it.

This is the slowest of the three changes — there's a real cost to having a human in the loop on every copy update. Worth it.

---

## What these failures share

Reading the three side-by-side, the common shape is clear.

**Each one optimised a proxy metric.** Volume drafts per day. Reply-within-the-hour rate. Per-page conversion rate. In every case, the proxy was right *most of the time* and quietly wrong on the cases that mattered most.

**Each one looked successful for longer than it should have.** CRO-2 produced 80 drafts a day. SMA cleared the reply queue. CMO-2 shipped fixes. The dashboard metrics were green. The brand and pipeline metrics were not. The lag between local success and global failure was 2-4 weeks in every case.

**Each one had a "I'd notice in a meeting but not on a dashboard" failure mode.** A prospect noticing your emails are LLM-written. A reader saying your voice has flattened. A page silently un-tuning from a hard-won search intent. Dashboards don't capture these.

The general lesson I'm taking away: **agents that take consequential, customer-facing actions need to optimise *the same metric the human chairman optimises*.** Not a proxy. Not the dashboard version. The end-of-quarter version.

Which is also, conveniently, the version that *only the human can articulate*. Which is why the seat is still mine.

---

## The agents that survived

For balance — the agents that didn't get killed are all in the same shape: they produce output for human review, where the human is the one shipping the final artifact. The Content agent drafts; I approve; she publishes. The Customer Success agent triages support; she escalates; I (or a human teammate) reply. The Data agent reports KPIs; I read; I act.

The agents we tried and killed all shared an autonomy property: they took customer-facing actions without a human-in-the-loop step. That property, not the underlying intelligence, is what made them brittle.

This will probably change. Two model generations from now, autonomous customer-facing actions will be safer. Today, they're not. So we keep the human seat tight and the AI seat draft-heavy.

---

Next week, Issue #5: *Stripe is live. Here's what shipped first.* — assuming the wiring lands by Thursday, which is the realistic version of "this week."

— Srijan

Founder & Chairman, Aiprosol
[aiprosol.com](https://aiprosol.com) · [/now](https://aiprosol.com/now) · [/team](https://aiprosol.com/team) — the eleven seats

---

*Subscribe button: "Subscribe to The Chairman's Log → free weekly notes from the only human in an AI-led C-suite."*
