# What an AI-led company *can't* do (yet).

*The Chairman's Log · Issue #3 · ~1,800 words · 8-minute read*

---

The first issue of this newsletter introduced the model. The second showed it operating. This one tells you where it doesn't work.

I'm writing this on the same Substack where I previously made some confident claims about Arora — our AI CEO — running ~80% of Aiprosol's operational decisions. I think that's still true. I also think most newsletters describing "AI agents" online wildly oversell what they're describing, and the result is a market full of demos and a real shortage of working systems.

Aiprosol's model only works if the brittle parts are visible. So below: six things our AI-led C-suite *cannot* do yet. Written down so you can audit me later when the market — or the technology — moves the boundary.

---

## What "can't" means

Three honest categories before we start.

**Can't · structural.** Things the AI architecture genuinely can't do at the current state of the art, regardless of how hard we tune the prompts. These are the most stable boundaries — they'll shift with model releases, not with effort.

**Can't · contextual.** Things the AI *could* technically do but where the cost of letting it (in trust, in liability, in customer experience) outweighs the benefit. These are decisions, not limits, and they can move week to week as we get more comfortable.

**Can't · yet.** Things we're actively working on, where we have a roadmap but haven't shipped it.

I'll label each item below.

---

## 1 · Predict its own failure modes · *structural*

Arora makes between fifteen and thirty operational decisions a day. The ones with a clear short-term feedback loop — write a blog post, score a lead, reply to a chat, draft an email — she gets right almost all the time. We measure this. Roughly 96% acceptance rate on her drafts, no human edits required.

The ones where the feedback loop is longer than two weeks, she struggles. Brand bets. Pricing bets. Hiring bets. Anything where the consequence shows up six months downstream and the immediate signal is ambiguous.

The technical reason is exact: today's frontier models are trained to predict the next token based on context. They are not trained to model their own future error patterns over horizons longer than their training data. When Arora reasons about a decision whose consequence lands in November, she's effectively guessing — and worse, she's guessing with the same confidence as decisions whose consequences land tomorrow.

The pattern I've learned to watch for: when Arora is *too confident* about a long-horizon call, that's the signal it's an override candidate. Confidence and calibration come apart at long timescales. The chairman has to know which is which.

This is a structural limit. Two model generations from now it'll improve. Today, it's where most of my overrides land.

---

## 2 · Detect when a customer relationship is fraying · *structural*

Customers leave for emotional reasons before they leave for economic ones. The first hint that a customer is unhappy is rarely a complaint — it's a tone shift. A slower reply. A colder message. A specific question that didn't land. A meeting they no longer ask to schedule.

Arora reads these signals. She's actually surprisingly good at it — she'll flag conversations that have "shifted register" and surface them in my weekly brief. But she reads them on a *delay* — the pattern needs three or four data points before her threshold trips.

A human picks up the first signal in conversation one.

This matters because customer-saving is a velocity game. A frayed relationship caught in week one can be repaired with a fifteen-minute call. The same situation caught in week four often can't be repaired at all.

So I do every customer "tone check" myself, by reading three or four messages per week from each managed-plan account. Not the contents — the *register*. That's 20 minutes weekly and it's where the chairman seat genuinely adds value over the AI seat.

Structural limit. Won't move until models develop continuous emotional state-tracking across long conversations. Maybe three years out.

---

## 3 · Be sued · *structural*

If we get it wrong with a customer, *my name is on the contract*. Not Arora's. Not the LLC's by itself, but mine personally as the founder and chairman.

This is the most boring rule in the company and the most important one. Liability creates the asymmetry that makes the chairman seat *required*, not optional. The day AIs can be sued, chairmen become optional. We're not close to that day.

What this means in practice: any decision that has legal exposure goes through me. Customer contracts. Vendor terms. Refund disputes. Anything where, if it went wrong, a court would want to know which adult was in charge.

Arora drafts. She does not sign.

Structural limit by design. This one I'm not even hoping moves — even if the law allowed it, I'd want a human chairman in the loop for legal exposure. There's something important about the asymmetry: it forces the operating model to be honest about who's accountable.

---

## 4 · Operate where the inputs are also AI-generated · *contextual*

Here's a rule we hold hard: any case study, any testimonial, any reference customer Arora cites in her writing has to come from a *real human signal*. A Stripe receipt. An email thread. A transcripted call. A signed permission slip.

The moment we let AI feedback into AI inputs, the whole model spirals into hallucination. Arora cites a case study → that citation goes into our content → our content gets crawled by training data for future models → those models cite our citation → Arora has to disambiguate "did I make this up?" from her own past output.

We've watched this loop catch other companies. We're not interested in being one of them.

