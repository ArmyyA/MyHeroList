import ListCard from "./ListCard";
import { Button } from "./ui/button";
import EditList from "./EditList";

async function getLists(accessToken) {
  let options = {};
  let url;
  console.log(accessToken);
  if (accessToken) {
    url = `${process.env.NEXT_URL}api/lists/auth/mylists`;

    options.headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const listData = await fetch(url, options);
    const res = await listData.json();

    return res;
  }
}

export default async function DashList({ token }) {
  const lists = await getLists(token);
  console.log(lists.heroes);
  return (
    <div className="flex flex-wrap justify-center gap-11 py-6 mt-10">
      {lists.map((list, index) => (
        <div className="" key={index}>
          <EditList
            name={list.name}
            username={list.username}
            heroNum={list.heroes.length}
            rating={list.rating}
            edit={true}
          />
        </div>
      ))}
    </div>
  );
}
