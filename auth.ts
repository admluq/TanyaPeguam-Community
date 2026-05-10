import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Store user ID in token
      if (user?.id) {
        (token as any).id = user.id;
      }
      return token;
    },
    async session({ session, user, token }) {
      const id = user?.id ?? (token as any).id ?? token.sub ?? undefined;
      
      // Fetches lawyer profile for this user
      const profile = await db.lawyerProfile.findUnique({
        where: { userId: id },
      });

      return {
        ...session,
        user: {
          ...session.user,
          ...(id ? { id } : {}),
          ...(profile ? { 
            profileId: profile.id,
            profileSlug: profile.slug,
            firmName: profile.firmName,
            bio: profile.bio
          } : {}),
        },
      };
    },
  },
});
