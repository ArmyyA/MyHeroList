import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <nav className="flex justify-between items-center py-8 md:px-6">
      <h3 className="text-3xl font-normal flex align-middle items-center gap-2">
        <Image src={"/bat.svg"} width={42} height={42} />
        MyHeroList
      </h3>
      <ul className="flex items-center gap-6">
        <Link className="hover:opacity-70 text-xl" href={"/auth"}>
          Join Now
        </Link>
      </ul>
    </nav>
  );
}
