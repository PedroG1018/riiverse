import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabase";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const RightPanel = () => {
  const navigate = useNavigate();

  const getTrendingCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*, posts(count)");

    let sortedData = data.sort((a, b) => b.posts[0].count - a.posts[0].count);

    return sortedData.slice(0, 5);
  };

  const { data: trendingCommunities } = useQuery({
    queryKey: ["trendingCommunities"],
    queryFn: getTrendingCommunities,
  });

  console.log(trendingCommunities);

  return (
    <div className="hidden xl:block col-span-1 bg-black top-0 mt-4 rounded-xl px-3 py-4 h-[22em]">
      <h4 className="text-white font-semibold mb-4 text-center">
        Trending communities
      </h4>

      {trendingCommunities?.map((community) => (
        <div
          key={community.id}
          className="py-2 px-1 cursor-pointer w-full flex gap-2 items-center hover:bg-gray-600 transition"
        >
          <div
            className="flex gap-2 items-center"
            onClick={() => navigate(`/c/${community.name}`)}
          >
            <img
              src={community.icon_img}
              className="w-10 h-10 object-cover rounded-lg bg-gray-300"
            />
            <span className="text-gray-100 font-semibold">
              c/{community.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RightPanel;
