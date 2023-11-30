"use client";

import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function SignedIn() {
  const { toast } = useToast();
  return (
    <div>
      <Button variant="ghost">
        <Link
          onClick={() => {
            signOut({ callbackUrl: "/" });
            toast({
              title: "Successfully logged out!",
            });
          }}
          href=""
          className=""
        >
          Sign Out
        </Link>
      </Button>
    </div>
  );
}
