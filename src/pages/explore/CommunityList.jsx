import { useQuery } from "@tanstack/react-query";
import React from "react";
import { supabase } from "../../supabase/supabase";
import { useNavigate } from "react-router-dom";

const CommunityList = () => {
  const navigate = useNavigate();

  const getCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("id, name, icon_img, user_communities(count)")
      .order("name", { ascending: true });

    return data;
  };

  const { data: communities } = useQuery({
    queryKey: ["exploreCommunities"],
    queryFn: getCommunities,
  });

  return (
    <div className="col-span-3 my-4 mx-2">
      <h3 className="text-center text-white font-semibold text-xl mb-4 py-4">
        All communities
      </h3>

      <div className="grid grid-cols-2">
        {communities?.map((community) => (
          <div
            key={community.id}
            className="flex gap-2 items-center px-2 py-3 hover:bg-gray-600 transition cursor-pointer"
            onClick={() => navigate(`/c/${community.name}`)}
          >
            <img
              src={community.icon_img}
              className="w-14 h-14 object-cover rounded-lg"
            />
            <div className="flex flex-col gap-1">
              <span className="text-white font-semibold">
                c/{community.name}
              </span>
              <span className="text-sm text-gray-200">
                {community.user_communities[0].count} Members
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityList;
