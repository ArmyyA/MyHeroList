"use client";

import AddReview from "@/components/AddReview";
import { list } from "postcss";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeroCard from "@/components/heroCard";
import { useState } from "react";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

async function getList(name) {
  console.log("Reached");
  const listRes = await fetch(`/api/lists/${name}`);
  const list = await listRes.json();
  console.log(list);
  return list;
}

async function getHeroes(heroIds) {
  if (heroIds.length === 0) {
    return ["No heroes in this list"];
  }
  const fetchPromise = heroIds.map(async (id) => {
    const heroRes = await fetch(`/api/heroes/${id}`);
    const hero = await heroRes.json();
    console.log(hero);

    return hero;
  });
  const heroes = await Promise.all(fetchPromise);

  return heroes;
}

export default function Page({ params }) {
  const [listinfo, setListInfo] = useState(null);
  const [heroes, setHeroes] = useState([]);
  const { data: session, status } = useSession();
  const user = session?.session.user;

  // Function to refresh data
  const refreshData = async () => {
    const newListInfo = await getList(params.slug);
    setListInfo(newListInfo);
    const newHeroes = await getHeroes(newListInfo.heroes);
    setHeroes(newHeroes);
  };

  // Fetch data on component mount and when refresh button is clicked
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <main>
      <div className="flex justify-center mb-6">
        <div className="mt-40 flex-col space-y-7 text-center">
          <h1 className="text-5xl font-light text-gray-800">
            <strong>{listinfo?.name}</strong> by {listinfo?.username}
          </h1>
          <p className="text-xl max-w-4xl mx-auto">{listinfo?.description}</p>
        </div>
      </div>
      <div className="flex-col space-y-2 mb-4">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold text-gray-800 tracking-tight text-center first:mt-0"></h2>
      </div>
      <div className="mt-32 ">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Reviews
        </h1>
        <div className="flex justify-center text-center items-center">
          <ScrollArea className="h-[400px] w-2/5 rounded-md border p-4 mt-4">
            {listinfo?.review.map((review, index) => (
              <Card key={index} className="w-full shadow-sm mb-4">
                <CardHeader>
                  <CardTitle>{review.rating}/5</CardTitle>
                  <CardDescription className="mt-3">
                    {review.comment ? review.comment : "No comment"}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </ScrollArea>
        </div>
        <div className="flex justify-center mt-5">
          {user && <AddReview listname={listinfo?.name} />}
        </div>
      </div>

      <div className="mt-28 mb-10">
        <div className="flex-col space-y-2 mb-4">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold text-gray-800 tracking-tight text-center first:mt-0">
            List Heroes
          </h2>
        </div>

        <Button onClick={refreshData} variant="link">
          Refresh
        </Button>

        <div className="flex flex-wrap justify-center gap-11 py-6">
          {heroes.length === 1 && heroes[0] === "No heroes in this list" ? (
            <p>No heroes in this list</p>
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
                powers={hero.powers?.join(", ")}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
