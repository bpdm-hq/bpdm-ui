import { redirect } from 'next/navigation';

// The rich marketing landing (apps/landing) is the product's front door.
// This docs app has no landing of its own — it opens straight on the docs,
// so "/" redirects to "/docs" (no second, competing landing page).
export default function HomePage() {
  redirect('/docs');
}
