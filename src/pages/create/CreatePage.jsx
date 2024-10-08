import React, { useState } from "react";
import CreatePost from "./CreatePost";
import CreateCommunity from "./CreateCommunity";
import { useSearchParams } from "react-router-dom";

const CreatePage = () => {
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState("post");

  return (
    <div className="mt-4 w-full mx-6">
      <div className="flex space-x-10 items-center pb-4">
        <div
          className={`${
            tab === "post" && "border-b-2 border-b-white"
          } py-3 px-10 cursor-pointer hover:bg-gray-700 transition`}
          onClick={() => setTab("post")}
        >
          <span className="font-semibold text-white">Create Post</span>
        </div>

        <div
          className={`${
            tab === "community" && "border-b-2 border-b-white"
          } py-3 px-10 cursor-pointer hover:bg-gray-700 transition`}
          onClick={() => setTab("community")}
        >
          <span className="font-semibold text-white">Create Community</span>
        </div>
      </div>

      {tab === "post" ? (
        <CreatePost communityName={searchParams.get("community")} />
      ) : (
        <CreateCommunity />
      )}
    </div>
  );
};

export default CreatePage;
