# Founder brand · paste-ready assets

Twelve files. Each one is a single block of copy you paste into one external surface. The strategy doc that explains *why* and *when* is at `../FOUNDER-BRAND-CHAIRMAN.md` — open that first if you want context.

| File | Paste into | Time |
|---|---|---|
| `linkedin-headline.txt` | LinkedIn → profile → headline | 30s |
| `linkedin-about.txt` | LinkedIn → profile → about | 1 min |
| `linkedin-banner-prompt.txt` | Higgsfield / Midjourney / DALL·E → generate at 1584×396 → upload to LinkedIn | 5 min |
| `x-bio.txt` | X (twitter.com) → profile → edit bio | 30s |
| `x-pinned-thread.txt` | X → compose → post as thread → pin | 5 min |
| `x-header-prompt.txt` | Higgsfield / Midjourney → 1500×500 → upload as header | 5 min |
| `github-profile-readme.md` | Create a repo named `srijanpaudel/srijanpaudel` → drop this in as `README.md` | 2 min |
| `youtube-channel-description.txt` | YouTube Studio → Customize channel → Basic info → Description | 2 min |
| `email-signature.html` | Gmail → Settings → General → Signature → Insert HTML | 1 min |
| `boilerplate-50w.txt` | Podcast intros, "what should we say about you?" | — |
| `boilerplate-100w.txt` | Conference applications, guest-post bylines | — |
| `boilerplate-200w.txt` | Full-feature press, "about the author" book pages | — |
| `faceless-founder-mark-prompt.txt` | Higgsfield → 1080×1080 → use as profile photo across every platform | 5 min |

**Total time to ship every surface: ~30 minutes** (less if Higgsfield is already authed).

After every file is shipped, run the `aiprosol.com/founder` page in your browser and verify the `sameAs` array on the JSON-LD picks up the correct URLs. Inspect it with `view-source:https://aiprosol.com/founder` — search for `"sameAs"`.

---

**Brand-lock check before paste:** every file in this folder uses Arora (never "Mama" / "Claude") and `srijanpaudelofficial@gmail.com` (never `patricorpglobal@gmail.com`). USD only, no UK references in marketing voice. If you ever update content here, keep those locks.
