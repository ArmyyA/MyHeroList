"use client";

import parse from "html-react-parser";
import { useEffect, useState } from "react";

export default function Policies() {
  const [data, setData] = useState("");
  useEffect(() => {
    const fetchContent = async () => {
      const response = await fetch("/api/policy");
      const data = await response.json();
      const parsed = parse(data);
      console.log(parsed);
      setData(parsed);
    };

    fetchContent();
  }, []);
  return <div className="mt-32 mb-16 text-gray-800">{data}</div>;
}
