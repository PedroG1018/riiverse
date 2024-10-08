import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Post from "../../components/Post";
import { MdAdd } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { supabase } from "../../supabase/supabase";
import EditCommunityModal from "./EditCommunityModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-toastify";

const Community = () => {
  const { community: communityName } = useParams();

  const queryClient = useQueryClient();

  const currentUser = JSON.parse(
    localStorage.getItem("sb-djlsevfmhtjxmxjktbwy-auth-token")
  );

  const [communityPosts, setCommunityPosts] = useState([]);
  const [community, setCommunity] = useState({});
  const [joined, setJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortParameter, setSortParameter] = useState("recent");

  const navigate = useNavigate();

  // grabs every post belonging to current community
  const getCommunityPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(
        "*, users(username), communities!inner(id, name, icon_img, banner_img, description), comments(count), yeahs(count)"
      )
      .order("created_at", { ascending: false })
      .eq("communities.name", communityName);

    if (sortParameter === "top") {
      setCommunityPosts(
        data.sort((a, b) => b.yeahs[0].count - a.yeahs[0].count)
      );
    } else if (sortParameter === "recent") {
      setCommunityPosts(data);
    }

    setIsLoading(false);
  };

  // get the current community info using the community name in search params
  const getCurrentCommunity = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*, user_communities(count)")
      .eq("name", communityName);

    if (error) {
      console.log(error);
    } else {
      setCommunity(data[0]);
    }
  };

  // sets user's joined status
  const getJoined = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("user_communities(user_id)")
      .eq("name", communityName)
      .eq("user_communities.user_id", currentUser.user.id);

    if (!error && data[0].user_communities.length > 0) {
      setJoined(true);
    }
  };

  // sets whether current user is owner of current community
  const getIsOwner = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select(`id`)
      .eq("name", communityName)
      .eq("user_id", currentUser.user.id);

    if (!error && data.length > 0) {
      console.log("is owner?");

      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  };

  // updates community banner/icon images, uploades images to supabase storage in appropriate folder

  const uploadImage = async (e, folder) => {
    const imageFile = e.target.files[0];
    const filePath = `${folder}/${new Date().toString()}-${imageFile.name}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.log(error);
    }

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);

    setCommunity({ ...community, [e.target.name]: data.publicUrl });

    await supabase
      .from("communities")
      .update({ [e.target.name]: data.publicUrl })
      .eq("id", community.id);
  };

  const { mutate: updateImage, isPending: isUpdatingImage } = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebarCommunities"] });
    },
  });

  const { mutate: joinUnjoinCommunity, isPending: isJoining } = useMutation({
    mutationFn: async (e) => {
      e.preventDefault();

      const { data, error } = await supabase
        .from("communities")
        .select("id, user_communities(id)")
        .eq("name", communityName)
        .eq("user_communities.user_id", currentUser.user.id);

      if (error) {
        console.log("error", error);
      } else {
        if (data[0].user_communities.length === 0) {
          // join community
          const communityId = data[0].id;

          await supabase
            .from("user_communities")
            .insert({ user_id: currentUser.user.id, community_id: communityId })
            .select();

          setJoined(true);
        } else {
          // unjoin community
          const userCommunityId = data[0].user_communities[0].id;

          await supabase
            .from("user_communities")
            .delete()
            .eq("id", userCommunityId);

          setJoined(false);
        }
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trendingCommunities"] }),
        queryClient.invalidateQueries({ queryKey: ["sidebarCommunities"] }),
      ]);
    },
  });

  useEffect(() => {
    setCommunity({});
    getCurrentCommunity();
  }, [communityName]);

  useEffect(() => {
    getCommunityPosts();
  }, [communityName, sortParameter]);

  useEffect(() => {
    getJoined();
  }, [communityName]);

  useEffect(() => {
    getIsOwner();
  }, [communityName]);

  return (
    <div className="w-full px-4 mt-4">
      <div>
        {/* COMMUNITY BANNER */}
        <div className="relative">
          {community.banner_img ? (
            <img
              src={community.banner_img}
              className="w-full lg:h-40 md:h-36 sm:h-32 h-28 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full lg:h-40 md:h-36 sm:h-32 h-28 bg-gray-600 rounded-lg"></div>
          )}
          {isOwner && (
            <label
              htmlFor="uploadBannerImg"
              className="absolute top-0 right-0 rounded-full p-1 bg-black hover:bg-gray-800 transition m-1"
            >
              <MdEdit className="text-white text-2xl cursor-pointer" />
              <input
                type="file"
                id="uploadBannerImg"
                name="banner_img"
                hidden
                onChange={(e) => updateImage(e, "banners")}
              />
            </label>
          )}
        </div>

        {/* INFO */}
        <div className="flex ml-4 space-x-2 items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="relative">
              {!isUpdatingImage ? (
                <img
                  src={community.icon_img}
                  className="mt-[-25px] w-20 h-20 rounded-3xl border-2 border-white bg-gray-300 flex-shrink-0 object-cover"
                />
              ) : (
                <div className="flex flex-shrink-0 mt-[-25px] w-20 h-20 rounded-3xl bg-black items-center justify-center ">
                  <LoadingSpinner size="sm" />
                </div>
              )}

              {isOwner && (
                <label
                  htmlFor="uploadIconImg"
                  className="absolute bottom-0 right-0 rounded-full p-1 bg-black hover:bg-gray-800 transition"
                >
                  <MdEdit className="text-white text-2xl cursor-pointer" />
                  <input
                    type="file"
                    id="uploadIconImg"
                    name="icon_img"
                    hidden
                    onChange={(e) => updateImage(e, "icons")}
                  />
                </label>
              )}
            </div>

            <span className="text-2xl font-bold text-white">
              c/{communityName}
            </span>
          </div>

          <div className="flex gap-2 text-white mt-2">
            <button
              className="flex items-center lg:gap-2 font-semibold bg-gray-700 px-3 lg:px-4 rounded-full hover:bg-gray-900 transition"
              onClick={() => {
                if (!joined) {
                  toast.warning("Join community to post!");
                  return;
                }
                navigate(`/create?community=${community.name}`);
              }}
            >
              <span className="hidden lg:block">Create a Post</span>
              <MdAdd className="text-lg" />
            </button>

            <button
              className={`font-semibold text-white ${
                !joined ? "bg-gray-700" : "bg-black"
              } text-white py-2 px-4 rounded-full ${
                !joined ? "hover:bg-gray-900" : "hover:bg-gray-700"
              } transition items-center`}
              onClick={(e) => joinUnjoinCommunity(e)}
            >
              {isJoining ? (
                <LoadingSpinner size="sm" />
              ) : joined ? (
                <span>Joined</span>
              ) : (
                <span>Join</span>
              )}
            </button>

            {isOwner && (
              <EditCommunityModal
                communityId={community.id}
                communityName={communityName}
                communityDescription={community.description}
              />
            )}
          </div>
        </div>
      </div>

      {/* SORT BUTTONS */}
      <div className="flex gap-2 items-center mt-6 ml-2 text-white">
        <span className="font-semibold">Sort by:</span>
        <button
          className={`px-4 rounded-full ${
            sortParameter === "top" ? "bg-black" : "bg-gray-700"
          } ${
            sortParameter === "top" ? "hover:bg-gray-800" : "hover:bg-gray-900"
          } transition py-2`}
          onClick={() => setSortParameter("top")}
        >
          Top
        </button>
        <button
          className={`px-4 rounded-full ${
            sortParameter === "recent" ? "bg-black" : "bg-gray-700"
          } ${
            sortParameter === "recent"
              ? "hover:bg-gray-800"
              : "hover:bg-gray-900"
          } transition py-2`}
          onClick={() => setSortParameter("recent")}
        >
          Recent
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-4 flex gap-4">
        {/* COMMUNITY POSTS */}
        <div className="flex-1">
          {communityPosts.length > 0 &&
            !isLoading &&
            communityPosts?.map((post) => <Post key={post.id} post={post} />)}

          {communityPosts.length === 0 && !isLoading && (
            <div className="text-center">
              <span className="font-semibold text-xl text-gray-200">
                There are no posts... yet
              </span>
            </div>
          )}
        </div>

        {/* COMMUNITY INFO BOX */}
        <div className="hidden md:flex md:flex-col gap-2 px-3 pt-2   text-white bg-gray-600 rounded-lg h-auto flex-none w-80">
          <span className="text-white font-semibold">{community.name}</span>
          <span className="text-gray-300">{community.description}</span>

          <span className="text-sm">
            {community.user_communities && (
              <b>{community.user_communities[0].count}</b>
            )}
            <span> Members</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Community;
