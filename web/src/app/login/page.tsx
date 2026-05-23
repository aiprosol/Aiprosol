import { LoginForm } from './LoginForm';
import { isGoogleOAuthEnabled } from '@/lib/auth';

export const metadata = {
  // Root layout's title template appends " · Aiprosol" automatically.
  title: 'Sign in',
  description: 'Sign in to Aiprosol. Magic-link or Google OAuth — no passwords, no friction. Your one-time link expires in 15 minutes.',
  alternates: { canonical: '/login' },
};

// force-dynamic lets the inner client component use useSearchParams without
// a Suspense boundary, which means the <h1> is in the server-rendered HTML
// (good for SEO + screen readers — and avoids the prior bug where /login
// shipped with no H1 visible to crawlers).
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm mode="signin" googleEnabled={isGoogleOAuthEnabled()} />;
}
