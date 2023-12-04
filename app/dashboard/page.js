import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { redirect } from "next/navigation";
import DashList from "@/components/DashList";
import { Separator } from "@/components/ui/separator";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  console.log(session);

  if (!session?.token) {
    redirect("/api/auth/signin");
  }
  return (
    <main>
      <h1 className="font-thin text-3xl">Hey there, {session.token?.name}.</h1>
      <h1 className="font-medium text-xl mt-16">Your Lists</h1>
      <div className="mt-5">
        <DashList token={session?.token.accessToken} />
      </div>
    </main>
  );
}
