"use client";

import Link from "next/link";
import { useToast } from "./ui/use-toast";
import { useState } from "react";

import { Card, CardHeader, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function EditList({
  listname,
  username,
  rating,
  heroNum,
  visibility,
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [heroesAdd, setHeroesAdd] = useState("");
  const [heroesRem, setHeroesRem] = useState("");
  const [vis, setVis] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();

    const session = await getSession();
    const token = session?.token.accessToken;

    const res = await fetch(`/api/lists/${listname}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      await toast({
        title: "Successfully deleted the list!",
      });
      router.refresh();
      console.log("Success");
    } else {
      console.log(res);
      await toast({
        title: "Uh-oh!",
        description: "Something went wrong. Please try again!",
      });
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    console.log("Reached");
    console.log(heroesRem);

    const session = await getSession();
    const token = session?.token.accessToken;
    console.log(token);

    const parseAndValidateHeroId = (heroId) => {
      const id = typeof heroId === "string" ? parseInt(heroId.trim()) : heroId;
      return !isNaN(id) && id >= 0 && id <= 733;
    };

    const heroesAddArray =
      heroesAdd.trim().length === 0
        ? []
        : heroesAdd.split(",").map((hero) => {
            return typeof hero === "string" ? parseInt(hero.trim()) : hero;
          });

    const heroesRemArray =
      heroesRem.trim().length === 0
        ? []
        : heroesRem.split(",").map((hero) => {
            return typeof hero === "string" ? parseInt(hero.trim()) : hero;
          });

    // Validate hero IDs
    const isAddArrayValid = heroesAddArray.every(parseAndValidateHeroId);
    const isRemArrayValid = heroesRemArray.every(parseAndValidateHeroId);

    if (!isAddArrayValid || !isRemArrayValid) {
      toast({
        title: "Invalid Hero IDs",
        description: "Hero IDs must be integers between 0 and 733.",
      });
      return; // Stop the function execution if there are invalid hero IDs
    }

    const res = await fetch(`/api/lists/${listname}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        newListname: name,
        description: description,
        heroAdds: heroesAddArray,
        heroRemoves: heroesRemArray,
        public: vis,
      }),
      credentials: "include",
    });
    if (res.ok) {
      await toast({
        title: "Successfully updated the list!",
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
    <Card className="">
      <CardHeader>
        <div className="flex-col space-y-2 mb-3">
          <div className="flex items-center gap-6">
            <CardTitle className="">
              <div className="w-56">{listname}</div>
            </CardTitle>
            <Badge>{username}</Badge>
          </div>
          <div>
            <CardDescription>
              There are <strong>{heroNum}</strong> heroes in the list
            </CardDescription>
            <CardDescription>
              Average Rating: <strong>{rating}</strong>
            </CardDescription>
            <CardDescription>
              Public: <strong>{visibility.toString()}</strong>
            </CardDescription>
          </div>
        </div>

        <div className="flex-col space-y-3">
          <Link href={`/lists/${listname}`}>
            <Button className="w-full" variant="outline">
              View List
            </Button>
          </Link>
          <div className="flex gap-5">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="">
                  Edit List
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit List</DialogTitle>
                  <DialogDescription>
                    Enter your list details.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEdit}>
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
                        <Label className="text-right">Hero IDs to Add</Label>
                      </div>
                      <Input
                        id="heroes"
                        placeholder="0, 1, 2..."
                        defaultValue=""
                        className=""
                        onChange={(e) => {
                          setHeroesAdd(e.target.value);
                        }}
                      />
                    </div>
                    <div className="">
                      <div>
                        <Label className="text-right">Hero IDs to Remove</Label>
                      </div>
                      <Input
                        id="heroes"
                        placeholder="0, 1, 2..."
                        defaultValue=""
                        className=""
                        onChange={(e) => {
                          setHeroesRem(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center mt-7 justify-between">
                    <Button className="" type="submit">
                      Edit
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  Delete List
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action is irreversable
                  </DialogDescription>
                </DialogHeader>
                <div className="w-full">
                  <Button
                    onClick={handleDelete}
                    className="w-full"
                    variant="destructive"
                  >
                    Yes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
