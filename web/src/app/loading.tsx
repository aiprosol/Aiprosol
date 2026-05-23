// AIPROSOL · Default route-level loading state.
// Uses the brand-native AnimatedLogo as the visual primitive. Same component
// is reused for inline button spinners and long-wait overlays so the brand
// stays consistent across every loading surface.

import { RouteLoader } from '@/components/AnimatedLogo';

export default function Loading() {
  return <RouteLoader message="Loading" />;
}
