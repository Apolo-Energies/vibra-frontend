import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
// import { userLogin } from "./app/services/ApiAuth/auth.service";
import { jwtDecode } from "jwt-decode";
import { userLogin } from "./app/services/Auth/auth.service";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/",
    newUser: "/dashboard",
  },
  providers: [
    Credentials({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials): Promise<any | null> {
        const apiKey = (req.query?.api_key as string) ?? credentials?.api_key;
        if (!apiKey) return null;

        try {
          const apiKey = process.env.NEXT_PUBLIC_RENOVAE_API_KEY;
          const response = await userLogin(apiKey!);


          if (!response || response.status !== 200) {
            console.error("Credenciales incorrectas: ", response);
            return null;
          }

          const jwt = response.result;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const claims = jwtDecode<any>(jwt as string);

          return {
            id: claims.sub ?? claims.id,
            email: claims.email,
            role: claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? claims.role ?? "user",
            token: jwt,
          };
        } catch (error) {
          console.error("Error al autenticar:", error);
          return null; // Asegurarse de que no se cree una sesión si hay error
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const claims = jwtDecode<any>((user as any).token);
        // Type guard to ensure user has the expected properties
        if ('id' in user) token.id = user.id;
        if ('email' in user) token.email = user.email;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('role' in user) token.role = (user as any).role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('token' in user) token.accessToken = (user as any).token; // el JWT crudo
        token.accessTokenExpires = typeof claims.exp === "number" ? claims.exp * 1000 : undefined;
      }
      if (typeof token.accessTokenExpires === "number" && Date.now() > token.accessTokenExpires) {
        return { ...token, error: "AccessTokenExpired" };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
        token: token.accessToken as string,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((token as any).error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).error = (token as any).error;
      }
      return session;
    },
  },
  trustHost: true,
};

export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);
