import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import SignedIn from "@/components/SignedIn";

export default async function Nav() {
  const session = await getServerSession(authOptions);
  console.log(session?.user);
  return (
    <nav className="flex justify-between items-center py-8 md:px-6">
      <Link href="/">
        <h3 className="text-3xl font-normal flex align-middle items-center gap-2">
          <Image src={"/bat.svg"} width={35} height={35} />
          MyHeroList
        </h3>
      </Link>
      <ul className="flex items-center gap-6">
        {!session?.user && (
          <Button variant="ghost">
            <Link href={"/auth"} className="text-lg">
              Join Now
            </Link>
          </Button>
        )}
        {session?.user && (
          <div>
            <SignedIn />
          </div>
        )}
      </ul>
    </nav>
  );
}
