"use client";

import { Card, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function HeroCard({ name, image, publisher }) {
  return (
    <div>
      <Card className="shadow-md">
        <img
          src={image}
          width={195}
          height={50}
          className="rounded-md w-m shadow-md"
        />
        <CardHeader>
          <div className="flex-col space-y-4 mb-4">
            <CardTitle className="">{name}</CardTitle>
            <Badge>{publisher}</Badge>
          </div>
          <Button variant="outline">Learn More</Button>
        </CardHeader>
      </Card>
    </div>
  );
}
