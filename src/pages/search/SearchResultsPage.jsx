import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import LoadingBar from "../../components/LoadingBar";

const SearchResultsPage = () => {
  const { q: query } = useParams();

  const [communityResults, setCommunityResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [tab, setTab] = useState("communities");

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const getData = async () => {
    switch (tab) {
      case "communities":
        getCommunities();
        break;
      case "users":
        getUsers();
        break;
      default:
        getCommunities();
    }
  };

  const getCommunities = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("communities")
      .select(`*, user_communities(count)`)
      .order("updated_at", { ascending: false })
      .ilike("name", `%${query}%`, {
        config: "english",
      });

    if (error) {
      console.log(error);
    } else {
      setCommunityResults(data);
    }

    setIsLoading(false);
  };

  const getUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select()
      .ilike("username", `%${query}%`, {
        config: "english",
      });
    if (error) {
      console.log(error);
    } else {
      setUserResults(data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    getData();
  }, [query, tab]);

  return (
    <div className="mx-4 mt-6 w-full">
      <div className="flex gap-4 border-b border-b-gray-500 pb-4 mb-2">
        <button
          className={`${
            tab === "communities"
              ? "bg-black hover:bg-gray-800"
              : "bg-gray-700 hover:bg-gray-900"
          } transition py-3 px-5 rounded-full font-semibold text-white`}
          onClick={() => setTab("communities")}
        >
          Communities
        </button>
        <button
          className={`${
            tab === "users"
              ? "bg-black hover:bg-gray-800"
              : "bg-gray-700 hover:bg-gray-900"
          } transition py-3 px-5 rounded-full font-semibold text-white`}
          onClick={() => setTab("users")}
        >
          People
        </button>
      </div>

      {isLoading ? (
        <LoadingBar />
      ) : (
        <div>
          {tab === "communities" &&
            communityResults &&
            communityResults.map((community) => (
              <div
                className="flex gap-4 cursor-pointer hover:bg-gray-800 transition py-4 px-3"
                onClick={() => navigate(`/c/${community.name}`)}
              >
                {/* COMMUNITY BANNER IMAGE */}
                <div>
                  <img
                    src={community.icon_img}
                    className="w-16 h-16 rounded-lg"
                  />
                </div>

                <div className="flex flex-col">
                  {/* COMMUNITY NAME */}
                  <span className="text-white font-semibold">
                    c/{community.name}
                  </span>

                  {/* COMMUNITY INFO */}
                  <span className="text-sm">
                    {community.user_communities[0].count} members
                  </span>
                  <span>{community.description.substring(0, 50)}</span>
                </div>
              </div>
            ))}

          {tab === "communities" && communityResults.length === 0 && (
            <div className="flex justify-center mt-6">
              <span className="font-semibold text-white text-lg">
                No communities were found
              </span>
            </div>
          )}

          {tab === "users" &&
            userResults &&
            userResults.map((user) => (
              <div
                className="flex gap-4 cursor-pointer hover:bg-gray-800 transition py-4 px-3"
                onClick={() => navigate(`/u/${user.username}`)}
              >
                <div>
                  <img
                    src={user.profile_img}
                    className="w-16 h-16 rounded-full"
                  />
                </div>

                <div className="flex flex-col">
                  {/* USER'S USERNAME */}
                  <span className="text-white font-semibold">
                    {user.username}
                  </span>

                  {/* USER INFO */}
                  <span>{user.bio?.substring(0, 40)}</span>
                </div>
              </div>
            ))}

          {tab === "users" && userResults.length === 0 && (
            <div className="flex justify-center mt-6">
              <span className="font-semibold text-white text-lg">
                No users were found
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
