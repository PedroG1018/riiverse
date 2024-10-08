import React, { useEffect, useState } from "react";
import { FaRegTrashAlt, FaFileUpload, FaTrash } from "react-icons/fa";
import { supabase } from "../../supabase/supabase";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CreateCommunity = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("sb-djlsevfmhtjxmxjktbwy-auth-token")
  );

  const initialState = {
    name: "",
    description: "",
    user_id: currentUser.user.id,
  };

  const [communityData, setCommunityData] = useState(initialState);

  const [selectedImages, setSelectedImages] = useState({
    banner_img: null,
    icon_img: null,
  });

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate: createCommunity, isPending: isCreating } = useMutation({
    mutationFn: async (e) => {
      e.preventDefault();

      // these will remain null if images are not chosen by user
      let iconImg = null;
      let bannerImg = null;

      // uploads icon image to supabase storage if it exists
      if (selectedImages.icon_img) {
        const filePath = `icons/${new Date().toString()}-${
          selectedImages.icon_img.name
        }`;

        const { error } = await supabase.storage
          .from("images")
          .upload(filePath, selectedImages.icon_img, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.log(error);
        }

        const { data } = supabase.storage.from("images").getPublicUrl(filePath);

        iconImg = data.publicUrl;
      }

      // uploads banner image to supabase storage if it exists
      if (selectedImages.banner_img) {
        const filePath = `banners/${new Date().toString()}-${
          selectedImages.banner_img.name
        }`;

        const { error } = await supabase.storage
          .from("images")
          .upload(filePath, selectedImages.banner_img, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.log(error);
        }

        const { data } = supabase.storage.from("images").getPublicUrl(filePath);

        bannerImg = data.publicUrl;
      }

      // saves community to communities table
      const { data, error } = await supabase
        .from("communities")
        .insert({ ...communityData, icon_img: iconImg, banner_img: bannerImg })
        .select();

      if (!error) {
        const { error } = await supabase
          .from("user_communities")
          .insert({ community_id: data[0].id, user_id: currentUser.user.id });

        if (error) {
          console.log(error);
        } else {
          navigate(`/c/${communityData.name}`);
        }
      } else {
        console.log(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sidebarCommunities"] });
    },
  });

  // updates community data form fields
  const handleChange = (e) => {
    setCommunityData({ ...communityData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-4">
        {/* COMMUNITY NAME INPUT */}
        <div>
          <input
            type="text"
            placeholder="Community name"
            className="rounded-full px-4 py-3 w-96 bg-gray-600 hover:opacity-80 focus:opacity-80 transition text-sm text-white placeholder:text-gray-200"
            name="name"
            value={communityData.name}
            onChange={handleChange}
          />
        </div>

        {/* COMMUNITY DESCRIPTION INPUT FIELD */}
        <div>
          <textarea
            type="text"
            placeholder="Description"
            rows="6"
            className="w-96 rounded-lg px-4 py-2 bg-gray-600 hover:opacity-80 focus:opacity-80 trasnition text-sm text-white placeholder:text-gray-200"
            name="description"
            value={communityData.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-4">
        {/* ICON IMAGE INPUT */}
        {!selectedImages.icon_img && (
          <div className="flex w-32 h-32 bg-gray-600 rounded-lg items-center justify-center text-white">
            <label
              htmlFor="iconImg"
              className="cursor-pointer flex gap-2 items-center hover:opacity-80 transition justify-center mx-auto"
            >
              <FaFileUpload className="text-4xl" />

              <input
                type="file"
                accept="image/*"
                id="iconImg"
                hidden
                onChange={(e) =>
                  setSelectedImages({
                    ...selectedImages,
                    icon_img: e.target.files[0],
                  })
                }
              />
            </label>
          </div>
        )}

        {/* ICON IMAGE */}
        {selectedImages.icon_img && (
          <div className="relative w-32">
            <img
              src={
                selectedImages.icon_img &&
                URL.createObjectURL(selectedImages.icon_img)
              }
              className="w-full h-32 object-cover rounded-lg"
            />

            <FaTrash
              className="absolute top-0 right-0 bg-black text-white rounded-full text-3xl m-1 p-2 cursor-pointer hover:opacity-80 transition"
              onClick={() =>
                setSelectedImages({ ...selectedImages, icon_img: null })
              }
            />
          </div>
        )}

        {/* BANNER IMAGE INPUT */}
        {!selectedImages.banner_img && (
          <div className="flex w-full lg:h-40 md:h-36 sm:h-32 h-28 bg-gray-600 rounded-lg items-center justify-center text-white">
            <label
              htmlFor="bannerImg"
              className="cursor-pointer flex gap-2 items-center hover:opacity-80 transition"
            >
              <FaFileUpload className="text-xl " />
              <span className="font-semibold">Choose a banner image</span>

              <input
                type="file"
                accept="image/*"
                id="bannerImg"
                hidden
                onChange={(e) =>
                  setSelectedImages({
                    ...selectedImages,
                    banner_img: e.target.files[0],
                  })
                }
              />
            </label>
          </div>
        )}

        {/* BANNER IMAGE */}
        {selectedImages.banner_img && (
          <div className="relative">
            <img
              src={
                selectedImages.banner_img &&
                URL.createObjectURL(selectedImages.banner_img)
              }
              className="w-full h-36 object-cover rounded-lg"
            />

            <FaTrash
              className="absolute top-0 right-0 bg-black text-white rounded-full text-4xl m-1 p-2 cursor-pointer hover:opacity-80 transition"
              onClick={() =>
                setSelectedImages({ ...selectedImages, banner_img: null })
              }
            />
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="mt-4">
        <button
          type="submit"
          className="text-white font-bold rounded-full py-3 px-6 bg-black hover:bg-gray-900 transition"
          onClick={(e) => createCommunity(e)}
        >
          Create Community
        </button>
      </div>
    </div>
  );
};

export default CreateCommunity;
