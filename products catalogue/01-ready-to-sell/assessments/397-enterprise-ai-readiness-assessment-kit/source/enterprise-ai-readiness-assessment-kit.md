# The Enterprise AI Readiness Assessment Kit

**A 5-dimension, 50-question maturity model for enterprises evaluating AI adoption. Includes scoring rubric, gap-analysis template, executive briefing structure, and 12-month roadmap framework.**

Version 1.0 · 2026 · © Aiprosol Ltd

---

## Audience

This kit is for:
- **CIOs / CTOs / CDOs** building the case for AI investment
- **Heads of Transformation** running pilots before company-wide rollout
- **Strategy + Risk teams** assessing AI maturity across business units
- **Boards / executive committees** asking "are we ready, and where are the gaps?"

If you're a 5-50 person SMB, this kit is overkill — use the Business Process Audit Checklist ($37) instead. This is built for organisations of 200+ employees with multiple business units, regulated data, and formal IT governance.

---

## What's in the kit

1. **The 5-Dimension Maturity Model** — the framework for evaluating readiness
2. **The 50-Question Assessment** — 10 questions per dimension, 5-point scoring
3. **The Gap Analysis Template** — translating scores into concrete gaps
4. **The 12-Month Roadmap Framework** — what to do in months 0-3, 4-9, 10-12
5. **The Executive Briefing Structure** — how to present findings to the board
6. **The Pilot Selection Criteria** — picking the right first AI use case

The whole kit is designed to be run by an internal team in 4-6 weeks. If you want it run as a service, Aiprosol Enterprise plans deliver this as a 6-week engagement.

---

## Part 1 · The 5-Dimension Maturity Model

We assess AI readiness across five dimensions. Each is scored 1-5, where:

- **1 — Absent:** No formal capability or activity in this dimension
- **2 — Ad-hoc:** Sporadic, project-by-project, no strategy
- **3 — Defined:** Formal approach documented, partial implementation
- **4 — Managed:** Implemented across most of the organisation with governance
- **5 — Optimising:** Continuously improving, measuring, leading-edge

### Dimension 1 — DATA

Are you ready to feed AI?

- Single source of truth for major datasets
- Data quality measured and known
- Data lineage documented
- Data classification (PII, IP, public) enforced
- Master data management for entities (customers, products)
- Real-time data pipelines vs. batch
- Data team capacity vs. demand

### Dimension 2 — INFRASTRUCTURE

Can you run AI at scale?

- Cloud / on-prem strategy clear
- Compute (GPU) availability + cost control
- ML platform (MLflow, Vertex, SageMaker, custom)
- Vector storage / retrieval infrastructure
- Identity + access management for AI workloads
- Network / security architecture for inference endpoints
- Observability (logging, monitoring, alerting) for AI systems

### Dimension 3 — PEOPLE & SKILLS

Do you have the team?

- Senior AI/ML leadership in place
- Data science capacity vs. backlog
- ML engineering / MLOps capacity
- AI literacy among broader staff
- Change management capacity
- Hiring pipeline for AI roles
- External partnerships / vendor management

### Dimension 4 — GOVERNANCE & RISK

Can you deploy AI safely?

- AI ethics framework formalised
- Model risk management process
- Privacy + GDPR compliance for AI systems
- Bias / fairness monitoring
- Audit trail for AI decisions affecting customers
- Vendor due diligence for AI tools
- Incident response for AI failures

### Dimension 5 — ROI & VALUE

Are you measuring what matters?

- Business cases mandatory for AI investment
- Pre + post-deployment metrics tracked
- Cost-of-AI tracked at workload level
- Value delivered tracked (£, time, NPS)
- Sunk-cost discipline (kill underperforming AI)
- Portfolio view across all AI initiatives
- Comparable benchmarks

---

## Part 2 · The 50-Question Assessment

### DATA — 10 questions

1. We have a documented data strategy aligned with business strategy. *(1-5)*
2. Master data (customer, product, employee) is single-sourced. *(1-5)*
3. Data quality is measured continuously. *(1-5)*
4. Data lineage is documented for our top 20 data assets. *(1-5)*
5. PII and confidential data are classified and access-controlled. *(1-5)*
6. We have real-time data pipelines for at least 3 critical workflows. *(1-5)*
7. Our data team is staffed at industry benchmarks (1 data person per 50 employees). *(1-5)*
8. We have a vector / embedding infrastructure for semantic search. *(1-5)*
9. We can join data across business units when needed. *(1-5)*
10. Data is documented with metadata (definitions, owners, freshness). *(1-5)*

**Score interpretation:**
- 40-50: Optimising — your data is ready
- 30-39: Managed — minor gaps, mostly ready
- 20-29: Defined — significant data work needed before AI scales
- 10-19: Ad-hoc — fix data before doing AI; AI on bad data accelerates failure
- < 10: Absent — six months minimum of data foundation work first

### INFRASTRUCTURE — 10 questions

