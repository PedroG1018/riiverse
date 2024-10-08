import React, { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxAvatar } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useAuth } from "../contexts/authContext";

const Navbar = () => {
  const { user } = useAuth();

  const { logout } = useAuth();

  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [username, setUsername] = useState("");
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
  };

  const getUsername = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("id", user.id);

    setUsername(data[0].username);
  };

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      navigate(`/search/${query}`);
    }
  };

  useEffect(() => {
    getUsername();
    // setUsername(user.user_metadata.username);
    // getUsername();
  }, []);

  return (
    <div className="flex justify-between py-2 items-center border-opacity-50 px-4 fixed top-0 bg-black w-full z-10">
      {/* LOGO AND HAMBURGER ICON */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden cursor-pointer hover:opacity-80">
          <RxHamburgerMenu className="text-2xl text-white block" />
        </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            navigate("/");
            setShowAvatarDropdown(false);
          }}
        >
          Logo
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <input
          className="border-2 border-gray-600 bg-gray-600 hover:opacity-80 focus:opacity-80 transition rounded-full px-3 py-2 md:w-96 sm:w-80 w-40 text-white placeholder:text-gray-200"
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSearchResults(true)}
          onKeyDown={handleSearch}
        />

        {showSearchResults && (
          <div className="bg-gray-800 h-48 z-10 absolute"></div>
        )}
      </div>

      {/* CREATE AND PROFILE BUTTONS */}
      <div className="flex space-x-4">
        <button
          className="flex items-center md:space-x-2 rounded-full px-3 md:px-4 bg-gray-700 hover:opacity-80 font-semibold text-white transition"
          onClick={() => navigate("/create")}
        >
          <span className="hidden md:block">Create</span>
          <MdAdd className="text-xl" />
        </button>

        <div>
          <img
            src=""
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
            onBlur={() => setShowAvatarDropdown(false)}
          />

          <div
            className="absolute rounded-2xl mr-2 mt-2"
            hidden={!showAvatarDropdown}
          >
            <ul className="h-full text-white bg-gray-700">
              <li
                className="flex items-center space-x-4 hover:bg-gray-900 transition cursor-pointer p-4"
                onClick={() => {
                  navigate(`/u/${username}`);
                  setShowAvatarDropdown(false);
                }}
              >
                <RxAvatar size={30} />
                <div className="flex flex-col text-sm">
                  <span className="">View Profile</span>
                  <span className="text-gray-400">{username}</span>
                </div>
              </li>

              <li
                className="flex items-center space-x-4 hover:bg-gray-900 transition cursor-pointer p-4"
                onClick={() => {
                  handleLogout();
                  setShowAvatarDropdown(false);
                }}
              >
                <FiLogOut size={28} />
                <span className="text-sm">Logout</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
