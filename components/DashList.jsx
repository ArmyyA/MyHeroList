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
  console.log("Reached");

  return (
    <div className="flex flex-wrap justify-center gap-11 py-6 mt-10">
      {lists.map((list, index) => {
        const averageRating =
          list.review && list.review.length > 0
            ? list.review.reduce((acc, curr) => acc + curr.rating, 0) /
              list.review.length
            : 0;

        // Round the average to one decimal place (optional)
        const roundedAverageRating = Math.round(averageRating * 10) / 10;
        return (
          <div className="" key={index}>
            <EditList
              listname={list.name}
              username={list.username}
              heroNum={list.heroes.length}
              rating={roundedAverageRating}
              edit={true}
              visibility={list.public}
            />
          </div>
        );
      })}
    </div>
  );
}
