# Bing Webmaster Tools — verification setup

**Why:** Bing powers ChatGPT browse. A verified property = priority indexing for our domain on Bing + per-URL submission quota that we don't otherwise have.

**Time:** ~5 minutes on your side. I do the env-var wiring + redeploy.

---

## Steps (your part — once)

1. Sign in to **https://www.bing.com/webmasters** with a Microsoft account.
2. Click **Add a site** → enter `https://aiprosol.com`
3. Bing asks how to verify. Choose **HTML meta tag**.
4. Bing shows a snippet like:
   ```html
   <meta name="msvalidate.01" content="A1B2C3D4E5F6G7H8" />
   ```
5. Copy the **content value** only — the long token between the quotes (everything after `content="` and before the closing `"`). Don't copy the whole tag, just the token.

## Steps (my part — paste me the token)

Once you paste the token into chat I will:

1. Run `npx vercel env add NEXT_PUBLIC_BING_VERIFICATION production`
2. Paste your token as the value
3. Redeploy with `npx vercel --prod --yes`
4. The meta tag scaffolding already in `src/app/layout.tsx` will start rendering the token automatically
5. Tell you to click **Verify** back in Bing Webmaster

## Then a one-time bonus (also my part)

After verification clears, I'll submit the sitemap inside Bing Webmaster via the URL submission API so the 216 URLs get crawled in the next 24 hours instead of within the usual 1–2 week window.

---

## Status

- [ ] User: fetch token from bing.com/webmasters
- [ ] Me: paste env var + redeploy
- [ ] User: click Verify in Bing
- [ ] Me: submit sitemap.xml via Bing API
