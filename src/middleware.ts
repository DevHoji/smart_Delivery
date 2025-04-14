import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if the user is authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get the path and user role
  const path = request.nextUrl.pathname;
  const userRole = token.role as string;

  // Check for admin routes
  if (path.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check for agent routes
  if (path.startsWith('/dashboard/agent') && userRole !== 'AGENT' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check for user routes - all authenticated users can access
  if (path.startsWith('/dashboard/user')) {
    // Any authenticated user can access these routes
    return NextResponse.next();
  }

  // Continue for all other routes
  return NextResponse.next();
}

// Specify which routes the middleware applies to
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
