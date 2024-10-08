import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import Register from "./pages/register/Register";
import Navbar from "./components/Navbar";
import Profile from "./pages/profile/Profile";
import Sidebar from "./components/Sidebar";
import PostPage from "./pages/post/PostPage";
import SearchResultsPage from "./pages/search/SearchResultsPage";
import CommunityPage from "./pages/community/CommunityPage";
import CreatePage from "./pages/create/CreatePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/authContext";
import ExplorePage from "./pages/explore/ExplorePage";

const queryClient = new QueryClient();

function App() {
  const { user } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {user && <Navbar />}
        <ToastContainer position="bottom-center" />

        <div className="mx-auto mt-14 max-w-7xl">
          <div className="flex">
            {user && <Sidebar />}

            <Routes>
              <Route
                path="/"
                index
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to="/" />}
              />
              <Route
                path="/register"
                element={!user ? <Register /> : <Navigate to="/" />}
              />
              <Route
                path="/u/:username"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <ExplorePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post/:id"
                element={
                  <ProtectedRoute>
                    <PostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/c/:community"
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search/:q"
                element={
                  <ProtectedRoute>
                    <SearchResultsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
