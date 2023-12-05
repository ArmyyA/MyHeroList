import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserCard from "@/components/UserCard";
import { Separator } from "@/components/ui/separator";

async function getUsers(accessToken) {
  let options = {};
  let url;
  console.log(accessToken);
  if (accessToken) {
    url = `${process.env.NEXT_URL}api/users`;

    options.headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const userData = await fetch(url, options);

    const res = await userData.json();

    return res;
  }
}

export default async function Admin() {
  const session = await getServerSession(authOptions);
  const users = await getUsers(session?.token.accessToken);
  const adminUser = session?.token.name;
  console.log(session?.token);
  console.log(users);

  if (!session) {
    redirect("/");
  }
  return (
    <div className="mt-16">
      <h1 className="my-5 text-3xl font-medium">MyHeroList Users</h1>
      <Separator />
      <div className="mt-10">
        {users?.map((user, index) => (
          <div className="mb-4" key={index}>
            <UserCard user={user} token={session?.token.accessToken} />
          </div>
        ))}
      </div>
    </div>
  );
}
