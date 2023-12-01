import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import SignedIn from "@/components/SignedIn";
import LogIn from "@/components/LogIn";
import { useSession } from "next-auth/react";

export default async function Nav() {
  const session = await getServerSession(authOptions);
  console.log(session?.user);
  return (
    <nav className="flex justify-between items-center my-8 md:px-6">
      <Link href="/">
        <h3 className="text-3xl font-normal flex align-middle items-center gap-2">
          <Image src={"/bat.svg"} width={35} height={35} />
          MyHeroList
        </h3>
      </Link>
      <ul className="flex items-center gap-6">
        {!session?.user && <LogIn variant={"ghost"} />}
        {session?.user && (
          <div>
            <SignedIn name={session?.user.name} />
          </div>
        )}
      </ul>
    </nav>
  );
}
