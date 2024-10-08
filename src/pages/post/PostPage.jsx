import React, { useEffect, useState } from "react";
import Post from "../../components/Post";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import Comment from "../../components/Comment";
import LoadingBar from "../../components/LoadingBar";

const PostPage = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("sb-djlsevfmhtjxmxjktbwy-auth-token")
  );
  const { id: postId } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // retrieve post from the id search param
  const getPost = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, users(username), communities(name, icon_img), comments(count), yeahs(count)`
      )
      .eq("id", postId);

    if (error) {
      console.log(error);
    } else {
      setPost(data[0]);
      getComments();
    }

    setIsLoading(false);
  };

  // get comments left on this post
  const getComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, users(id, username, profile_img), yeahs(count)")
      .eq("post_id", postId);

    console.log("data", data);

    if (error) {
      console.log(error);
    } else {
      setComments(data);
    }
  };

  const handleSubmit = async () => {
    setIsPosting(true);

    const commentData = {
      text: text,
      post_id: postId,
      user_id: currentUser.user.id,
    };

    const { error } = await supabase.from("comments").insert(commentData);

    setIsPosting(false);

    if (error) {
      console.log(error);
    } else {
      setComments([]);
      setText("");
      getComments();
    }
  };

  // deletes comment
  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", currentUser.user.id);

    if (error) {
      console.log(error);
    } else {
      setComments([]);
      getComments();
    }

    console.log("comment id", commentId);
  };

  useEffect(() => {
    getPost();
  }, []);

  if (isLoading) return <LoadingBar />;

  return (
    <div className="px-12 mt-4 w-full">
      {post && <Post post={post} />}
      <div className="mb-8">
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            disabled={isPosting}
            placeholder="Add a comment"
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-white rounded-full bg-gray-600 hover:bg-gray-900 focus:bg-gray-900 transition px-4 py-3"
          />
          <button
            className="text-white font-semibold bg-black hover:bg-gray-900 transition rounded-full px-4 py-2"
            onClick={handleSubmit}
          >
            {isPosting ? <span>Posting...</span> : <span>Post</span>}
          </button>
        </div>

        {!isPosting &&
          comments?.map((comment) => (
            <div key={comment.id} className="w-full">
              <Comment
                key={comment.id}
                comment={comment}
                handleDeleteComment={handleDeleteComment}
              />
            </div>
          ))}

        {!isLoading && comments.length === 0 && (
          <div className="flex justify-center mt-10">
            <span className="text-white font-bold text-xl">
              This post has no comments... yet
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;