1. Our cloud strategy is documented and aligned with corporate strategy. *(1-5)*
2. We have an ML platform in production (MLflow, Vertex AI, SageMaker, Databricks, or equivalent). *(1-5)*
3. GPU availability + cost is tracked and controlled. *(1-5)*
4. AI inference endpoints are versioned, monitored, and rollback-able. *(1-5)*
5. We have a vector database in production. *(1-5)*
6. AI workloads run with same identity/access controls as production systems. *(1-5)*
7. AI systems have logging + alerting at the same level as core systems. *(1-5)*
8. We can spin up dev/staging/prod parity for AI. *(1-5)*
9. CI/CD applies to AI artefacts (models, prompts, weights). *(1-5)*
10. Disaster recovery covers AI systems. *(1-5)*

### PEOPLE & SKILLS — 10 questions

1. We have a head of AI / Chief AI Officer or equivalent in place. *(1-5)*
2. Our data science team is staffed for the workload. *(1-5)*
3. We have ML engineering / MLOps capacity. *(1-5)*
4. AI literacy training is mandatory for senior leaders. *(1-5)*
5. We have an enterprise change-management capability for AI rollouts. *(1-5)*
6. AI hiring is competitive (we win talent we want). *(1-5)*
7. We have at least 2 vetted external AI partners. *(1-5)*
8. Internal staff can self-serve basic AI tools. *(1-5)*
9. Cross-functional AI working groups exist. *(1-5)*
10. AI-related learning is tracked (training hours, certifications). *(1-5)*

### GOVERNANCE & RISK — 10 questions

1. AI ethics framework documented and signed off by board. *(1-5)*
2. Model risk management policy in place. *(1-5)*
3. AI privacy impact assessments are mandatory for new deployments. *(1-5)*
4. Bias / fairness monitoring runs for customer-facing AI. *(1-5)*
5. Every AI decision affecting customers has audit trail. *(1-5)*
6. AI vendor due diligence is documented and follows procurement standards. *(1-5)*
7. AI incident response playbook exists. *(1-5)*
8. Regulatory compliance (GDPR, EU AI Act, NIST AI RMF, etc.) is mapped. *(1-5)*
9. AI use cases are categorised by risk tier (high/medium/low). *(1-5)*
10. Board-level AI oversight is in place. *(1-5)*

### ROI & VALUE — 10 questions

1. Every AI investment has a written business case before approval. *(1-5)*
2. Pre + post-deployment metrics are mandatory. *(1-5)*
3. Cost of AI (compute, licences, headcount) tracked at workload level. *(1-5)*
4. Business value delivered tracked in £ / time / NPS / risk reduction. *(1-5)*
5. Underperforming AI initiatives are killed within 6 months. *(1-5)*
6. Portfolio view of all AI initiatives is reviewed quarterly by executive committee. *(1-5)*
7. We benchmark our AI ROI against industry peers. *(1-5)*
8. AI is in the operating budget, not "innovation" budget. *(1-5)*
9. Hidden costs (training data, integration, change management) are forecast. *(1-5)*
10. We can answer "what's our AI portfolio yield this quarter?". *(1-5)*

---

## Part 3 · The Gap Analysis Template

For each of the 5 dimensions:

1. **Score** (sum of 10 questions, max 50)
2. **Strengths** — questions where you scored 4 or 5
3. **Gaps** — questions where you scored 1 or 2
4. **Stranded mid-scores** — questions where you scored 3 (the "stuck in the middle" zone, often most actionable)
5. **Top 3 priority interventions** — what will move the score most for least cost

Output: a heat-map dashboard showing all 50 question scores at a glance + the priority intervention list.

---

## Part 4 · The 12-Month Roadmap Framework

### Months 0-3 — Foundation

If you scored < 30 on Data dimension:
- Stop adding AI. Fix data infrastructure first. Six months minimum work.
- Establish data ownership, MDM, classification.

If Data ≥ 30:
- Stand up the ML platform (if not already).
- Identify and approve 2-3 pilot use cases (low-risk, high-visibility).
- Train executive team on AI literacy (mandatory).
- Establish AI governance committee.

### Months 4-9 — Pilot + iterate

