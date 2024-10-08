import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabase";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/");
    } catch (err) {
      throw err;
    } finally {
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      <main className="w-full h-screen flex self-center place-content-center place-items-center">
        <div className="w-96 space-y-5 p-8 shadow-xl rounded-xl bg-gray-800">
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold">Login</h2>
          </div>

          <div className="pt-8">
            <button className="w-full rounded-full bg-white py-3 font-bold border border-black">
              Sign in with Google
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-white font-bold">Email</label>
                <input
                  className="w-full mt-2 px-3 py-2 text-gray-100 bg-gray-700 hover:bg-gray-900 focus:bg-gray-900 outline-none border border-gray-500 shadow-sm rounded-full transition"
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
                  : "bg-black hover:bg-gray-800 hover:shadow-xl transition duration-300"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-white">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-bold hover:text-gray-300 transition"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
