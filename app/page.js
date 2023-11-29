import Image from "next/image";
import Nav from "./nav";
import { Button } from "@/components/ui/button";
import HeroCard from "@/components/heroCard";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

async function getHeroes() {
  const heroIds = [68, 265, 622, 309];
  const fetchPromise = heroIds.map(async (id) => {
    const heroRes = await fetch(`${process.env.NEXT_URL}api/heroes/${id}`);
    const hero = await heroRes.json();
    const imgRes = await fetch(
      `${process.env.SUPERHERO_API}search/${hero.name}`
    );
    const imgData = await imgRes.json();

    const heroImg = imgData.results[0].image;
    return { ...hero, image: heroImg.url };
  });
  const heroes = await Promise.all(fetchPromise);

  return heroes;
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const heroes = await getHeroes();
  return (
    <main className="">
      <div className="flex justify-center mb-6">
        <div className="mt-40 flex-col space-y-7 text-center">
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
            <Link href="/auth">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-36 mb-10">
        <div className="flex-col space-y-2 mb-4">
          <h1 className="text-center text-4xl font-semibold text-gray-800">
            Featured Heroes
          </h1>
        </div>

        <div className="flex justify-center gap-11 py-6">
          {heroes.map((hero) => (
            <HeroCard
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
            />
          ))}
        </div>
      </div>
    </main>
  );
}
