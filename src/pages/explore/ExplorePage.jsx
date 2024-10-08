import React from "react";
import RightPanel from "../../components/RightPanel";
import CommunityList from "./CommunityList";

const ExplorePage = () => {
  return (
    <div className="w-full justify-center mx-auto xl:grid xl:grid-cols-4 mb-4">
      <CommunityList />
      <RightPanel />
    </div>
  );
};

export default ExplorePage;
