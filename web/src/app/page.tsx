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

export default async function HomePage() {
  // Server-side personalisation read — middleware sets the cookie based on
  // Vercel-geo country, UTM source, and time-of-day. Falls through to a
  // generic segment if anything is missing (localhost dev, no UTM, etc.).
  const segment = await getVisitorSegment();

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
          <HomeServices segment={segment} />
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
          <HomeCases segment={segment} />
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
