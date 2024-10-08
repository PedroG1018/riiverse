import React, { useEffect, useState } from "react";
import Post from "../../components/Post";

import { supabase } from "../../supabase/supabase";
import LoadingBar from "../../components/LoadingBar";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("sb-djlsevfmhtjxmxjktbwy-auth-token")
  );

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState("communityPosts");

  const navigate = useNavigate();

  const getData = () => {
    switch (tab) {
      case "communityPosts":
        getCommunityPosts();
        break;
      case "followingPosts":
        getFollowingPosts();
        break;
      default:
        getCommunityPosts();
        break;
    }
  };

  const getCommunityPosts = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, users(username), communities!inner(id, name, icon_img, user_communities!inner(id)), comments(count), yeahs(count)`
      )
      .order("created_at", { ascending: false })
      .eq("communities.user_communities.user_id", currentUser.user.id);

    if (error) {
      console.log("feedError", error);
    } else {
      setPosts(data);
    }

    setIsLoading(false);
  };

  const getFollowingPosts = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("follows")
      .select(
        `users!follows_following_id_fkey(posts(*, users(username), communities(id, name, icon_img), comments(count), yeahs(count)))`
      )
      .eq("follower_id", currentUser.user.id);

    if (error) {
      console.log(error);
    } else {
      console.log("following posts", data);

      if (data.length === 0) {
        setPosts([]);
      } else {
        let p = [];

        data.forEach((d) => {
          console.log(d);

          d.users.posts.forEach((post) => {
            p = [...p, post];
          });
        });

        setPosts(p);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setPosts([]);
    getData();
  }, [tab]);

  return (
    <div className="col-span-3 flex flex-col gap-4 px-6 mt-2">
      {/* FEED TABS */}
      <div className="flex mx-auto md:gap-20 gap-6">
        <button
          className={`${
            tab === "communityPosts"
              ? "text-white border-b border-b-white"
              : "text-gray-200 hover:bg-gray-700 hover:border-b hover:border-b-gray-300 transition"
          } md:px-20 px-10 py-4 font-semibold`}
          onClick={(e) => {
            e.preventDefault();
            setTab("communityPosts");
          }}
        >
          Community Feed
        </button>
        <button
          className={`${
            tab === "followingPosts"
              ? "text-white border-b border-b-white"
              : "text-gray-200 hover:bg-gray-700 hover:border-b hover:border-b-300 transition"
          } md:px-20 px-10 py-4 font-semibold`}
          onClick={(e) => {
            e.preventDefault();
            setTab("followingPosts");
          }}
        >
          Following Feed
        </button>
      </div>

      {isLoading && <LoadingBar />}

      {!isLoading && posts.length === 0 && (
        <div className="mt-2 flex flex-col gap-4 justify-center items-center">
          <span className="text-white text-lg font-semibold">
            There are no posts
          </span>

          {tab === "communityPosts" && (
            <button
              className="bg-black rounded-full py-3 px-6 text-white font-semibold text-center justify-center items-center hover:bg-opacity-50 hover:opacity-80 transition"
              onClick={() => navigate("/explore")}
            >
              Explore communities
            </button>
          )}
        </div>
      )}

      {!isLoading &&
        posts.length > 0 &&
        posts.map((post, index) => <Post key={index} post={post} />)}
    </div>
  );
};

export default Feed;
