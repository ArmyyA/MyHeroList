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
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import HeroCard from "@/components/heroCard";
import { useSession } from "next-auth/react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

async function fetchPowers() {
  const powersRes = await fetch(`/api/powers`);
  const powers = await powersRes.json();
  return powers;
}

export default function Explore() {
  const [name, setName] = useState();
  const [heroes, setHeroes] = useState([]);
  const [power, setPower] = useState();
  const [race, setRace] = useState();
  const [publisher, setPublisher] = useState();
  const { data: session, status } = useSession();

  const [powers, setPowers] = useState([]);

  useEffect(() => {
    fetchPowers().then(setPowers);
  }, []);

  async function getHeroes() {
    console.log(power);
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

    if (heroes.length == 0) {
      setHeroes(["No Heroes Found"]);
    } else {
      setHeroes(heroes);
    }
  }
  const handleChange = (newValue) => {
    setPower(newValue);
  };
  console.log(session);
  console.log(status);
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
                  onChange={(e) => {
                    setName(e.target.value);
                    console.log(power);
                  }}
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
                <Select onValueChange={handleChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a power" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {powers.map((power, index) => (
                        <SelectItem key={index} value={power}>
                          {power}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={getHeroes}>Search</Button>
            </div>
            <div className="mt-16">
              <Separator />
            </div>
            <div className="flex flex-wrap justify-center gap-11 py-6">
              {heroes.length === 1 && heroes[0] === "No Heroes Found" ? (
                <p>No heroes found</p>
              ) : (
                heroes.map((hero) => (
                  <HeroCard
                    id={hero.id}
                    image={hero.image}
                    gender={hero.Gender}
                    name={hero.name}
                    publisher={hero.Publisher}
                    eye={hero["Eye color"]}
                    race={hero.Race}
                    hair={hero["Hair color"]}
                    height={hero.Height}
                    skin={hero["Skin color"]}
                    align={hero.Alignment}
                    weight={hero.Weight}
                    powers={hero.powers.join(", ")}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="list">
            <div className="flex gap-10 mt-10 justify-center items-end"></div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
