import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/webhook (webhook endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|image|manifest.json|sw.js|api/webhook|api/utmify).*)',
  ],
};
