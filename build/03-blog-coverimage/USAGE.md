# PHASE 0.5 · Blog `coverImage` Bulk Fix · Usage

This is a Wix Velo backend script that one-shot fixes all 19 blog posts where `coverImage` is stored as `{ stringValue: "..." }` instead of a plain URL string.

## What you do

### 1. Place the file in your Wix Vibe project

In the Wix Vibe editor file tree, create:

```
backend/
  blogCoverImageFix.web.js   ← paste contents from this folder
```

If the `backend/` folder doesn't exist, create it (Wix recognises it).

### 2. Save & deploy the backend file

Wix Vibe rebuilds backend automatically once saved.

### 3. Run a PREVIEW first (recommended, no writes)

In a frontend page (e.g., the existing `/_audit` page or any temporary admin page), add a button that calls:

```tsx
import { previewBlogCoverImageFix } from 'backend/blogCoverImageFix.web';

const onPreview = async () => {
  const out = await previewBlogCoverImageFix();
  console.log(out);
  alert(`Would fix ${out.wouldFix.length} items. ${out.alreadyOk.length} already OK. ${out.noUrl.length} missing URL.`);
};
```

Open browser dev tools → console → click the button → confirm the count looks right.

### 4. Run the actual fix

Same setup, just call `fixAllBlogCoverImages` instead:

```tsx
import { fixAllBlogCoverImages } from 'backend/blogCoverImageFix.web';

const onFix = async () => {
  const out = await fixAllBlogCoverImages();
  console.log(out);
  alert(`Fixed ${out.fixed.length} of ${out.total}. ${out.errored.length} errored.`);
};
```

Confirm in the console: total, fixed, already-ok, errored counts. Refresh `/blog` — every post should now render its cover image.

## How safe is this?

- **Idempotent** — re-running it does nothing for items already fixed.
- **Scoped** — only touches the `coverImage` field; every other field on the item is preserved (uses `wixData.update` which sends the whole item back).
- **Logged** — every fixed item is reported by `_id` and title.
- **Reversible** — if anything looks wrong after running, the original raw value is in the audit JSON output. You can restore from there.

## What if a post errors?

Most likely cause: the post has additional fields (e.g., a reference field) that Wix wants formatted in a specific way for `update`. The error message will tell us — paste the `errored` array back to me and I'll patch the script for the specific field type.

## After it runs

1. `/blog` — every post shows its cover image
2. `/blog/:slug` — detail pages show their cover too
3. The Phase 0 status moves from 🔒 to ✅ in `MASTER-TRACKER.md`
4. We open Phase 1.1 — Homepage Hero V2 (already shipped to `04-homepage-hero/`)
