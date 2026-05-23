# Cold Outreach Library — 8 Patterns That Book Meetings

**Bonus to the Lead Generation Automation Playbook. Eight cold-outreach templates that have actually booked meetings for Aiprosol clients.**

Each pattern: a subject line + body + when to use + reply-rate baseline.

---

## Pattern 1 — The 30-second value claim

**When to use**: Targeting an ICP-fit prospect with a specific, plausible pain.

**Subject A**: 31 hours/week
**Subject B**: Quick maths on {{Company}}'s ops

```
Hi {{firstName}},

Quick maths: a {{employees}}-person ops team typically loses 31 hours/week
to {{specificTask — usually based on industry}}.

We've reclaimed that for {{IndustryPeerName}} ({{industry}}, similar size)
in the first 8 weeks. Average ROI in their first quarter: 340%.

Worth a 15-min check whether the same maths applies to {{Company}}?

— Srijan
Aiprosol · aiprosol.com
```

**Reply-rate baseline**: 7-12% on warm-fit lists, 2-4% on cold.

---

## Pattern 2 — The competitor switch

**When to use**: You know they're using a competing tool that's underperforming.

**Subject**: Switching away from {{CompetitorTool}}?

```
Hi {{firstName}},

Noticed {{Company}} is on {{CompetitorTool}}. Two questions:

1. Are you seeing the response-time improvements they promised?
2. If not, would you swap if the alternative was paid-per-result?

The reason I ask: 7 of our last 11 client wins came from {{CompetitorTool}}
fatigue. Happy to send the migration playbook either way.

— Srijan
```

**Reply-rate baseline**: 9-15% when competitor switch is real.

---

## Pattern 3 — The peer reference

**When to use**: You have a relevant peer customer in their industry/size band.

**Subject**: {{PeerCompany}}'s automation stack

```
Hi {{firstName}},

{{PeerCompany}} ({{industry}}, similar revenue band) consolidated 14 manual
processes into 4 automated workflows last quarter — reclaimed 35 hours/week
across the ops team.

Their CFO said the unblock was the discovery step, not the build. We took
6 days to document, 18 to deliver.

Would a 20-min teardown of how they did it be useful for {{Company}}?

— Srijan
```

**Reply-rate baseline**: 10-18% when peer is a strong proxy.

---

## Pattern 4 — The mutual connection

**When to use**: A 2nd-degree LinkedIn connection or a recent intro.

**Subject**: {{MutualContact}} suggested I reach out

```
Hi {{firstName}},

{{MutualContact}} mentioned you've been thinking about AI ops at {{Company}}.

I run Aiprosol — we design + build AI automation that reclaims 30+ hours/week.
Built it specifically for businesses your size who'd rather operate fewer
tools, not more.

Are you open to a 15-min chat next week? Any of Tuesday/Wednesday afternoon?

— Srijan
```

**Reply-rate baseline**: 25-40%. The mutual contact does the lift.

---

## Pattern 5 — The "I noticed" trigger event

**When to use**: They had a public signal (raised, hired ops lead, launched, etc.)

**Subject**: Congrats on the {{event}} — quick thought

```
Hi {{firstName}},

Saw {{Company}} {{specificEvent: e.g. raised $5M, hired a new Head of Ops}}.

In the first 60 days after that kind of step, most teams realise their
current tool stack won't scale. We typically meet you at that exact moment.

Worth a 15-min call before next week's headcount catches up to your
process? Calendar: {{calendlyLink}}.

— Srijan
```

**Reply-rate baseline**: 12-22% within 14 days of a real trigger.

---

## Pattern 6 — The contrarian opinion

**When to use**: You have an opinion that differs from the conventional advice.

**Subject**: Why most SMB AI projects fail (and the boring fix)

```
Hi {{firstName}},

Most SMB AI projects fail because the team picks the wrong tool first.

Three things that consistently work (the boring stuff): start with workflow
audit; pick AI in the loop, not on the trigger; measure time-to-output before
quality.

We've built this 19 times. Happy to walk you through the framework — no
agenda, no pitch.

20-min Tuesday afternoon? Calendar: {{calendlyLink}}.

— Srijan
```

**Reply-rate baseline**: 5-10%. Lower volume, higher quality replies.

---

## Pattern 7 — The pure question

**When to use**: When you genuinely want to learn (and not sell), early in a relationship.

**Subject**: Quick question on {{Company}}'s AI stack

```
Hi {{firstName}},

Quick question for research: how is {{Company}} currently thinking about
where AI fits in your ops? (Not pitching anything — I'm building a guide
for {{industry}} businesses your size and want to ground it in reality.)

Even a 2-line reply is helpful.

— Srijan
```

**Reply-rate baseline**: 18-30%. People love being asked.

---

## Pattern 8 — The PS-only

**When to use**: After 2-3 prior touches with no reply. Last attempt.

**Subject**: Closing the loop

```
Hi {{firstName}},

Going to stop the thread on my end — I know inboxes are noisy.

If AI automation is on the radar for the next quarter, the door's open.
If not, no follow-up.

— Srijan

PS: One thing that might be useful regardless — our ROI Audit form takes
60 seconds and returns a tailored automation map. Free, no email gate:
aiprosol.com/roi-audit
```

**Reply-rate baseline**: 5-8% as the breakup email. Often more than the first two combined.

---

## Personalisation tokens

Every template uses these variables. Replace before sending:

| Token | Source |
|------|------|
| `{{firstName}}` | LinkedIn / Apollo / Clearbit |
| `{{Company}}` | Same |
| `{{industry}}` | Apollo / their LinkedIn About |
| `{{employees}}` | LinkedIn employee count |
| `{{IndustryPeerName}}` | Your case-study library |
| `{{CompetitorTool}}` | Their public job posts / case studies |
| `{{MutualContact}}` | LinkedIn 2nd-degree |
| `{{specificEvent}}` | Crunchbase / news / their LinkedIn posts |
| `{{calendlyLink}}` | Your booking link |

---

## How to deploy

1. Pick 3 patterns matching your current pipeline shape
2. Build your token-lookup data source (Apollo, Clearbit, or manual sheet)
3. Wire each pattern into your outbound tool (Lemlist, Smartlead, manual Gmail)
4. Send to a 50-prospect batch
5. Measure reply rate after 5 business days
6. Double down on the highest-replying pattern; cut the others

---

## Don't

- Send all 8 patterns to the same prospect in sequence — comes off spammy
- Use templates verbatim — at minimum tweak one sentence per send
- Track open rates as a primary metric — replies are the only number that matters
- Continue sequences past 4 touches — every additional touch hurts your domain reputation

---

*Pair with the master 12-workflow n8n library in this Playbook (folder: `n8n-workflows/`). The "Cold reply → AI classify" workflow (file 08) auto-routes positive replies to your AE.*

Aiprosol · aiprosol.com
