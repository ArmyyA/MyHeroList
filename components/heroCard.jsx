"use client";

import { Card, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function HeroCard() {
  return (
    <div>
      <Card>
        <img
          src={
            "https://static01.nyt.com/images/2023/06/01/multimedia/spiderman2-tljp/spiderman2-tljp-videoSixteenByNineJumbo1600.jpg"
          }
          width={250}
          height={50}
          className="rounded-md w-m shadow-md"
        />
        <CardHeader>
          <div className="flex gap-4 mb-4">
            <CardTitle>Spider-Man</CardTitle>
            <Badge>Marvel</Badge>
          </div>
          <Button variant="outline">Learn More</Button>
        </CardHeader>
      </Card>
    </div>
  );
}
