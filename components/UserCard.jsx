"use client";

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";

export default function UserCard({ user, token }) {
  const { toast } = useToast();
  const router = useRouter();
  async function handleDisable() {
    const res = await fetch(`/api/users/disable`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userEmail: user.email,
      }),
      credentials: "include",
    });
    if (res.ok) {
      await toast({
        title: "Successful!",
      });

      router.refresh();
      console.log("Success");
    } else {
      await toast({
        title: "Uh-oh!",
        description: "Something went wrong. Please try again!",
      });
    }
  }
  async function handleAdmin() {
    const res = await fetch(`/api/users/admin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userEmail: user.email,
      }),
      credentials: "include",
    });
    if (res.ok) {
      await toast({
        title: "Successful!",
      });

      router.refresh();
      console.log("Success");
    } else {
      await toast({
        title: "Uh-oh!",
        description: "Something went wrong. Please try again!",
      });
    }
  }
  return (
    <div>
      <Card className="">
        <CardHeader>
          <div className="flex-col space-y-2 mb-3">
            <div className="flex-col items-center gap-6 space-y-3">
              <CardTitle className="">
                <div className="w-56">{user.username}</div>
              </CardTitle>
              <Badge>{user.role}</Badge>
            </div>
            <div>
              <CardDescription className="mt-4">
                This user has created {user.lists.length} lists.
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-4">
            {user.role !== "admin" && (
              <div className="flex gap-5">
                <Button onClick={handleAdmin}>Given Admin</Button>
                <Button onClick={handleDisable} variant="outline">
                  {user.disabled ? "Enable Account" : "Disable Account"}
                </Button>
              </div>
            )}
            {user.role === "admin" && (
              <div className="flex gap-5">
                <Button disabled>Given Admin</Button>
                <Button disabled variant="outline">
                  Disable Account
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
