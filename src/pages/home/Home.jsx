import React, { useEffect } from "react";
import Feed from "./Feed";
import { useAuth } from "../../contexts/authContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase/supabase";
import RightPanel from "../../components/RightPanel";

const Home = () => {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("id", user.id);

      return data;
    },
  });

  return (
    <div className="w-full justify-center mx-auto xl:grid xl:grid-cols-4 mb-4">
      <Feed />
      <RightPanel />
    </div>
  );
};

export default Home;
