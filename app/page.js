import Image from "next/image";
import Nav from "./nav";
import { Button } from "@/components/ui/button";
import HeroCard from "@/components/heroCard";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="">
      <Nav />
      <div className="flex justify-center mb-6">
        <div className="mt-44 flex-col space-y-7 text-center">
          <h1 className="text-6xl font-semibold text-gray-800">
            Craft Your Heroic Legacy
          </h1>
          <p className="text-xl max-w-4xl mx-auto">
            From personalized hero lists to engaging community discussions –
            your journey into hero lore starts here. Explore our database of
            over 500 heroes, leave reviews, and create personalized hero lists.
          </p>
          <div className="flex gap-7 mt-2 py-7 justify-center">
            <Button>Get Searching</Button>
            <Button variant="outline">Create Account</Button>
          </div>
        </div>
      </div>
      <div className="mt-36 mb-10">
        <h1 className="text-center text-4xl font-semibold text-gray-800 mb-5">
          Featured Heroes
        </h1>

        <div className="flex justify-center gap-10 py-6">
          <HeroCard
            image={
              "https://www.superherodb.com/pictures2/portraits/10/100/1496.jpg"
            }
            name={"Batman"}
            publisher={"DC Comics"}
          />
          <HeroCard
            image={
              "https://www.superherodb.com/pictures2/portraits/10/100/956.jpg"
            }
            name={"Abe Sapien"}
            publisher={"Dark Horse Comics"}
          />
          <HeroCard
            image={
              "https://www.superherodb.com/pictures2/portraits/10/100/10647.jpg"
            }
            name={"Spider-Man"}
            publisher={"Marvel Comics"}
          />
          <HeroCard
            image={
              "https://www.superherodb.com/pictures2/portraits/10/100/10060.jpg"
            }
            name={"A-Bomb"}
            publisher={"Marvel Comics"}
          />
          <HeroCard
            image={
              "https://www.superherodb.com/pictures2/portraits/10/100/10090.jpg"
            }
            name={"Evil Deadpool"}
            publisher={"Marvel Comics"}
          />
        </div>
      </div>
    </main>
  );
}
