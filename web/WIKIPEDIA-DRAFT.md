# Wikipedia article drafts — Aiprosol (company) + Srijan Paudel (founder)

**Status as of 2026-05-21:** ⚠️ **DO NOT SUBMIT YET.** Neither Aiprosol nor Srijan Paudel currently meets Wikipedia's notability threshold ([WP:NCORP](https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)) for the company; [WP:BIO](https://en.wikipedia.org/wiki/Wikipedia:Notability_(people)) for the founder). Both drafts below are held for parallel submission once enough independent, reliable secondary sources exist. See the [Notability scorecard](#notability-scorecard) section for gating criteria.

**Why two drafts:** Wikipedia articles about companies often mention the founder briefly but don't require a standalone founder article. Conversely, a founder article needs independent coverage of the person, not just the company. We maintain both so when press arrives we can submit whichever the source coverage supports — or both, if multiple sources cover the founder specifically.

**Backing data already live:**
- Aiprosol: [Wikidata Q139821891](https://www.wikidata.org/wiki/Q139821891) — 34 claims, 34/34 referenced (100%), 11-language descriptions
- Srijan Paudel: [Wikidata Q139821959](https://www.wikidata.org/wiki/Q139821959) — 25 claims, 25/25 referenced (100%), 11-language descriptions
- Both entities are fully cross-linked via `sameAs` from /founder, /press, /about, and root Person/Organization JSON-LD on aiprosol.com

**When ready:** submit to the [Draft: namespace](https://en.wikipedia.org/wiki/Wikipedia:Drafts) via [Articles for Creation](https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation) (AfC). The AfC review queue typically runs 2-8 weeks. Direct submission to main namespace before AfC review is strongly discouraged; it usually results in speedy deletion under [CSD A7](https://en.wikipedia.org/wiki/Wikipedia:Criteria_for_speedy_deletion#A7._No_indication_of_importance_(individuals,_animals,_organizations,_web_content,_events)).

**Conflict-of-interest disclosure:** if the founder (Srijan Paudel) or any Aiprosol employee/agent submits this article, they must declare a [WP:COI](https://en.wikipedia.org/wiki/Wikipedia:Conflict_of_interest) on their Wikipedia user page and on the article talk page. Failing to disclose is the fastest way to get banned and the article deleted. Preferred path: ask an existing, established Wikipedia editor (3+ years of unrelated edits, autoconfirmed status) to review and submit on Aiprosol's behalf — they can be paid as a [WP:PAID](https://en.wikipedia.org/wiki/Wikipedia:Paid-contribution_disclosure) contributor if disclosed.

---

## Article — ready to copy into Draft:Aiprosol

```wikitext
{{Short description|British global AI automation consultancy operated by an AI C-suite}}
{{Use British English|date=May 2026}}
{{Use dmy dates|date=May 2026}}
{{Infobox company
| name              = Aiprosol
| logo              = 
| logo_caption      = 
| type              = [[Private company|Private]]
| industry          = {{ubl|[[Artificial intelligence]]|[[Business process automation]]|[[Management consulting]]}}
| founded           = {{Start date and age|2026|04|14|df=y}}
| founder           = Srijan Paudel
| hq_location_city  = [[Edinburgh]]
| hq_location_country = [[United Kingdom]]
| area_served       = Worldwide
| key_people        = {{ubl|Srijan Paudel ({{small|Founder & Chairman}})|"Arora" ({{small|AI Chief Executive Officer}})}}
| products          = {{ubl|Digital playbooks and prompt libraries|Managed AI automation plans|Done-for-you AI services}}
| services          = AI automation consultancy
| num_employees     = 1 human + 10 AI agents
| num_employees_year = 2026
| website           = {{URL|aiprosol.com}}
}}

'''Aiprosol''' is a global [[artificial intelligence]] automation [[consultancy]] founded on 14 April 2026 by Srijan Paudel.<ref name="about" /> The company is notable as the first publicly-operating proof-of-concept of an AI-led consultancy [[operating model]], in which ten [[AI agent]]s occupy named [[C-suite]] roles — coordinated by an AI [[chief executive officer]] called "Arora" — alongside a single human [[chairperson|Chairman]].<ref name="manifesto" /><ref name="agents-live" />

Aiprosol is headquartered in [[Edinburgh]], Scotland, with an operational office in [[Kathmandu]], [[Nepal]]. Its legal entity is Aiprosol Ltd, incorporated in the [[United Kingdom]].<ref name="about" /> The company sells AI automation in three tiers: self-serve digital products, managed monthly plans, and engagement-priced done-for-you services.<ref name="pricing" />

== History ==

Aiprosol was founded on 14 April 2026 by Srijan Paudel, who serves as the sole human in the company's leadership structure with the title Founder & Chairman.<ref name="about" /><ref name="founder-page" /> The company was incorporated in the United Kingdom as Aiprosol Ltd, with operations split between Edinburgh, Scotland and Kathmandu, Nepal.

Aiprosol's founding premise is that the operating roles of a small services business — sales, marketing, customer success, operations, technology, legal review, and analytics — can be filled by [[Large language model|large-language-model]]-driven [[AI agent]]s rather than human employees, with a single human serving as the governing approval authority.<ref name="manifesto" /> The agents run on a daily 09:00 [[UTC]] [[cron]] schedule and their operational state, last actions, and proposed tasks are publicly visible on the company's website, auto-refreshed every minute.<ref name="agents-live" />

== Founder ==

Aiprosol was founded by Srijan Paudel (born 2004), a [[Nepal]]i entrepreneur based in [[Edinburgh]], Scotland and [[Kathmandu]], Nepal.<ref name="founder-page" /> Paudel is an alumnus of [[Edinburgh Napier University]], where he completed his undergraduate degree.<ref name="founder-page" /> He serves as Founder & Chairman of Aiprosol and is the sole human member of the company's eleven-role C-suite, with operational leadership delegated to "Arora", the AI Chief Executive Officer.<ref name="manifesto" />

== Operating model ==

Aiprosol's operating structure comprises eleven C-suite roles: ten AI agents and one human Chairman. The AI agents and their designated functions are:<ref name="agents-live" /><ref name="manifesto" />

* '''Arora''' — AI Chief Executive Officer, responsible for strategy, customer-facing chat, and hourly operational summaries
* '''the COO''' — operations health, workflow monitoring, anomaly detection
* '''the CMO''' — content drafts, campaign briefs, brand voice enforcement
* '''the CCO''' — onboarding sequences, support triage, retention monitoring
* '''the CTO''' — code health, integration design, technical debt surfacing
* '''the CRO''' — cold outreach drafts, pipeline hygiene, lead scoring
* '''the CLO''' — legal review on contracts and public documents
* '''the CPO''' — partnerships and affiliate pipeline
* '''the CPM''' — product catalogue and pricing
* '''DA''' — data and analytics, KPI reporting

According to the company's published technical description, each agent produces structured [[JSON]] output validated by a [[Zod (library)|Zod]] schema, every output passes through a human approval gate before reaching external recipients, and every agent run is logged with full prompt, response, and parsed output for audit.<ref name="manifesto" />

== Products and services ==

Aiprosol's three commercial tiers, as published on its pricing page:<ref name="pricing" />

{| class="wikitable"
|+ Aiprosol commercial tiers
! Tier !! Price !! Description
|-
| Self-serve digital products || US$17 – US$397 || Playbooks, calculators, prompt libraries, n8n workflow templates
|-
| Managed plans (Starter / Growth / Enterprise) || US$997 / US$2,997 / US$7,997 per month || Done-for-you AI automation operated by Aiprosol
|-
| Done-for-you services || Engagement-priced || Eleven services including workflow automation, custom AI chatbots, AI lead generation, intelligent document processing, system integration, sales/marketing/customer-success automation, and AI training
|}

== Technology ==

Aiprosol's public technical disclosures describe a stack built on [[Next.js]] deployed on [[Vercel (company)|Vercel]], [[Supabase]] for data storage, [[n8n]] for workflow orchestration, and [[large language model]]s for the agent layer (frontier model for customer-facing chat, open-source fallback for bulk-work agents).<ref name="github-readme" /> The company maintains a public [[GitHub]] organisation and publishes an [[llms.txt|llms.txt file]] inviting [[Web crawler|AI web crawlers]] to index its content.<ref name="llms-txt" />

== Disambiguation ==

Aiprosol should not be confused with a separate Australian firm operating under the same trading name at the domain {{not a typo|aiprosol.au}}. The Australian firm is the legal entity Major Projects Consulting Partners Pty Ltd, based in [[Sydney]] and [[Queensland]], and focuses on AI consulting for the [[construction]] and [[engineering]] sectors.<ref name="aiprosol-au" /> The two companies share a name but have no corporate, ownership, leadership, or operational relationship.

== See also ==

* [[AI agent]]
* [[Business process automation]]
* [[Large language model]]
* [[Multi-agent system]]
* [[Management consulting]]

== References ==

{{Reflist|refs=
<ref name="about">{{cite web |title=About Aiprosol |url=https://aiprosol.com/about |publisher=Aiprosol |access-date=21 May 2026}}</ref>
<ref name="founder-page">{{cite web |title=Srijan Paudel · Founder & Chairman, Aiprosol |url=https://aiprosol.com/founder |publisher=Aiprosol |access-date=21 May 2026}}</ref>
<ref name="press-page">{{cite web |title=Press & Brand Kit — Aiprosol |url=https://aiprosol.com/press |publisher=Aiprosol |access-date=21 May 2026}}</ref>
<ref name="manifesto">{{cite web |last=Paudel |first=Srijan |date=17 May 2026 |title=We built a consultancy run by AI agents — an honest field report from the first 30 days |url=https://aiprosol.com/blog/we-built-a-consultancy-run-by-ai-agents |publisher=Aiprosol |access-date=18 May 2026}}</ref>
<ref name="agents-live">{{cite web |title=The AI C-Suite running Aiprosol |url=https://aiprosol.com/agents |publisher=Aiprosol |access-date=18 May 2026}}</ref>
<ref name="pricing">{{cite web |title=Aiprosol Pricing |url=https://aiprosol.com/pricing |publisher=Aiprosol |access-date=18 May 2026}}</ref>
<ref name="github-readme">{{cite web |title=Aiprosol on GitHub |url=https://github.com/aiprosol |publisher=GitHub |access-date=18 May 2026}}</ref>
<ref name="llms-txt">{{cite web |title=Aiprosol llms.txt |url=https://aiprosol.com/llms.txt |publisher=Aiprosol |access-date=18 May 2026}}</ref>
<ref name="aiprosol-au">{{cite web |title=AIPROSOL Australia (Major Projects Consulting Partners Pty Ltd) |url=https://aiprosol.au |publisher=Major Projects Consulting Partners Pty Ltd |access-date=18 May 2026}}</ref>
<!-- ADDITIONAL REFS REQUIRED — see Notability scorecard below
<ref name="techcrunch-2026">{{cite news |last= |first= |date= |title= |url= |work=TechCrunch |access-date=}}</ref>
<ref name="sifted-2026">{{cite news |last= |first= |date= |title= |url= |work=Sifted |access-date=}}</ref>
<ref name="hn-coverage">{{cite news |last= |first= |date= |title= |url= |work= |access-date=}}</ref>
-->
}}

== External links ==

* {{Official|https://aiprosol.com}}
* {{GitHub|aiprosol|Aiprosol}}
* [https://www.wikidata.org/wiki/Q139821891 Aiprosol on Wikidata]

{{Authority control |Q=Q139821891}}

[[Category:2026 establishments in Scotland]]
[[Category:Artificial intelligence companies]]
[[Category:British consulting firms]]
[[Category:Companies based in Edinburgh]]
[[Category:Consulting firms established in 2026]]
[[Category:Multi-agent systems]]
```

---

## Parallel Article — Draft:Srijan Paudel

Submit only if independent secondary sources cover Paudel **as a person**, not just as a quoted founder of Aiprosol. The bar for biography articles ([WP:BIO](https://en.wikipedia.org/wiki/Wikipedia:Notability_(people))) is higher than for companies. Most early-stage founders should NOT have a standalone article; one is appropriate once there is interview / profile coverage that frames Paudel personally — typically several months after the company gains its own coverage.

```wikitext
{{Short description|Nepali entrepreneur, founder of Aiprosol}}
{{Use British English|date=May 2026}}
{{Use dmy dates|date=May 2026}}
{{Infobox person
| name              = Srijan Paudel
| native_name       = श्रीजन पौडेल
| native_name_lang  = ne
| birth_date        = {{Birth year and age|2004}}
| birth_place       = [[Nepal]]
| nationality       = [[Nepal]]i
| occupation        = Entrepreneur
| years_active      = 2026–present
| known_for         = Founder of [[Aiprosol]]
| education         = [[Edinburgh Napier University]]
| residence         = [[Edinburgh]], [[Scotland]]
| website           = {{URL|https://aiprosol.com/founder}}
}}

'''Srijan Paudel''' ({{lang-ne|श्रीजन पौडेल}}; born 2004) is a [[Nepal]]i entrepreneur and founder of [[Aiprosol]], a global [[artificial intelligence]] automation [[consultancy]] notable for being the first publicly-operating proof-of-concept of an AI-led operating model.<ref name="founder-page" /><ref name="manifesto" />

== Early life and education ==

Paudel is a [[Nepali people|Nepali]] national.<ref name="founder-page" /> He completed his undergraduate degree at [[Edinburgh Napier University]] in [[Edinburgh]], [[Scotland]].<ref name="founder-page" />

== Career ==

In April 2026, Paudel founded Aiprosol, an [[Edinburgh]]-headquartered AI automation consultancy operated by an AI [[C-suite]] of ten AI agents alongside Paudel as the sole human Chairman.<ref name="manifesto" /><ref name="agents-live" /> Operational decisions are delegated to "Arora", the company's AI Chief Executive Officer, who handles strategy, customer-facing chat, and approximately 80% of day-to-day decisions; Paudel retains the human approval gate for all customer-facing outputs.<ref name="manifesto" />

Paudel writes regularly on [[AI agent|AI-agent]]-led operating models, [[agentic AI]] systems, and the practical economics of AI automation for [[small and medium-sized enterprise]]s. His essays include the founding manifesto, ''We built a consultancy run by AI agents — an honest field report from the first 30 days''.<ref name="manifesto" />

== Personal life ==

Paudel is based primarily in Edinburgh, Scotland, with an operational office in Kathmandu, Nepal.<ref name="founder-page" /> He speaks English and Nepali.<ref name="founder-page" />

== References ==

{{Reflist|refs=
<ref name="founder-page-sp">{{cite web |title=Srijan Paudel · Founder & Chairman, Aiprosol |url=https://aiprosol.com/founder |publisher=Aiprosol |access-date=21 May 2026}}</ref>
<ref name="manifesto-sp">{{cite web |last=Paudel |first=Srijan |date=17 May 2026 |title=We built a consultancy run by AI agents — an honest field report from the first 30 days |url=https://aiprosol.com/blog/we-built-a-consultancy-run-by-ai-agents |publisher=Aiprosol |access-date=21 May 2026}}</ref>
<ref name="agents-live-sp">{{cite web |title=The AI C-Suite running Aiprosol |url=https://aiprosol.com/agents |publisher=Aiprosol |access-date=21 May 2026}}</ref>
<!-- ADDITIONAL REFS REQUIRED — see Notability scorecard
<ref name="podcast">{{cite news |last= |first= |date= |title= |url= |work= |access-date=}}</ref>
<ref name="interview-2026">{{cite news |last= |first= |date= |title= |url= |work= |access-date=}}</ref>
-->
}}

== External links ==

* [https://aiprosol.com/founder Srijan Paudel — Founder page (aiprosol.com)]
* [https://www.linkedin.com/in/srijan-paudel Srijan Paudel on LinkedIn]
* [https://x.com/srijanpaudel6 Srijan Paudel on X (Twitter)]
* [https://github.com/srijanpaudel Srijan Paudel on GitHub]
* [https://www.wikidata.org/wiki/Q139821959 Srijan Paudel on Wikidata]

{{Authority control |Q=Q139821959}}

[[Category:2004 births]]
[[Category:Living people]]
[[Category:Nepalese businesspeople]]
[[Category:Alumni of Edinburgh Napier University]]
[[Category:Nepalese emigrants to Scotland]]
[[Category:Businesspeople in artificial intelligence]]
[[Category:Founders of artificial intelligence companies]]
```

---

## Notability scorecard

Wikipedia evaluates company articles against [WP:NCORP](https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)), which is **stricter** than the general notability guideline ([WP:GNG](https://en.wikipedia.org/wiki/Wikipedia:Notability)). The article must demonstrate:

| Criterion | Required | Aiprosol status (2026-05-18) | Notes |
|---|---|---|---|
| Significant coverage | Yes | ❌ None | Need feature-length pieces, not passing mentions |
| In reliable sources | Yes | ❌ None | Self-published doesn't count |
| Independent of subject | Yes | ❌ None | All current sources are aiprosol.com |
| Multiple sources | ≥3 | ❌ Zero | Two or more is the absolute floor; reviewers prefer 5+ |
| Sources are secondary | Yes | ❌ All primary | Press releases, interviews where the company speaks ≠ secondary |
| Sources are about Aiprosol specifically | Yes | ❌ None exist yet | Not "AI agents in general" mentions — articles where Aiprosol is the subject |
| Time-distributed sources | Helpful | n/a | Coverage over months/years > a single news cycle |

**Verdict:** 0/7 criteria currently met. Article would be **rejected at AfC** or **speedy-deleted** if submitted today.

### What counts as a qualifying source

✅ A feature article in [[TechCrunch]], [[Sifted]], [[The Information]], [[Wired]], [[The Times]], [[Fast Company]], [[Business Insider]], [[VentureBeat]], an industry analyst report (Forrester, Gartner, IDC, CB Insights)

✅ Academic citation in a peer-reviewed journal or conference paper

✅ Dedicated coverage in a recognised trade publication ([[Information Week]], [[Computer Weekly]], etc.)

✅ A book chapter or substantial book mention

❌ A Hacker News [[Show HN]] post (HN itself is user-generated)

❌ A Reddit thread

❌ A LinkedIn post

❌ A Twitter / X thread

❌ Aiprosol's own blog (primary source)

❌ A press release wire pickup (PRWeb, PR.com — these are paid placements, not independent)

❌ A podcast where the founder is interviewed and does most of the talking (primary)

❌ A directory listing (Crunchbase, AngelList, Wellfound — counts as listing, not coverage)

### Path to notability

Likely trajectory, given Aiprosol's positioning (AI-led operating model is genuinely novel):

| Phase | Estimated timing from launch | What needs to happen |
|---|---|---|
| **Show HN front-page run** | Day 60-90 | Reach front page; downstream pickups by journalists begin |
| **First trade-press piece** | Month 3-6 | Approach Sifted (UK startups), VentureBeat (AI), or The Information; pitch the operating-model angle |
| **First tier-1 piece** | Month 6-12 | TechCrunch / Wired / Fast Company — needs a hook (customer milestone, funding round, or specific data) |
| **Academic / analyst mention** | Month 12-24 | Forrester or Gartner reports on "agentic operations"; conference paper citing Aiprosol |
| **Notability bar cleared** | Month 12-24 | 3-5 independent secondary sources with substantial coverage |

**Recommendation:** Don't submit before Month 6, even if 2 sources exist by then. The AfC review queue rejects 50-70% of corporate submissions; resubmissions after rejection face higher scrutiny. Wait until the source set is unimpeachable.

---

## Submission process when ready

1. **Create a [Wikipedia account](https://en.wikipedia.org/wiki/Special:CreateAccount)** if you don't have one. Use a real-name account (not "Aiprosol123"); paid editing accounts are required to use a real name under [WP:U](https://en.wikipedia.org/wiki/Wikipedia:Username_policy).

2. **Make 10-20 unrelated edits over several weeks** before touching the Aiprosol draft. Fix typos in articles you find naturally. This establishes you as a real editor rather than an [WP:SPA](https://en.wikipedia.org/wiki/Wikipedia:Single-purpose_account) (single-purpose account), which AfC reviewers treat with suspicion.

3. **Declare COI and paid editing** on your Wikipedia user page if you are Srijan or an Aiprosol employee. Use [{{Paid|user= ... |employer=Aiprosol}}](https://en.wikipedia.org/wiki/Template:Paid).

4. **Create Draft:Aiprosol** at https://en.wikipedia.org/wiki/Draft:Aiprosol — paste the article body from this file. Include the AfC template at the top: `{{subst:submit}}`.

5. **Wait for AfC review.** Typical 2-8 weeks. Reviewer will either accept (article moves to mainspace), suggest changes (you revise, resubmit), or reject.

6. **If rejected once**, address the specific feedback and resubmit. If rejected twice, take it as confirmation that notability isn't yet established — wait for more sources before trying again.

7. **After acceptance**, do NOT edit the article yourself even to fix typos. Use the talk page to request changes from neutral editors. Direct editing by COI accounts post-acceptance is the fastest way to get the article reverted to a deletion discussion.

---

## What to do if the article gets nominated for deletion

Articles are sometimes accepted at AfC then later nominated for [WP:AfD](https://en.wikipedia.org/wiki/Wikipedia:Articles_for_deletion). If this happens:

1. **Do not edit-war.** Don't repeatedly remove the deletion notice. That gets editors banned.
2. **Respond on the AfD discussion page**, not on the article. Stick to citing additional sources you've found.
3. **Find more sources during the 7-day discussion window.** The AfD outcome is determined by source quality presented during the discussion.
4. **Accept the outcome.** If the article is deleted, you can request the source be userfied (moved to your user space) so you can keep working on it for future resubmission.

---

## Anti-patterns to avoid

These get articles deleted and editors banned. None of these are theoretical; all are common deletion reasons.

- **Listing Aiprosol's products and prices in detail.** Wikipedia is not a catalogue. Mention the three-tier structure once; don't enumerate every product.
- **Quoting marketing copy ("automate the boring, scale the important").** This is [WP:PROMO](https://en.wikipedia.org/wiki/Wikipedia:What_Wikipedia_is_not#Wikipedia_is_not_a_soapbox_or_means_of_promotion). Tone must be neutral and encyclopaedic.
- **Citing the company's own blog/website for non-trivial claims.** Primary sources are acceptable for uncontroversial facts (founder name, date, location) but not for any claim of significance ("the first AI-led consultancy", "operates at sub-$1k/mo").
- **Adding superlatives ("leading", "innovative", "best-in-class").** All removed by reviewers.
- **Including a list of competitors that positions Aiprosol favourably.** This is the comparison-page tactic and Wikipedia rejects it.
- **Inflating customer counts, revenue, or team size.** Verifiable falsehoods get articles deleted and editors blocked.
- **Submitting from a brand-new account with zero edit history.** Looks like SPA / [WP:UPE](https://en.wikipedia.org/wiki/Wikipedia:Undisclosed_paid_editing).
- **Failing to disclose COI.** This is the single most common cause of post-acceptance reverts.

---

## Wikidata cross-reference

Both Wikidata entities are now fully developed and ready to anchor the Wikipedia articles when they go live:

| Entity | Wikidata ID | Status (2026-05-21) |
|---|---|---|
| Aiprosol (company) | [Q139821891](https://www.wikidata.org/wiki/Q139821891) | 34 claims, 100% referenced, 11 multilingual descriptions, sitelinks awaiting first Wikipedia article |
| Srijan Paudel (founder) | [Q139821959](https://www.wikidata.org/wiki/Q139821959) | 25 claims, 100% referenced (including P21 male, P569 birth year 2004, P27 Nepal citizenship, P69 Edinburgh Napier alumnus, P512 bachelor's, P734 family name Paudel), 11 multilingual descriptions, sitelinks awaiting first Wikipedia article |

When the company article goes live, the `sitelinks.enwiki` field on Q139821891 should be set to the Wikipedia URL via `wbsetsitelink` — same pattern for Q139821959 when the founder article goes live. This closes the entity-graph loop in both directions (Wikidata → Wikipedia and Wikipedia ← Wikidata via `{{Authority control}}`).

---

## Source acquisition tracker

Tracked here so the user knows exactly which sources unlock submission. Filed by likelihood × impact.

### High-likelihood targets (next 60 days)

| Outlet | Hook | Why they'd cover | Status |
|---|---|---|---|
| **Sifted** (Financial Times-owned, UK startups) | "Edinburgh founder runs AI consultancy with one human and 10 AI agents" | UK-focused; founder-in-Edinburgh angle; novel operating model | Not contacted |
| **The Information** (premium AI/tech) | "Agentic operations in production — first publicly-running case study" | Their AI desk covers production agent deployments | Not contacted |
| **Pirate Wires / Newcomer** (newer outlets) | "Single-founder + AI C-suite as a business pattern" | Editorial appetite for unconventional operating models | Not contacted |
| **Hacker News** (Show HN) | Founder manifesto post — community discovery | The manifesto + live agent dashboard is HN-shaped | Drafted in OUTRANK-PLAYBOOK.md, planned ~Day 60 |
| **VentureBeat / The New Stack** | Technical depth on the agentic stack | Their AI infra coverage is friendly to operator-grade writing | Not contacted |

### Medium-likelihood (90–180 days)

| Outlet | Hook | Status |
|---|---|---|
| **TechCrunch** | First paying enterprise customer milestone | Needs customer #1 with permission to be named |
| **Wired** | Long-form profile on the operating model | Needs first piece elsewhere as proof point |
| **Fast Company "Most Innovative"** | Annual list submission | December cycle; one-shot timing |
| **Forbes 30 Under 30** | Founder profile | Paudel born 2004 → age 22 in 2026 → eligible. Nominate via [forbes.com/30-under-30](https://www.forbes.com/30-under-30/nominate-someone/) |

### Low-likelihood / opportunistic (12+ months)

| Outlet | Hook |
|---|---|
| Analyst report (Forrester / Gartner / IDC) on agentic operations | Cite Aiprosol as a production case study |
| Academic paper on AI-led organizations | Cite as primary-source case |
| Book chapter | "Cases in agentic-operations design" |

### Anti-targets — do NOT count toward notability

- Aiprosol's own blog (primary, not independent)
- Hacker News post itself (user-generated, not editorial)
- LinkedIn / X posts by Srijan or anyone else
- Crunchbase / AngelList / Wellfound listings (directories, not coverage)
- Paid press releases (PRWeb, PR Newswire, etc.)
- Podcasts where Srijan is the interviewed subject (primary, since the speaker is the company)
- AI tool directories (TAAFT, Futurepedia) — these are catalogues, not journalism

---

## Pre-submission checklist (when sources arrive)

When 3+ qualifying sources land, before submitting:

1. ☐ Update References section with proper `{{cite news}}` templates for each new source
2. ☐ Remove corresponding ❌ from the Notability scorecard above
3. ☐ Re-read both drafts and trim any remaining marketing tone (NPOV check)
4. ☐ Verify the company article does NOT mention specific dollar figures that have changed since draft creation (current: $997 / $2,997 / $7,997 plan tiers, $17–$997 product range)
5. ☐ Verify the founder article does NOT contain unverifiable biographical claims (everything in the draft today is already on Wikidata with citations)
6. ☐ Create a Wikipedia account (real name, not "Aiprosol123")
7. ☐ Make 10–20 unrelated edits over 2+ weeks to establish editor history
8. ☐ Declare COI on user page + article talk page
9. ☐ Submit to Draft:Aiprosol first; wait for AfC accept before submitting Draft:Srijan_Paudel
10. ☐ After acceptance: do NOT self-edit; use Talk:Aiprosol for any change requests

---

## Owner

This draft is maintained by: Aiprosol founding team. Review cadence: every 90 days, or whenever a new qualifying citation arrives.

| Review | Date | Changes |
|---|---|---|
| Initial draft | 2026-05-18 | Article + notability scorecard |
| Refresh #1 | 2026-05-21 | Updated to reflect 100%-referenced Wikidata on both entities; added Founder section to company article; added parallel Srijan Paudel draft; expanded source-acquisition tracker with named outlets + hooks; pre-submission checklist |

When a new qualifying source appears, update the `References` section above with the proper `{{cite news}}` template and remove the corresponding ❌ from the Notability scorecard. When the scorecard reaches 3+ ✅ on the "significant coverage" / "independent sources" / "multiple sources" rows, the article is submission-ready.
