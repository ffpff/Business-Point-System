import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    console.log("Protected route accessed:", req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/signin",
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/user/:path*",
    "/api/opportunities/:path*",
    "/api/bookmarks/:path*",
    "/api/protected/:path*"
  ]
}