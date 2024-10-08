import React, { useEffect, useState } from "react";
import { FaFileUpload, FaRegTrashAlt } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CreatePost = ({ communityName }) => {
  const userId = JSON.parse(
    localStorage.getItem("sb-djlsevfmhtjxmxjktbwy-auth-token")
  ).user.id;

  const initialState = {
    title: "",
    text: "",
    spoilers: false,
    user_id: userId,
  };

  const [postData, setPostData] = useState(initialState);

  const [userCommunities, setUserCommunities] = useState([]);
  const [showCommunities, setShowCommunities] = useState(false);

  const [selectedCommunity, setSelectedCommunity] = useState(
    communityName ? communityName : ""
  );

  const [tab, setTab] = useState("text");
  const [selectedImage, setSelectedImage] = useState(null);

  const [isPosting, setIsPosting] = useState(false);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  // submits the post to the selected community
  // redirects user to community
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPosting(true);

    // raise error if there is no selected community
    if (selectedCommunity === "") {
      toast.error("Please select a community");
      setIsPosting(false);
      return;
    }

    // raise error if title field is empty
    if (postData.title === "") {
      toast.error("Each post must have a title", {
        position: "bottom-center",
      });
      setIsPosting(false);
      return;
    }

    // raise error if text field is empty
    if (tab === "text" && postData.text === "") {
      toast.error("Text field is empty");
      setIsPosting(false);
      return;
    }

    // raise error if no image has been selected
    if (tab === "image" && !selectedImage) {
      toast.error("Please select an image");
      setIsPosting(false);
      return;
    }

    // get id of selectd community
    const { data, error } = await supabase
      .from("communities")
      .select("id")
      .eq("name", selectedCommunity);

    const communityId = data[0].id;

    // submit post if all checks passed
    if (tab === "text") {
      const { error } = await supabase
        .from("posts")
        .insert({ ...postData, community_id: communityId });

      if (error) {
        console.log(error);
      }
    } else if (tab === "image" && selectedImage) {
      const filePath = `post_images/${new Date().toString()}/${
        selectedImage.name
      }`;

      await supabase.storage.from("images").upload(filePath, selectedImage, {
        cacheControl: "3600",
        upsert: false,
      });

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);

      const img = data.publicUrl;

      const { error } = await supabase
        .from("posts")
        .insert({ ...postData, img: img, community_id: communityId });

      if (error) {
        console.log(error);
      }
    }

    setIsPosting(false);
    setPostData(initialState);
    setSelectedCommunity("");
    navigate(`/c/${selectedCommunity}`);
  };

  const { mutate: submitPost, isPending: isSubmittingPost } = useMutation({
    mutationFn: async (e) => {
      e.preventDefault();
      setIsPosting(true);

      // raise error if there is no selected community
      if (selectedCommunity === "") {
        toast.error("Please select a community");
        setIsPosting(false);
        return;
      }

      // raise error if title field is empty
      if (postData.title === "") {
        toast.error("Each post must have a title", {
          position: "bottom-center",
        });
        setIsPosting(false);
        return;
      }

      // raise error if text field is empty
      if (tab === "text" && postData.text === "") {
        toast.error("Text field is empty");
        setIsPosting(false);
        return;
      }

      // raise error if no image has been selected
      if (tab === "image" && !selectedImage) {
        toast.error("Please select an image");
        setIsPosting(false);
        return;
      }

      // get id of selectd community
      const { data, error } = await supabase
        .from("communities")
        .select("id")
        .eq("name", selectedCommunity);

      const communityId = data[0].id;

      // submit post if all checks passed
      if (tab === "text") {
        const { error } = await supabase
          .from("posts")
          .insert({ ...postData, community_id: communityId });

        if (error) {
          console.log(error);
        }
      } else if (tab === "image" && selectedImage) {
        const filePath = `post_images/${new Date().toString()}/${
          selectedImage.name
        }`;

        await supabase.storage.from("images").upload(filePath, selectedImage, {
          cacheControl: "3600",
          upsert: false,
        });

        const { data } = supabase.storage.from("images").getPublicUrl(filePath);

        const img = data.publicUrl;

        const { error } = await supabase
          .from("posts")
          .insert({ ...postData, img: img, community_id: communityId });

        if (error) {
          console.log(error);
        }
      }

      setIsPosting(false);
      setPostData(initialState);
      setSelectedCommunity("");
      navigate(`/c/${selectedCommunity}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trendingCommunities"] });
    },
  });

  // updates form fields
  const handleChange = (e) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
  };

  // retrieve the user's joined communities
  const getUserCommunities = async () => {
    const { data, error } = await supabase
      .from("user_communities")
      .select(
        `
        communities(id, name, icon_img)`
      )
      .eq("user_id", userId);

    if (error) {
      console.log(error);
    } else {
      setUserCommunities(data);
    }
  };

  useEffect(() => {
    getUserCommunities();
  }, []);

  useEffect(() => {
    setPostData({ ...postData, text: "" });
    setSelectedImage(null);
  }, [tab]);

  return (
    <div className="mt-4">
      <div>
        {/* COMMUNITY SEARCH DROPDOWN */}
        <button
          className={`flex justify-between items-center text-sm rounded-full ${
            showCommunities ? "opacity-90" : "bg-gray-600"
          } hover:opacity-80 transition py-3 px-4 w-80 border border-gray-700 text-white`}
          onClick={(e) => {
            e.preventDefault();
            setShowCommunities(!showCommunities);
          }}
        >
          <span className="text-sm text-gray-200">
            {selectedCommunity === ""
              ? "Select a community"
              : "c/" + selectedCommunity}
          </span>
          {!showCommunities ? <FaChevronDown /> : <FaChevronUp />}
        </button>

        {/* COMMUNITY LIST */}
        {showCommunities && (
          <div className="absolute bg-black mt-1 text-white w-80 dropshadow-lg transition rounded-lg overflow-auto">
            <ul>
              {userCommunities.map((community) => (
                <li
                  key={community.communities.name}
                  className="flex gap-2 items-center cursor-pointer hover:bg-gray-900 transition pl-2 py-3"
                  onClick={() => {
                    setSelectedCommunity(community.communities.name);
                    setPostData({
                      ...postData,
                      community_id: community.communities.id,
                    });
                    setShowCommunities(!showCommunities);
                  }}
                >
                  <img
                    src={community.communities.icon_img}
                    className="w-8 h-8 rounded-lg object-cover bg-gray-300"
                  />
                  <span className="text-md font-semibold">
                    c/{community.communities.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* TEXT AND IMAGE TABS */}
        <div className="flex space-x-10 mt-6 text-white">
          <div
            className={`py-3 px-10 cursor-pointer hover:bg-gray-700 transition ${
              tab === "text" && "border-b-2 border-b-white"
            }`}
            onClick={() => setTab("text")}
          >
            <span className="text-sm font-semibold">Text</span>
          </div>
          <div
            className={`py-3 px-10 cursor-pointer hover:bg-gray-700 transition ${
              tab === "image" && "border-b-2 border-b-white"
            }`}
            onClick={() => setTab("image")}
          >
            {" "}
            <span className="text-sm font-semibold">Image</span>
          </div>
        </div>

        {/* TITLE INPUT */}
        <div className="mt-8 mb-6">
          <input
            className="border border-gray-700 rounded-full p-3 w-96 bg-gray-600 focus:opacity-80 hover:opacity-80 transition text-sm text-white placeholder:text-gray-200"
            placeholder="Title"
            required
            name="title"
            value={postData.title}
            onChange={handleChange}
          />
        </div>

        {/* TEXT POST FORM */}
        {tab === "text" && (
          <div>
            <textarea
              placeholder="What do you want to say?..."
              required
              rows="6"
              className="p-2.5 w-96 text-sm text-white bg-gray-600 focus:opacity-80 hover:opacity-80 transition rounded-lg border border-gray-700 placeholder:text-gray-200"
              name="text"
              value={postData.text}
              onChange={handleChange}
            />
          </div>
        )}

        {/* IMAGE POST FORM */}
        {tab === "image" && (
          <div>
            {!selectedImage && (
              <div className="flex w-full h-36 bg-gray-600 rounded-lg items-center justify-center text-white">
                <label
                  htmlFor="img"
                  className="cursor-pointer flex gap-2 items-center hover:opacity-80 transition"
                >
                  <FaFileUpload className="text-xl" />
                  <span className="font-semibold">Choose an image</span>
                  <input
                    type="file"
                    accept="image/*"
                    id="img"
                    hidden
                    onChange={(e) => {
                      setSelectedImage(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            )}

            {/* SELECTED POST IMAGE */}
            {selectedImage && (
              <div className="relative">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  className="h-96 w-full rounded-lg object-contain bg-gray-600"
                />

                <FaRegTrashAlt
                  className="absolute top-0 right-0 bg-black text-white rounded-full text-4xl m-1 p-2 cursor-pointer hover:opacity-80 transition"
                  onClick={() => setSelectedImage(null)}
                />
              </div>
            )}
          </div>
        )}

        <div className="max-w-full right-0 mt-4">
          <button
            type="submit"
            disabled={isPosting}
            className={`text-white font-bold rounded-full py-3 px-6 ${
              isPosting ? "bg-gray-700" : "bg-black"
            } hover:bg-gray-700 transition items-center`}
            onClick={(e) => submitPost(e)}
          >
            {!isPosting ? (
              "Post"
            ) : (
              <div className="flex gap-2 items-center">
                <span className="loading loading-spinner"></span>
                <span className="text">Posting</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
