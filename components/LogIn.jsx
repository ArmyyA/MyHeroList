"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useState } from "react";

import { useToast } from "./ui/use-toast";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogIn({ variant }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    console.log(res);

    if (!res.ok) {
      let message = res.error;
      toast({
        title: "Uh-oh!",
        description: message,
      });
    } else {
      await toast({
        title: "Successfully logged in!",
      });

      router.push("/");
      router.refresh();
    }
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant={variant}>
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            Enter your credentials and get exploring
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                placeholder="example@hero.com"
                defaultValue=""
                className="col-span-3"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                defaultValue=""
                placeholder="password"
                className="col-span-3"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="mt-3" type="submit">
              Login
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
