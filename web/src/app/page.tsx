import { Suspense } from 'react';
import { Hero } from '@/components/Hero';
import { BentoGrid } from '@/components/BentoGrid';
import { WorkflowVisualizer } from '@/components/WorkflowVisualizer';
import { AroraAtWork } from '@/components/AroraAtWork';
import { ProofStrip } from '@/components/ProofStrip';
import { StatsBanner } from '@/components/home/StatsBanner';
import { HomeServices } from '@/components/home/HomeServices';
import { HomeProducts } from '@/components/home/HomeProducts';
import { HomeCases } from '@/components/home/HomeCases';
import { HomeBlog } from '@/components/home/HomeBlog';
import { HomeFinalCTA } from '@/components/home/HomeFinalCTA';
import { IntegrationsMarquee } from '@/components/IntegrationsMarquee';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { getVisitorSegment } from '@/lib/personalize';

// ─────────────────────────────────────────────────────────────────────────
// Personalised below-the-fold sections.
//
// HomePage used to `await getVisitorSegment()` at the very top of an async
// server component. With app/loading.tsx present, that suspended the WHOLE
// route behind the full-screen RouteLoader: the loader painted first (FCP ~0.9s)
// and the real hero only appeared after the route resolved and the client
// swapped the fallback out — pushing mobile LCP to ~3.5s on throttled connections.
//
// The hero uses zero personalisation, so it must never wait on the cookie read.
// HomePage is now a synchronous component (no top-level await → no full-page
// suspense → loading.tsx no longer gates the homepage), and the cookie read is
// pushed down into these two async children, each wrapped in its own <Suspense>.
// The hero now ships in the first streamed flush; the personalised sections
// stream in just after (they're below the fold, so invisible to LCP). Fallbacks
// render the same components with default (non-personalised) ordering — identical
// layout, so the personalise-swap introduces no layout shift.
// ─────────────────────────────────────────────────────────────────────────
async function PersonalizedServices() {
  const segment = await getVisitorSegment();
  return <HomeServices segment={segment} />;
}

async function PersonalizedCases() {
  const segment = await getVisitorSegment();
  return <HomeCases segment={segment} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Above-the-fold proof strip — sits under the hero, before workflow viz */}
      <ProofStrip />

      <div data-orb-section="workflow" id="workflow">
        <RevealOnScroll>
          <WorkflowVisualizer />
        </RevealOnScroll>
      </div>

      {/* Live "Arora at work" demo — synthetic lead loops every ~90s */}
      <div data-orb-section="arora-at-work" id="arora-at-work">
        <RevealOnScroll>
          <AroraAtWork />
        </RevealOnScroll>
      </div>

      <div data-orb-section="stats">
        <RevealOnScroll>
          <StatsBanner />
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <BentoGrid />
      </RevealOnScroll>

      <div data-orb-section="services">
        <RevealOnScroll>
          <Suspense fallback={<HomeServices />}>
            <PersonalizedServices />
          </Suspense>
        </RevealOnScroll>
      </div>

      <div data-orb-section="products">
        <RevealOnScroll>
          <HomeProducts />
        </RevealOnScroll>
      </div>

      <RevealOnScroll>
        <IntegrationsMarquee />
      </RevealOnScroll>

      <div data-orb-section="cases">
        <RevealOnScroll>
          <Suspense fallback={<HomeCases />}>
            <PersonalizedCases />
          </Suspense>
        </RevealOnScroll>
      </div>

      <div data-orb-section="testimonials">
        <RevealOnScroll>
          <TestimonialsSection />
        </RevealOnScroll>
      </div>

      <div data-orb-section="blog">
        <RevealOnScroll>
          <HomeBlog />
        </RevealOnScroll>
      </div>

      <div data-orb-section="final">
        <RevealOnScroll>
          <HomeFinalCTA />
        </RevealOnScroll>
      </div>
    </>
  );
}
