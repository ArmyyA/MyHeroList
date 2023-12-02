"use client";

import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SignedIn({ name }) {
  const { toast } = useToast();
  return (
    <div>
      <div className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none drop-shadow-md">
            <img
              width={74}
              height={74}
              src={"/bat.png"}
              alt=""
              className="scale-90 w-10 rounded-xl hover:opacity-70"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-2">
            <DropdownMenuLabel>{name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard">
              <DropdownMenuItem className="cursor-pointer">
                Dashboard
              </DropdownMenuItem>
            </Link>
            <Link
              onClick={() => {
                signOut({ callbackUrl: "/" });
                toast({
                  title: "Successfully logged out!",
                });
              }}
              href=""
            >
              <DropdownMenuItem className="cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