- Run 2-3 pilots end-to-end with measurement.
- Build out AI vendor portfolio (don't lock into one).
- Hire / contract critical roles based on Q1 gap analysis.
- Establish model risk management.
- First quarterly portfolio review.

### Months 10-12 — Scale + plan year 2

- Promote successful pilots to production.
- Kill underperforming pilots without ego.
- Document lessons learned.
- Plan year 2 portfolio with confidence intervals.
- Update governance based on year 1 incidents.

---

## Part 5 · The Executive Briefing Structure

For your board / executive committee briefing, structure exactly as:

### Slide 1 — Title + your name + date

### Slide 2 — The single-page summary

A radar chart showing your scores across 5 dimensions, vs. industry benchmark.

### Slide 3 — Where we are vs. where we should be

| Dimension | Current | 12-month target | Gap |
|---|---|---|---|
| Data | 32 | 42 | 10 |
| Infrastructure | 28 | 40 | 12 |
| People | 25 | 38 | 13 |
| Governance | 15 | 35 | 20 |
| ROI | 22 | 38 | 16 |

### Slide 4 — The cost of doing nothing

Compute the 12-month opportunity cost of NOT investing — based on internal benchmarks of current manual work + competitor automation activity.

### Slide 5 — The proposed investment

The 3-pillar plan: Foundation, Pilot, Scale. Each with budget, headcount, dependencies, deliverables.

### Slide 6 — Risk + mitigation

Top 5 risks (model failure, vendor lock-in, data breach, regulatory, cultural resistance) + mitigations.

### Slide 7 — The decision

What you're asking for: budget, headcount, governance approval. Be specific.

### Slide 8 — What success looks like in 12 months

Concrete deliverables. Concrete measurements. Concrete commitments.

### Slide 9 — Q&A / appendix

Detailed scores per question, vendor selections, governance committee charter.

---

## Part 6 · Pilot Selection Criteria

The single biggest predictor of an AI rollout's success: **picking the right first pilot.**

Score candidate pilots 1-5 across:

| Criterion | Why it matters |
|---|---|
| **Time-to-value** (1 = >12 months, 5 = ≤3 months) | Long pilots lose executive support |
| **Visibility** (1 = invisible to leadership, 5 = board-level) | Visible wins build momentum |
| **Reversibility** (1 = irreversible, 5 = easy rollback) | First pilot must allow rollback |
| **Data sufficiency** (1 = need to build pipeline, 5 = data already exists) | Avoid pilots that require 6 months of data prep |
| **Risk tier** (1 = high risk, 5 = low risk) | First pilot should be Low Risk |
| **Replicable pattern** (1 = unique, 5 = pattern reusable elsewhere) | Pilots that teach generalisable lessons |

A good first pilot scores 25+ across these 6 criteria.

**Common bad first pilots:**
- Customer-facing chatbot (high risk, irreversible if it fails)
- Predictive analytics on data you don't yet have
- "AI strategy" — not a pilot at all

**Common good first pilots:**
- Internal employee Q&A over your knowledge base (low risk, high visibility, replicable)
- Document classification for incoming mail (well-bounded, measurable)
- Sales meeting transcript → action items (clear ROI, low risk)

---

## Part 7 · Common Failure Modes

We've watched 30+ enterprise AI rollouts. The same failure patterns repeat:

1. **Skipping the data dimension.** Building AI on broken data foundations. Result: 6 months wasted.
2. **One-vendor monoculture.** Locked into one platform's idioms. Result: 18 months later a different vendor has the right tool but you can't move.
3. **Pilot purgatory.** 14 ongoing pilots, none promoted to production, none killed. Result: confusion, no ROI signal.
4. **Governance theatre.** Committee meetings with no actual decision authority. Result: production deployments without proper review, eventual incident.
5. **Innovation budget trap.** AI funded from "innovation" budget = not part of operating commitment = first to be cut. Move to operating budget Year 1.
6. **Underestimating change management.** Tooling rolled out, behaviour didn't change. Result: tools unused.
7. **Over-engineering the framework.** 200-page AI ethics policy written before any system shipped. Result: paralysis.

---

## Part 8 · The 6-week assessment timeline

If running internally, this is the realistic timeline:

| Week | Activity |
|---|---|
| 1 | Stakeholder kickoff. Distribute assessment to 10-15 senior staff across functions. |
| 2 | Score collection + reconciliation (1:1 follow-up where scores differ widely). |
| 3 | Gap analysis. Initial roadmap draft. |
| 4 | Stakeholder review + roadmap iteration. |
| 5 | Executive briefing prep. Pilot selection workshop. |
| 6 | Board presentation. Final roadmap published. Year 1 budget approved. |

---

## Bonus material — The downloadable scoring sheet

A separate `enterprise-ai-readiness-scoring.xlsx` workbook (in the same product folder when produced):
- 50-question scoring sheet with auto-aggregation per dimension
- Heat map visualisation
- Industry benchmark comparison
- Recommended-priorities sheet that updates from scores
- Roadmap template populated from results

> Note: The XLSX is a separate file — see `enterprise-ai-readiness-scoring.xlsx` in this product's folder. *(Currently to be generated — see external help section.)*

---

## What external help is needed for this product

- **A working .xlsx** with formulas + heat-map conditional formatting (~3 hrs of focused work; I can produce in a separate session if requested)
- **A real industry benchmark dataset.** Currently the kit references "industry benchmark" without backing data. To make it credible, we need to source a real dataset — Gartner CIO survey, McKinsey AI report, or run our own survey. **Recommendation:** Aiprosol commissions a 100-respondent survey of UK/EU/US enterprise CIOs in Q3 2026; results published as the canonical benchmark.

---

## Licensing

Licensed for internal enterprise use within purchaser's organisation, including use by external consultants engaged by the purchaser. Resale or republication of the maturity model or assessment requires written permission. © 2026 Aiprosol Ltd.
