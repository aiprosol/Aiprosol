# KID PROMPT — Phase 3.5 · Testimonials Section

**Embeddable section** with auto-scrolling horizontal track, pause-on-hover, edge-fade. Pulls from `testimonials` CMS with a 6-quote fallback.

Embed in HomePage between the bento grid and the FAQ section. Optional second instance under the case studies index.

## Configuration

```tsx
<TestimonialsSection />
<TestimonialsSection title="What operators are saying" speed={45} />
<TestimonialsSection bare />
```

## Paste this into Kid

> **Goal:** Add a reusable `TestimonialsSection` component and embed on the homepage.
>
> **Steps:**
> 1. Create `src/components/TestimonialsSection.tsx`, paste the body below.
> 2. In `HomePage.tsx`, import it and embed between `<BentoTeaser />` and the next section:
>    ```tsx
>    import { TestimonialsSection } from '../components/TestimonialsSection';
>    // ...
>    <BentoTeaser />
>    <IntegrationsMarquee />
>    <TestimonialsSection />
>    ```
> 3. Optional: also embed under the case-studies index — `<TestimonialsSection bare title="From the operators" />`
> 4. Do not modify any other file beyond imports.
>
> ```tsx
> // ─── PASTE TestimonialsSection.tsx (file body) HERE ───
> // (copy from /Users/user/Airprosol/build/15-testimonials/TestimonialsSection.tsx)
> ```
