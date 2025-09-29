import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      token: string;
      accessTokenExpires: string;
    };
  }
  declare module "next-auth/jwt" {
    interface JWT {
      id?: string;
      email?: string;
      role?: string;
      accessToken?: string;
    }
  }
}
