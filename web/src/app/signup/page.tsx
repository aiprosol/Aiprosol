import { LoginForm } from '../login/LoginForm';
import { isGoogleOAuthEnabled } from '@/lib/auth';

export const metadata = {
  // Root layout's title template appends " · Aiprosol" automatically.
  title: 'Create your account',
  description: 'Create your Aiprosol account in 30 seconds. Magic-link or Google OAuth — no passwords. Free ROI Audit unlocked the moment you sign in.',
  alternates: { canonical: '/signup' },
};

// force-dynamic lets the inner client component use useSearchParams without
// a Suspense boundary, which means the <h1> is in the server-rendered HTML.
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return <LoginForm mode="signup" googleEnabled={isGoogleOAuthEnabled()} />;
}