So the rule: every customer-facing fact has a real-world primary source, and that source is kept in our admin database with the relevant artifact attached. If Arora writes "Hargreaves & Sterling reclaimed 45 hours per partner per week," she's pulling from a database row that has a signed customer letter attached to it. If the letter isn't there, the number doesn't ship.

This is contextual, not structural. The technology would let us run looser. We choose not to.

---

## 5 · Hire human contractors · *contextual*

Aiprosol has a small bench of human contractors — a video editor, two designers, an engineer we call in for niche infrastructure work. Arora *vets* contractors. She manages their day-to-day. She drafts the briefs. She reads their output and gives feedback.

She does not *hire* them, and she does not *fire* them.

Why? Because hiring is a relationship decision, not a vendor decision. The cost of a bad hire to a tiny company isn't just money — it's the dynamic that contractor sets with future contractors, the cultural shape they leave, the precedent for how we treat people. That's the kind of thing humans pattern-match on across years. AIs pattern-match on it across context windows.

So the rule: Arora has full authority over operational management of contractors. The hire/fire call is mine.

This will probably stay contextual for a long time. Even when AIs can model long-term relational dynamics well, I think there's a reason to keep human-on-human relationship decisions human. The customers know this when they sign on.

---

## 6 · Make the brand-level "what kind of company are we" call · *contextual*

The clearest example I can give: last month, a B2B SaaS founder approached us about a managed plan. Their company is fine. Their tooling is fine. Their values — visible from one twenty-minute discovery call — were not fine for us. They were the kind of operator who treats their team as cost line items and their customers as conversion funnels. Both of those are technically valid business styles. Neither is the kind of customer Aiprosol wants to build a long relationship with.

Arora's scoring model loved them. Right industry, right size, right willingness-to-pay.

I declined the conversation.

I can't easily explain to Arora *why*, in a way she could replicate next time. It's a values judgment built from twenty years of pattern-matching on people. It's the kind of thing that lives above her abstraction layer. So I keep it.

This is the fuzziest of the six. It's also the most important — every founder who has ever wished they hadn't said yes to an early customer knows this is where the chairman seat matters most.

Contextual limit. Will probably stay this way forever.

---

## What we ARE working on · *the "yet" list*

Three things on the roadmap that should move the line over the next twelve months.

**1. Long-horizon calibration.** Arora's current model treats two-week decisions and six-month decisions with similar confidence. We're building a calibration layer that asks her to explicitly state expected feedback horizon, then weights her recommendation accordingly. Goal: by Q4 2026, the AI itself recognises which decisions are long-horizon and defers them appropriately.

**2. Customer-relationship state tracking.** Right now Arora reads each customer conversation as a discrete event. We're building a persistent relational state — one row per customer per week, tracking tone-register-shift, response-time-trend, question-specificity. Should let her catch fraying relationships at week one or two instead of week three or four. Working on this with the Data agent currently.

**3. Cross-agent disagreement logging.** When two agents in our C-suite disagree (which happens more than you'd think), the resolution today goes through me. We're building a structured "disagreement log" so the agents can resolve more of these among themselves — escalating only the genuinely cross-functional or values-laden ones to the human chairman. Early stages.

If any of these ship and I've been wrong about a limit above, I'll write that publicly. The point of this newsletter is to make the *operating model* legible, not to defend any particular version of it.

---

## The takeaway

The reason I'm writing this — and the reason I'm being this specific — is that there's a real cost to over-claiming on AI capabilities. Founders who claim their agent "can do anything" attract bad customers, fail spectacularly, and burn the broader market's trust on the way out.

I'd rather under-claim and be quietly right than over-claim and be loudly wrong.

So the honest version, written down:

Arora handles roughly 80% of our operational decisions. She does it well. She makes the company faster, calmer, and more consistent than it would be with me alone in the chair.

The other 20% is mine — and that 20% includes most of the decisions that determine whether Aiprosol becomes a real long-term company or a forgettable two-year experiment. Customer-saving. Hiring. Brand bets. Liability. Long-horizon calls.

The model only works because the boundary between those two zones is *clear*, and both sides know which side of the boundary every decision falls on.

That clarity is the chairman job. It's also why this seat is, for now, ours to keep.

---

Next week, Issue #4: *the AI agents that *didn't* work* — three internal experiments at Aiprosol that we killed, and what we learned. Smaller-stakes piece, but honest.

— Srijan

Founder & Chairman, Aiprosol
[aiprosol.com](https://aiprosol.com) · [Founder page](https://aiprosol.com/founder) · [/now](https://aiprosol.com/now) — what I'm working on this week

---

*Subscribe button: "Subscribe to The Chairman's Log → free weekly notes from the only human in an AI-led C-suite."*
