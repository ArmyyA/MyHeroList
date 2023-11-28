"use client";

import { Card, CardHeader, CardTitle } from "./ui/card";
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

export default function HeroCard({
  name,
  image,
  publisher,
  gender,
  eye,
  race,
  hair,
  height,
  skin,
  align,
  weight,
}) {
  return (
    <div>
      <Card className="">
        <img src={image} width={210} height={50} className="rounded-md" />
        <CardHeader>
          <div className="flex-col space-y-4 mb-4">
            <CardTitle className="">{name}</CardTitle>
            <Badge>{publisher}</Badge>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Learn More</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <div className="flex gap-6">
                  <img
                    src={image}
                    width={245}
                    height={50}
                    alt=""
                    className="rounded-md w-m shadow-md outline outline-2 outline-offset-2"
                  />
                  <div className="flex-col space-y-2  text-left">
                    <DialogTitle className="text-3xl">{name}</DialogTitle>
                    <Badge>{publisher}</Badge>
                    <p>
                      <strong>Gender: </strong>
                      {gender}
                    </p>
                    <p>Eye Color: {eye}</p>
                    <p>Race: {race}</p>
                    <p>Hair: {hair}</p>
                    <p>Height: {height}</p>
                    <p>Skin: {skin}</p>
                    <p>Alignment: {align}</p>
                    <p>Weight: {weight}</p>
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>
    </div>
  );
}
