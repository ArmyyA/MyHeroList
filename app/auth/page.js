"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import LogIn from "@/components/LogIn";
import { getServerSession } from "next-auth";

import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");

  const { toast } = useToast();

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(userCred.user);
      await updateProfile(userCred.user, { displayName: username });
      console.log(userCred.user.displayName);
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });
      console.log(res);
      toast({
        title: "Just one more step!",
        description:
          "Before you can sign in, you will need to verify your email. Please check your inbox for verification instructions.",
      });
    } catch (err) {
      console.log(err);
      if (err.code === "auth/email-already-in-use") {
        let message = "Email is already in use!";
        toast({
          title: "Uh-oh!",
          description: message,
        });
      }
    }
  };

  return (
    <main className="">
      <div className="mt-40">
        <Card className="md:max-w-2xl md:mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your email below to create your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="username"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  value={password}
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                Create account
              </Button>
            </CardContent>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <CardFooter className="mt-5">
            <LogIn variant={"outline"} />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
