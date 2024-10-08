import React, { useEffect, useState } from "react";

import { FaRegThumbsUp } from "react-icons/fa";
import { FaThumbsUp, FaTrash } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";

import { supabase } from "../supabase/supabase";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const Comment = ({ comment, handleDeleteComment }) => {
  const currentUser = JSON.parse(
    localStorage.getItem("sb-djlsevfmhtjxmxjktbwy-auth-token")
  );

  const [isLiked, setIsLiked] = useState(false);
  const [yeahCount, setYeahCount] = useState(comment.yeahs[0].count);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const isCommentOwner = comment.users.id === currentUser.user.id;

  const getCommentStatus = async () => {
    const { data, error } = await supabase
      .from("yeahs")
      .select()
      .eq("comment_id", comment.id)
      .eq("user_id", currentUser.user.id);

    if (error) {
      console.log(error);
    } else {
      console.log(data);
      setIsLiked(data.length > 0);
    }
  };

  const likeUnlikeComment = async (e) => {
    e.preventDefault();

    if (isLiked) {
      await supabase
        .from("yeahs")
        .delete()
        .eq("comment_id", comment.id)
        .eq("user_id", currentUser.user.id);

      setIsLiked(!isLiked);
      setYeahCount(yeahCount - 1);
    } else {
      await supabase
        .from("yeahs")
        .insert({ comment_id: comment.id, user_id: currentUser.user.id });

      setIsLiked(!isLiked);
      setYeahCount(yeahCount + 1);
    }
  };

  useEffect(() => {
    getCommentStatus();
  }, []);

  return (
    <div className="flex mt-6 w-full gap-4">
      {/* USER PROFILE PIC */}
      <div>
        <img
          src={comment.users.profile_img}
          alt=""
          className="w-10 h-10 rounded-full object-cover cursor-pointer"
          onClick={() => navigate(`/u/${comment.users.username}`)}
        />
      </div>

      <div className="w-full pr-6">
        {/* USERNAME AND TIMESTAMP */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <span
              className="text-white cursor-pointer"
              onClick={() => navigate(`/u/${comment.users.username}`)}
            >
              {comment.users.username}
            </span>
            <span>{new Date(comment.created_at).toString()}</span>
          </div>

          {isCommentOwner && !isDeleting && (
            <FaTrash
              className="cursor-pointer text-white text-lg flex-shrink-0 hover:opacity-70 transition"
              onClick={() => {
                handleDeleteComment(comment.id);
                setIsDeleting(true);
              }}
            />
          )}

          {isCommentOwner && isDeleting && <LoadingSpinner size="md" />}
        </div>

        {/* COMMENT TEXT */}
        <div className="mt-2">
          <span className="text-white">{comment.text}</span>
        </div>

        <div className="mt-2">
          <button
            className={`flex gap-3 cursor-pointer rounded-full ${
              isLiked ? "bg-gray-900" : "bg-gray-700"
            } ${
              isLiked ? "hover:bg-gray-700" : "hover:bg-gray-900"
            } transition py-2 px-4 items-center text-white`}
            onClick={(e) => likeUnlikeComment(e)}
          >
            {!isLiked ? <FaRegThumbsUp /> : <FaThumbsUp />}
            <span>{yeahCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comment;
