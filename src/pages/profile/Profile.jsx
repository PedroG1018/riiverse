import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdEdit, MdAdd } from "react-icons/md";
import { supabase } from "../../supabase/supabase";
import Post from "../../components/Post";
import Comment from "../../components/Comment";
import LoadingSpinner from "../../components/LoadingSpinner";

const Profile = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("sb-djlsevfmhtjxmxjktbwy-auth-token")
  );

  const { username } = useParams();
  const [user, setUser] = useState(null);

  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);

  const [tab, setTab] = useState("posts");
  const [isProfileOwner, setIsProfileOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowingPending, setIsFollowingPending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  // retrieves the user's profile information
  const getUser = async () => {
    setIsLoading(true);
    setIsUpdating(true);

    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("username", username);

    setUser(data[0]);
    setIsProfileOwner(currentUser.user.id === data[0].id);

    const res = await supabase
      .from("follows")
      .select()
      .eq("follower_id", currentUser.user.id)
      .eq("following_id", data[0].id);

    setIsFollowing(res.data.length > 0);
    setIsUpdating(false);
    setIsLoading(false);
  };

  // retrives data based on selected tab
  const getData = () => {
    switch (tab) {
      case "posts":
        getUserPosts();
        break;
      case "comments":
        getUserComments();
        break;
      case "communities":
        getUserCommunities();
        break;
      default:
        getUserPosts();
    }
  };

  // retrieves all the users' posts
  const getUserPosts = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, users(username), communities(name, icon_img), comments(count), yeahs(count)"
        )
        .order("created_at", { ascending: false })
        .eq("user_id", user.id);

      if (error) {
        console.log(error);
      } else {
        setUserPosts(data);
      }
    }
  };

  // retrieves all the user's comments
  const getUserComments = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("comments")
        .select(`*, users(id, username, profile_img), yeahs(count)`)
        .order("created_at", { ascending: false })
        .eq("user_id", user.id);

      if (error) {
        console.log(error);
      } else {
        setUserComments(data);
      }
    }
  };

  // retrieves all of the user's joined communities
  const getUserCommunities = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("user_communities")
        .select(`id, communities(*, user_communities(count))`)
        .order("updated_at", { ascending: false })
        .eq("user_id", user.id);

      if (error) {
        console.log(error);
      } else {
        setUserCommunities(data);
      }
    }
  };

  // updates icon or banner image of user
  // saves image to supabase storage
  const uploadImage = async (e, folder) => {
    setIsUpdating(true);

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

    setUser({ ...user, [e.target.name]: data.publicUrl });

    await supabase
      .from("users")
      .update({ [e.target.name]: data.publicUrl })
      .eq("id", user.id);

    setIsUpdating(false);
  };

  const followUnfollowUser = async (e) => {
    e.preventDefault();
    setIsFollowingPending(true);

    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.user.id)
        .eq("following_id", user.id);

      if (error) {
        console.log(error);
      } else {
        setIsFollowing(false);
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUser.user.id, following_id: user.id });

      if (error) {
        console.log(error);
      } else {
        setIsFollowing(true);
      }
    }

    setIsFollowingPending(false);
  };

  // TODO: make this a custom hook
  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", currentUser.user.id);

    if (error) {
      console.log(error);
    } else {
      setUserComments([]);
      getComments();
    }
  };

  useEffect(() => {
    setUser(null);
    getUser();
  }, [username]);

  useEffect(() => {
    getData();
  }, [tab, user]);

  return (
    <div className="grid grid-cols-3 w-full gap-4 mt-4 px-4">
      <div className="col-span-3 lg:col-span-2">
        <div>
          <div className="flex items-center text-white gap-4">
            {/* PROFILE IMAGE */}
            {!isUpdating ? (
              <div className="relative">
                <img
                  src={user?.profile_img}
                  className="w-20 h-20 rounded-lg border border-white object-cover"
                />
                {isProfileOwner && (
                  <label
                    htmlFor="uploadProfileImg"
                    className="absolute right-0 bottom-0"
                  >
                    <div className="rounded-full p-1 bg-black hover:bg-gray-800 transition">
                      <MdEdit className="cursor-pointer text-xl" />
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      id="uploadProfileImg"
                      name="profile_img"
                      hidden
                      onChange={(e) => uploadImage(e, "avatars")}
                    />
                  </label>
                )}
              </div>
            ) : (
              <LoadingSpinner size="lg" />
            )}

            {/* USERNAME */}
            <div>
              <span className="font-bold text-2xl">{user?.username}</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex mt-10 mb-4 gap-3 text-white">
          {/* POSTS TAB BUTTON */}
          <button
            className={`${
              tab === "posts" ? "bg-gray-900" : "bg-gray-700"
            } hover:bg-gray-900 transition rounded-full px-5 py-3 text-sm font-semibold`}
            onClick={() => setTab("posts")}
          >
            Posts
          </button>

          {/* COMMENTS TAB BUTTON */}
          <button
            className={`${
              tab === "comments" ? "bg-gray-900" : "bg-gray-700"
            } hover:bg-gray-900 transition rounded-full px-5 py-3 text-sm font-semibold`}
            onClick={() => setTab("comments")}
          >
            Comments
          </button>

          {/* COMMUNITIES TAB BUTTON */}
          <button
            className={`${
              tab === "communities" ? "bg-gray-900" : "bg-gray-700"
            } hover:bg-gray-900 transition rounded-full px-5 py-3 text-sm font-semibold`}
            onClick={() => setTab("communities")}
          >
            Communities
          </button>
        </div>

        {/* USER POSTS */}
        {tab === "posts" && (
          <div>
            {userPosts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* USER COMMENTS */}
        {tab === "comments" && (
          <div>
            {userComments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                handleDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
        )}

        {/* USER COMMUNITIES */}
        {tab === "communities" &&
          userCommunities.map((community) => (
            <div
              className="flex gap-4 cursor-pointer hover:bg-gray-800 transition py-4 px-3"
              onClick={() => navigate(`/c/${community.communities.name}`)}
            >
              {/* COMMUNITY BANNER IMAGE */}
              <div>
                <img
                  src={community.communities.icon_img}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>

              <div className="flex flex-col">
                {/* COMMUNITY NAME */}
                <span className="text-white font-semibold">
                  c/{community.communities.name}
                </span>

                <span className="text-sm">
                  {community.communities.user_communities[0].count} members
                </span>
                <span>
                  {community.communities.description.substring(0, 50)}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* USER PROFILE OVERVIEW SECTION */}
      <div
        className={`hidden lg:block lg:col-span-1 bg-gray-600 h-96 rounded-xl overflow-hidden`}
      >
        {/* BANNER IMAGE */}
        <div className="relative">
          {user?.banner_img ? (
            <img src={user?.banner_img} className="h-24 w-full object-cover" />
          ) : (
            <div className="w-full h-24 bg-gray-400"></div>
          )}

          {isProfileOwner && (
            <label
              htmlFor="uploadBannerImg"
              className="absolute top-0 right-0 p-1"
            >
              <div className="rounded-full border border-white p-1 bg-black hover:bg-gray-800 transition">
                <MdEdit className=" cursor-pointer" />
              </div>
              <input
                type="file"
                accept="image/*"
                hidden
                id="uploadBannerImg"
                name="banner_img"
                onChange={(e) => uploadImage(e, "banners")}
              />
            </label>
          )}
        </div>

        {/* USER INFO */}
        <div className="px-3 py-2">
          <div className="mb-1">
            <span className="font-semibold text-white">{user?.username}</span>
          </div>
          {!isProfileOwner && (
            <button
              className="flex items-center bg-gray-800 hover:bg-gray-900 transition px-4 py-1 rounded-full text-white"
              onClick={followUnfollowUser}
            >
              {!isFollowingPending ? (
                <div className="flex gap-1 items-center">
                  {!isFollowing ? <span>Follow</span> : <span>Following</span>}
                  <MdAdd className="font-semibold" />
                </div>
              ) : (
                <LoadingSpinner size="sm" />
              )}
            </button>
          )}
          <div className="flex"></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
