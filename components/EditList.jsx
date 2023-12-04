import Link from "next/link";

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

export default function EditList({ name, username, rating, heroNum }) {
  return (
    <Card className="">
      <CardHeader>
        <div className="flex-col space-y-2 mb-3">
          <div className="flex items-center gap-6">
            <CardTitle className="">
              <div className="w-56">{name}</div>
            </CardTitle>
            <Badge>{username}</Badge>
          </div>
          <div>
            <CardDescription>
              There are {heroNum} heroes in the list
            </CardDescription>
            <CardDescription>
              <strong>Average Rating: {rating}</strong>
            </CardDescription>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <div className="flex gap-6 w-full">
                <div className="flex-col space-y-2 text-left">
                  <DialogTitle className="text-3xl">{name}</DialogTitle>
                  <Badge>{username}</Badge>
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <div className="flex-col space-y-3">
          <Link href={`/lists/${name}`}>
            <Button className="w-full" variant="outline">
              View List
            </Button>
          </Link>
          <Button className="w-full">Edit List</Button>
        </div>
      </CardHeader>
    </Card>
  );
}
