"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useSession } from "next-auth/react";

import { Textarea } from "./ui/textarea";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

export default function AddReview({ listname }) {
  const router = useRouter();
  const [rating, setRating] = useState();
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleReview = async (e) => {
    e.preventDefault();

    console.log("Reached");

    const session = await getSession();
    const token = session?.token.accessToken;

    console.log(rating);
    const ratingInt = parseInt(rating, 10);

    // Check if the rating is empty or not a number
    if (!rating || isNaN(ratingInt)) {
      toast({
        title: "Uh-oh!",
        description: "Please provide a valid rating.",
      });
      return; // Stop the function execution if the rating is empty or invalid
    }

    const res = await fetch(`/api/lists/${listname}/review`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: ratingInt,
        comment: comment,
        hidden: false,
      }),
      credentials: "include",
    });
    if (res.ok) {
      await toast({
        title: "Successfully added the review!",
      });
      router.push(`/lists/${listname}`);
      router.refresh();
      console.log("Success");
    } else {
      await toast({
        title: "Uh-oh!",
        description: "Something went wrong. Please try again!",
      });
    }
  };
  const handleChange = (newValue) => {
    setRating(newValue);
    console.log(rating);
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full" variant="">
            Add Review
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave a review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReview}>
            <div className="flex-col space-y-3 mt-2">
              <div className="">
                <Label htmlFor="email" className="text-right">
                  Rating
                </Label>
                <Select onValueChange={handleChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pick a rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Ratings</SelectLabel>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="">
                <Label className="text-right">Comment (optional)</Label>
                <Textarea
                  placeholder="Leave your comment."
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center mt-7 justify-between">
              <Button className="" type="submit">
                Post
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
