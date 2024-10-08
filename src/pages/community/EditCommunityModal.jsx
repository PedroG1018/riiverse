import React, { useState } from "react";
import { MdEdit } from "react-icons/md";
import { supabase } from "../../supabase/supabase";

const EditCommunityModal = ({
  communityId,
  communityName,
  communityDescription,
}) => {
  const [communityData, setCommunityData] = useState({
    name: communityName,
    description: communityDescription,
  });

  // updates community with updated information, reloads page
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("communities")
      .update(communityData)
      .eq("id", communityId);

    if (error) {
      console.log(error);
    } else {
      window.location.reload(false);
    }
  };

  return (
    <>
      <label
        htmlFor="edit_modal"
        className="flex items-center gap-2 font-semibold bg-gray-700 hover:bg-gray-900 transition py-2 px-3 lg:px-4 rounded-full cursor-pointer"
      >
        <MdEdit className="text-lg" />
        <span className="hidden lg:block">Edit</span>{" "}
      </label>

      <input
        type="checkbox"
        id="edit_modal"
        className="modal-toggle mr-0 pr-0"
      />
      <div className="modal" role="dialog mr-0 pr-0">
        <div className="modal-box flex flex-col gap-4">
          <h3 className="px-3 font-bold text-xl">Edit community</h3>
          {/* COMMUNITY NAME INPUT FIELD */}
          <div>
            <input
              type="text"
              className="w-full rounded-full py-3 px-4"
              placeholder="Community name"
              required
              name="name"
              value={communityData.name}
              onChange={(e) => {
                setCommunityData({
                  ...communityData,
                  [e.target.name]: e.target.value,
                });
              }}
            />
          </div>

          {/* COMMUNITY DESCRIPTION INPUT FIELD */}
          <div>
            <textarea
              rows={6}
              className="w-full rounded-xl px-4 py-3"
              placeholder="Description"
              required
              name="description"
              value={communityData.description}
              onChange={(e) =>
                setCommunityData({
                  ...communityData,
                  [e.target.name]: e.target.value,
                })
              }
            />
          </div>

          <button
            className="btn bg-purple-800 hover:bg-purple-600 transition text-white"
            onClick={(e) => handleSubmit(e)}
          >
            Update
          </button>
        </div>
        <label className="modal-backdrop" htmlFor="edit_modal">
          Close
        </label>
      </div>
    </>
  );
};

export default EditCommunityModal;
