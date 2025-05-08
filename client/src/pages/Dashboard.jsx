import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGlobeAsia,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaTag,
  FaExternalLinkAlt,
} from "react-icons/fa";

// Dummy News Data
const dummyNews = [
  {
    id: 1,
    title: "India Launches New Satellite",
    category: "Science",
    date: "2025-05-05",
    country: "India",
    state: "Andhra Pradesh",
    summary: "ISRO successfully launched a weather monitoring satellite from Sriharikota.",
    link: "https://example.com/india-satellite-launch",
    image: "https://source.unsplash.com/400x200/?space,satellite"
  },
  {
    id: 2,
    title: "AI Breakthrough in US Lab",
    category: "Technology",
    date: "2025-05-06",
    country: "USA",
    state: "California",
    summary: "Researchers at Stanford University developed a new AI that mimics human thought.",
    link: "https://example.com/ai-us-lab",
    image: "https://source.unsplash.com/400x200/?technology,ai"
  },
  {
    id: 3,
    title: "Floods in Assam",
    category: "Environment",
    date: "2025-05-07",
    country: "India",
    state: "Assam",
    summary: "Severe flooding affects thousands in northeastern India.",
    link: "https://example.com/floods-assam",
    image: "https://source.unsplash.com/400x200/?flood,disaster"
  },
  {
    id: 4,
    title: "Cricket World Cup Update",
    category: "Sports",
    date: "2025-05-08",
    country: "Australia",
    state: "New South Wales",
    summary: "India and Australia clash in a high-stakes semi-final match.",
    link: "https://example.com/cricket-world-cup",
    image: "https://source.unsplash.com/400x200/?cricket,sports"
  }
];

// Filter values
const countries = ["India", "USA", "Australia"];
const states = {
  India: ["Andhra Pradesh", "Assam"],
  USA: ["California"],
  Australia: ["New South Wales"]
};
const categories = ["Science", "Technology", "Environment", "Sports"];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({ country: "", state: "", category: "", date: "" });
  const [filteredNews, setFilteredNews] = useState([]);
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
    fetchUser();
  }, []);

  useEffect(() => {
    const filtered = dummyNews.filter(article =>
      (!filters.country || article.country === filters.country) &&
      (!filters.state || article.state === filters.state) &&
      (!filters.category || article.category === filters.category) &&
      (!filters.date || article.date === filters.date)
    );
    setFilteredNews(filtered);
  }, [filters]);

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name.split(" ").map(n => n[0].toUpperCase()).join("");
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            name="country"
            value={filters.country}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            name="state"
            value={filters.state}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md"
            disabled={!filters.country}
          >
            <option value="">All States</option>
            {(states[filters.country] || []).map(s => <option key={s} value={s}>{s}</option>)}
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

          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md"
          />
        </div>

        {/* News Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map(article => (
            <div
              key={article.id}
              className="bg-white border rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">{article.title}</h3>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <FaTag className="text-purple-400" /> {article.category}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <FaMapMarkerAlt className="text-purple-400" /> {article.state}, {article.country}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                  <FaRegCalendarAlt className="text-purple-400" /> {article.date}
                </div>
                <p className="text-sm text-gray-700 mb-3">{article.summary}</p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-purple-600 hover:underline font-medium"
                >
                  Read Full Article <FaExternalLinkAlt className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <p className="text-gray-600 mt-6">No news articles match the filters.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
