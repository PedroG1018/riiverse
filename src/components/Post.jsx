import React, { useEffect, useState } from "react";
import { FaRegThumbsUp } from "react-icons/fa";
import { FaThumbsUp } from "react-icons/fa";
import { FaRegCommentAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabase";

const Post = ({ post }) => {
  const currentUser = JSON.parse(
    localStorage.getItem("sb-djlsevfmhtjxmxjktbwy-auth-token")
  );

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.yeahs[0].count);

  const navigate = useNavigate();

  const getPostStatus = async () => {
    const { data, error } = await supabase
      .from("yeahs")
      .select()
      .eq("post_id", post.id)
      .eq("user_id", currentUser.user.id);

    if (error) {
      console.log(error);
    } else {
      setIsLiked(data.length > 0);
    }
  };

  const likeUnlikePost = async (e) => {
    e.preventDefault();

    if (isLiked) {
      await supabase
        .from("yeahs")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUser.user.id);

      setIsLiked(!isLiked);
      setLikeCount(likeCount - 1);
    } else {
      await supabase
        .from("yeahs")
        .insert({ post_id: post.id, user_id: currentUser.user.id });

      setIsLiked(!isLiked);
      setLikeCount(likeCount + 1);
    }
  };

  useEffect(() => {
    getPostStatus();
  }, []);

  return (
    <div className="p-2 rounded-lg">
      <div className="flex space-x-3 ">
        <img
          src={post?.communities.icon_img}
          className="rounded-lg w-10 h-10 cursor-pointer"
          onClick={() => navigate(`/c/${post?.communities.name}`)}
        />

        <div className="flex flex-col">
          <Link
            to={`/c/${post?.communities.name}`}
            className="font-semibold text-sm text-gray-100"
          >
            c/{post?.communities.name}
          </Link>
          <Link
            to={`/u/${post?.users.username}`}
            className="text-sm text-gray-300"
          >
            {post?.users.username}
          </Link>
        </div>
        <span className="text-sm">{new Date(post?.created_at).toString()}</span>
      </div>

      <div className="flex flex-col gap-2 mt-2 text-white">
        <span className="text-lg font-semibold">{post?.title}</span>
        <span>{post?.text}</span>
      </div>

      {post?.img && (
        <div className="bg-gray-700 rounded-lg flex justify-center mx-auto">
          <img src={post?.img} className="object-contain h-96" />
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          className={`flex gap-3 cursor-pointer rounded-full ${
            isLiked ? "bg-gray-900" : "bg-gray-700"
          } ${
            isLiked ? "hover:bg-gray-700" : "hover:bg-gray-900"
          } transition py-2 px-4 items-center text-white`}
          onClick={(e) => likeUnlikePost(e)}
        >
          {!isLiked ? <FaRegThumbsUp /> : <FaThumbsUp />}
          <span>{likeCount}</span>
        </button>

        <div
          className="flex gap-3 cursor-pointer rounded-full bg-gray-700 py-2 px-4 items-center text-white"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <FaRegCommentAlt />
          <span>{post.comments[0].count}</span>
        </div>
      </div>
    </div>
  );
};

export default Post;
