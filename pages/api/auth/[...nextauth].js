import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase";

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
          .then((userCredential) => {
            if (userCredential.user && userCredential.user.emailVerified) {
              console.log(userCredential.user.displayName);
              return {
                name: userCredential.user.displayName,
                email: userCredential.user.email,
              };
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
};
export default NextAuth(authOptions);
