import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Hard gate: this app is intentionally vulnerable and must only ever run on
// localhost. Block production builds and any non-local host outright.
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(
      'HackLab is intentionally vulnerable and must never run in production.',
      { status: 403 },
    );
  }

  const host = (request.headers.get('host') ?? '').split(':')[0];
  const allowed = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  if (!allowed) {
    return new NextResponse(
      `Refused: HackLab only serves localhost (got host "${host}").`,
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
