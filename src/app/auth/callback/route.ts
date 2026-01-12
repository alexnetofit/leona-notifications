import { NextResponse } from 'next/server';

// This route is no longer needed since we use OTP code verification
// Keeping it to redirect any old magic links to login
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
