import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { ConnectMD } from "@/lib/conection";
import Departamento from '@/models/departamento';
import Admin from '@/models/admin';
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Joaquin Soria" },
        password: { label: "Password", type: "password", placeholder: "Contraseña" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials, req) {
        await ConnectMD()

        const { username, password, role } = credentials;

        const userModel = role === 'admin' ? Admin : Departamento;
        const userFound = await userModel.findOne({ username }).select("+password");

        if (!userFound || !(await bcrypt.compare(password, userFound.password))) {
          throw new Error("Invalid Credentials");
        }

        if (userFound.role !== role) {
          throw new Error("Invalid Credentials");
        }

        return {
          id: userFound._id.toString(),
          numeroDepartamento: userFound.numeroDepartamento,
          email: userFound.email,
          imagenPerfil: userFound.imagenPerfil,
          username: userFound.username,
          role: userFound.role,
          inquilinos: userFound.inquilinos,
          expensas: userFound.expensas,
          reservas: userFound.reservas,
          departamento: userFound.departamento,
        };
      }
    })
  ],
  callbacks: {
    jwt({ account, token, user, profile, session }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        id: token.user.id,
        numeroDepartamento: token.user.numeroDepartamento,
        email: token.user.email,
        imagenPerfil: token.user.imagenPerfil,
        username: token.user.username,
        role: token.user.role,
        inquilinos: token.user.inquilinos,
        expensas: token.user.expensas,
        reservas: token.user.reservas,
        token: token
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        if (url.includes('/user/profile')) {
          return `${url}?t=${Date.now()}`;
        }
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile, email, credentials }) {
      if (user) {
        user.showWelcomeMessage = true;
        if (user.role === 'admin') {
          return '/admin/dashboard';
        } else if (user.role === 'user') {
          return '/user/profile';
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }