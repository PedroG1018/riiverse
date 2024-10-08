import React, { useState } from "react";
import { supabase } from "../../supabase/supabase";
import { toast } from "react-toastify";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData, error: usernameError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username);

    if (usernameError) console.log(error);

    if (userData.length > 0) {
      toast.error("Username is already in use");
      setLoading(false);

      return;
    }

    await supabase.auth
      .signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
          },
        },
      })
      .then(async (data) => {
        await supabase
          .from("users")
          .insert({ id: data.data.user.id, username: username });
      })
      .catch((error) => {
        console.log(error);
      });

    setLoading(false);
  };

  return (
    <main className="w-full flex mx-auto items-center justify-center my-auto">
      <div className="w-96 space-y-5 p-8 shadow-xl rounded-lg bg-gray-800">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold">Sign up</h2>
        </div>

        <div className="pt-8">
          <button className="w-full rounded-full bg-white py-3 font-bold border border-black">
            Sign up with Google
          </button>
        </div>

        <div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-white font-bold">Email</label>
              <input
                className="w-full mt-2 px-3 py-2 text-gray-100 bg-gray-700 hover:bg-gray-900 focus:bg-gray-900 border border-gray-500 shadow-sm rounded-full transition"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="text-sm text-white font-bold">Username</label>
              <input
                className="w-full mt-2 px-3 py-2 text-gray-100 bg-gray-700 hover:bg-gray-900 focus:bg-gray-900 border border-gray-500 shadow-sm rounded-full transition"
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="text-sm text-white font-bold">Password</label>
              <input
                className="w-full mt-2 px-3 py-2 text-gray-100 bg-gray-700 hover:bg-gray-900 focus:bg-gray-900 border border-gray-500 shadow-sm rounded-full transition"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full px-4 py-3 text-white font-medium rounded-full ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-black hover:opacity-80 transition"
            }`}
            onClick={(e) => handleSignup(e)}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>

        <div className="text-center">
          <p className="text-white">
            Already have an account?{" "}
            <a href="/login" className="font-bold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
