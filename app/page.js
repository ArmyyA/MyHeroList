import Image from "next/image";
import Nav from "./nav";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="">
      <Nav />
      <div className="flex justify-center">
        <div className="mt-60 flex-col space-y-7 text-center">
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
    </main>
  );
}
