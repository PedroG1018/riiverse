import React, { useEffect, useState } from "react";
import { MdHome, MdExplore } from "react-icons/md";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import LoadingSpinner from "./LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/authContext";

const Sidebar = () => {
  const { user } = useAuth();

  const [showCommunities, setShowCommunities] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const getCommunities = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("user_communities")
      .select("communities(id, name, icon_img)")
      .eq("user_id", user.id)
      .order("name", { referencedTable: "communities", ascending: false });

    if (error) {
      console.log(error);
      return error;
    }

    setShowCommunities(true);
    setIsLoading(false);
    return data;
  };

  const { data } = useQuery({
    queryKey: ["sidebarCommunities"],
    queryFn: getCommunities,
  });

  return (
    <div className="hidden lg:block w-72 border-r border-gray-500 flex-shrink-0 left-0">
      <div className="px-4">
        <ul className="text-white py-2 mt-1">
          <li
            className="flex items-center space-x-2 cursor-pointer py-4 px-2 hover:bg-gray-900 transition"
            onClick={() => navigate("/")}
          >
            <MdHome size={24} />
            <span>Home</span>
          </li>
          <li
            className="flex items-center space-x-2 cursor-pointer py-4 px-2 hover:bg-gray-900 transition"
            onClick={() => navigate("/explore")}
          >
            <MdExplore size={24} />
            <span>Explore</span>
          </li>
        </ul>
      </div>

      <hr className="mx-4" />

      <div className="p-3">
        <button
          className={`flex justify-between items-center space-x-2 text-sm text-gray-400 w-full px-3 py-5
           hover:bg-gray-900 transition`}
          onClick={() => {
            setShowCommunities(!showCommunities);
          }}
        >
          <span className="text-sm text-white font-semibold">COMMUNITIES</span>
          {!showCommunities ? (
            <FaChevronDown className="text-white" />
          ) : (
            <FaChevronUp className="text-white" />
          )}
        </button>

        <div hidden={!showCommunities}>
          {!isLoading && data?.length > 0 ? (
            <ul className="flex flex-col">
              {data?.map((community) => (
                <li
                  key={community.communities.id}
                  className="flex gap-2 py-2 px-1 items-center hover:bg-gray-900 transition cursor-pointer"
                  onClick={() => navigate(`c/${community.communities.name}`)}
                >
                  <img
                    src={community.communities.icon_img}
                    className="w-10 h-10 flex-shrink-0 rounded-lg object-cover bg-gray-300"
                  />
                  <span className="text-gray-200 font-semibold">
                    c/{community.communities.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-200 px-3">
              You haven't joined any communities
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex mx-auto justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>

      <hr className="mx-4" />
    </div>
  );
};

export default Sidebar;
