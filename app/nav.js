import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Nav() {
  return (
    <nav className="flex justify-between items-center py-8 md:px-6">
      <h3 className="text-3xl font-normal flex align-middle items-center gap-2">
        <Image src={"/bat.svg"} width={40} height={40} />
        MyHeroList
      </h3>
      <ul className="flex items-center gap-6">
        <Button variant="ghost">
          <Link href={"/auth"} className="text-lg">
            Join Now
          </Link>
        </Button>
      </ul>
    </nav>
  );
}
