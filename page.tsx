import { Suspense } from 'react';
import SuccessClient from './success-client';

export const dynamic = 'force-dynamic';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SuccessClient />
    </Suspense>
  );
}
