"use client";

import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Image from "next/image";
import { useSession } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SignedIn({ user }) {
  const { toast } = useToast();
  console.log("From signed");
  console.log(user);
  const isAdmin = user?.role;
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
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin == "admin" && (
              <Link href="/admin">
                <DropdownMenuItem className="cursor-pointer">
                  Admin
                </DropdownMenuItem>
              </Link>
            )}

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
