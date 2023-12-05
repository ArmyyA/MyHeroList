"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "./ui/switch";
import { getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Textarea } from "./ui/textarea";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

export default function ListInterface() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [heroes, setHeroes] = useState("");
  const [vis, setVis] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();

    console.log("Reached");

    const session = await getSession();
    const token = session?.token.accessToken;
    console.log(token);
    const heroesArray = heroes.split(",").map((hero) => parseInt(hero.trim()));

    console.log(heroes);
    const res = await fetch("/api/lists/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        listname: name,
        description: description,
        review: [{ rating: 5, comments: null }],
        heroes: heroesArray,
        public: vis,
      }),
      credentials: "include",
    });
    if (res.ok) {
      await toast({
        title: "Successfully created the list!",
      });
      router.refresh();
      console.log("Success");
    } else {
      await toast({
        title: "Uh-oh!",
        description: "Something went wrong. Please try again!",
      });
    }
  };

  return (
    <div className="mt-11">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            Create a List
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a List</DialogTitle>
            <DialogDescription>Enter your list details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="flex-col space-y-3 mt-2">
              <div className="">
                <Label htmlFor="email" className="text-right">
                  List Name (Must be unique)
                </Label>
                <Input
                  id="name"
                  placeholder="MyHeroList"
                  defaultValue=""
                  className=""
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="">
                <Label className="text-right">Description</Label>
                <Textarea
                  placeholder="Type your description here."
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="">
                <div>
                  <Label className="text-right">Hero IDs</Label>
                </div>
                <Input
                  id="heroes"
                  placeholder="0, 1, 2..."
                  defaultValue=""
                  className=""
                  onChange={(e) => {
                    setHeroes(e.target.value);
                    console.log(heroes);
                  }}
                />
              </div>
            </div>
            <div className="flex items-center mt-7 justify-between">
              <Button className="" type="submit">
                Create
              </Button>
              <div className="flex items-center gap-3">
                <Label className="font-medium">Public</Label>
                <Switch
                  checked={vis}
                  onCheckedChange={() => {
                    setVis(!vis);
                    console.log(vis);
                  }}
                />
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
