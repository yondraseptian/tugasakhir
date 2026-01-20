export default function middleware(request) {
  const publicRoutes = ['/login', '/register']
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return undefined
  }

  // Check for token in cookies
  const token = request.cookies.get('auth_token')?.value

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    return Response.redirect(new URL('/login', request.url))
  }

  return undefined
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
