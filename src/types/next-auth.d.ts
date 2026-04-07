import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      class: string;
      nis: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    class: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    class: string;
    nis: string;
    userId: string;
  }
}
