import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase";
import jwt from "jsonwebtoken";

export const authOptions = {
  // Configure one or more authentication providers
  pages: {
    signIn: "/auth",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        return await signInWithEmailAndPassword(
          auth,
          credentials.email || "",
          credentials.password || ""
        )
          .then(async (userCredential) => {
            if (userCredential.user && userCredential.user.emailVerified) {
              return userCredential.user;
            } else if (
              userCredential.user &&
              !userCredential.user.emailVerified
            ) {
              throw new Error("Email not verified");
            } else if (!userCredential.user) {
              throw new Error("Invalid credentials");
            }
          })
          .catch((error) => {
            console.log(error);
            throw new Error(error.code);
          });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.uid = user.uid;
        token.email = user.email;
        token.name = user.displayName;

        const customToken = jwt.sign(
          { uid: user.uid, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        token.accessToken = customToken;
      }
      return token;
    },
    async session(session, token, user) {
      console.log(session.user);
      session.user = token;
      console.log(session.user);

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
export default NextAuth(authOptions);
