import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/image.png"
import {
  FaGlobeAsia,
  FaRegCalendarAlt,
  FaTag,
  FaExternalLinkAlt,
} from "react-icons/fa";

// ✅ Categories supported by NewsData.io
const categories = [
  "top", "business", "entertainment", "environment", "food",
  "health", "politics", "science", "sports", "technology", "tourism", "world"
];

// ✅ Countries supported by NewsData.io
const countries = ["in", "us", "gb", "au", "ca", "de", "fr", "it"];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [filters, setFilters] = useState({ category: "", country: "", page: 1 });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };

    const fetchNews = async () => {
      try {
        const params = new URLSearchParams({
          category: filters.category || "top",
          country: filters.country || "in",
          page: filters.page,
          max: 10,
        });
    
        const res = await fetch(`/api/news/filtered?${params.toString()}`);
        const data = await res.json();
    
        if (data.status === "error") {
          console.error(data.results.message);
          return;
        }
    
        // Filter articles that have no summary
        const articles = (data.articles || [])
          .filter(article => article.summary && article.summary.trim() !== "")
          .map((article, idx) => ({
            id: idx + 1,
            title: article.title,
            summary: article.summary,
            url: article.url,
            image: article.image || `https://source.unsplash.com/400x200/?news,${idx + 1}`,
            publishedAt: article.publishedAt,
            source: article.source || "Unknown",
            category: filters.category || "top",    // 👈 Add this
            country: filters.country || "in"
          }));
    
        setNews(articles);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      }
    };    
    
    fetchUser();
    fetchNews();
  }, [filters]);

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name.split(" ").map(n => n[0].toUpperCase()).join("");
  };

  const loadMoreNews = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-700">📰 NewsSummarizer</h1>
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg"
            >
              {getInitials(user.name)}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow z-20">
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Filters */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Filter News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <select
            name="country"
            value={filters.country}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* News Cards */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-10">
          {news.length === 0 ? (
            <p className="col-span-full text-gray-500 text-lg">No news available at the moment.</p>
          ) : (
            news.map((article, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col justify-between text-left border border-gray-200 min-h-[340px] max-w-[360px] mx-auto"
              >
                <img
  src={article.image}
  alt="News"
  className="w-full h-40 object-cover rounded-md mb-4"
  onError={(e) => {
    e.target.onerror = null; // Prevent infinite loop in case fallback also fails
    e.target.src = image;    // Fallback image from local assets
  }}
/>


                <div className="space-y-4">
                  <h4 className="font-semibold text-lg md:text-xl text-gray-900 tracking-normal leading-snug line-clamp-2">
                    📰 {article.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2 items-center text-xs text-gray-600">
  {/* Left Column: Date + Full Article Link */}
  <div className="space-y-1 space-y-3">
    <p className="flex items-center gap-1 text-sm">
      <FaRegCalendarAlt /> {new Date(article.publishedAt).toLocaleDateString()}
    </p>
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purple-700 hover:text-purple-900 font-medium text-sm underline flex items-center gap-1"
    >
      <FaExternalLinkAlt className="inline" /> Read Full Article
    </a>
  </div>

  {/* Right Column: Category Box + Country with Icon */}
  <div className="flex flex-col items-end space-y-3 text-right ">
    <span className="inline-block border border-purple-500 text-purple-700 text-xs justify-end font-semibold px-3 py-1 rounded-xl">
      {article.category.toUpperCase()}
    </span>
    <span className="flex font-bold text-sm items-center gap-1 justify-end">
      <FaGlobeAsia /> {article.country.toUpperCase()}
    </span>
  </div>
</div>


              </div>
            ))
          )}
        </div>

        {news.length === 0 && (
          <p className="text-gray-600 mt-6">No news articles match the filters.</p>
        )}

        {/* Load More Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMoreNews}
            className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
