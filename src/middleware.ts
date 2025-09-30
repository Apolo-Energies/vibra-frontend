import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: '__Secure-authjs.session-token',
  });

  const url = req.nextUrl;

  if (!session) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  const expires = typeof session.accessTokenExpires === "number" ? session.accessTokenExpires : 0;
  if (Date.now() > expires) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // session.role is of type unknown, so we need to safely extract it
  const userRole =
    typeof session.role === "string" ? session.role.toLowerCase() : undefined;

  if (!userRole) {
    // si no tiene rol valido, también lo enviamos al login
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (userRole === "colaborador") {
    if (!url.pathname.startsWith("/dashboard/Comparador")) {
      url.pathname = "/dashboard/Comparador";
      return NextResponse.redirect(url);
    }
  }
  // const userRole = session.user?.role;

  // Verifica si el rol es válido
  // const validRoles = ["master", "colaborador"];
  // if (!validRoles.includes(userRole)) {
  //   url.pathname = "/";
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

// Solo aplica middleware a rutas dentro de /dashboard
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
