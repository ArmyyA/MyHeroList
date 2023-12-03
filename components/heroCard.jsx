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
  id,
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
  powers,
}) {
  function searchDDG() {
    var searchQuery = encodeURIComponent(name);
    var url = `https://duckduckgo.com/?q=${searchQuery}`;
    window.open(url, "_blank");
  }
  return (
    <div>
      <Card className="shadow-inner">
        <img src={image} width={235} height={50} className="rounded-md" />
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
                <div className="flex gap-6 w-full">
                  <img
                    src={image}
                    width={335}
                    height={50}
                    alt=""
                    className="rounded-md w-m shadow-md"
                  />
                  <div className="flex-col space-y-2  text-left">
                    <DialogTitle className="text-3xl">
                      {id}. {name}
                    </DialogTitle>
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
                    <p>Powers: {powers}</p>
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button onClick={searchDDG} className="" variant="outline">
            Search DDG
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
