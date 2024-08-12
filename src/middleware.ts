import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface SessionUser {
  role: 'admin' | 'user';
}

interface Session {
  user: SessionUser;
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const session = token as Session | null;

  await new Promise(resolve => setTimeout(resolve, 100));


  console.log('Middleware - Current path:', req.nextUrl.pathname);
  console.log('Middleware - Session:', session);

  if (req.nextUrl.pathname === "/login") {
    if (session?.user) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (session?.user?.role === 'admin') {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith("/user")) {
    console.log('Middleware - User role:', session?.user?.role);
    if (session?.user?.role === 'user') {
      console.log('Middleware - Allowing access to user route');
      return NextResponse.next();
    } else {
      console.log('Middleware - Redirecting to login (user route)');
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (req.nextUrl.pathname === "/") {
    if (session?.user) {
      if (session.user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else if (session.user.role === 'user') {
        return NextResponse.redirect(new URL('/user/profile', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/user/:path*', '/'],
}