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
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/firebase";

export default function ForgotPass() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    await sendPasswordResetEmail(auth, email);

    toast({
      title: "Hey there,",
      description: "Reset password email sent!",
    });

    router.push("/auth");
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="" variant="link">
          Forgot Password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset your Password</DialogTitle>
          <DialogDescription>
            Enter your email to reset your password
          </DialogDescription>
        </DialogHeader>

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
        </div>
        <DialogFooter>
          <Button className="mt-3" onClick={() => handleSubmit()}>
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
