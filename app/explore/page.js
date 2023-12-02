"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import HeroCard from "@/components/heroCard";

export default function Explore() {
  const [name, setName] = useState();
  const [power, setPower] = useState();
  const [race, setRace] = useState();
  const [publisher, setPublisher] = useState();

  async function getHeroes() {
    console.log("Reached");
    console.log(name);
    const heroRes = await fetch(
      `/api/heroes/search?name=${encodeURIComponent(
        name || ""
      )}&Race=${encodeURIComponent(race || "")}&Publisher=${encodeURIComponent(
        publisher || ""
      )}&Power=${encodeURIComponent(power || "")}`
    );
    const heroes = await heroRes.json();

    console.log(heroes);

    return heroes;
  }
  return (
    <main>
      <div className="flex-col text-center justify-center pt-20 space-y-3">
        <h1 className="text-4xl font-bold text-gray-800">
          Greatness Begins Here
        </h1>
        <p>Explore our database of over 700 heroes.</p>
      </div>
      <div className="flex mt-28 justify-center">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Hero Search</TabsTrigger>
            <TabsTrigger value="list">Lists</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <div className="flex gap-10 mt-10 justify-center items-end">
              <div className="">
                <Label htmlFor="email">Name</Label>
                <Input
                  className="w-full"
                  id="name"
                  placeholder="Spider-Man"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="">
                <Label htmlFor="email">Race</Label>
                <Input
                  className="w-full"
                  id="race"
                  placeholder="Human"
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                />
              </div>
              <div className="">
                <Label>Publisher</Label>
                <Input
                  className="w-full"
                  id="publisher"
                  placeholder="Marvel"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>
              <div className="">
                <Label>Power</Label>
                <Input
                  className="w-full"
                  id="power"
                  placeholder="Agility"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                />
              </div>
              <Button onClick={getHeroes}>Search</Button>
            </div>
            <div className="mt-16">
              <Separator />
            </div>
            <div>Search Area</div>
          </TabsContent>
          <TabsContent value="list">Hello</TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
