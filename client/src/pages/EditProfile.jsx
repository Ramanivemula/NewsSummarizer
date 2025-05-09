import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Globe } from 'lucide-react';

function EditProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    category: '',
    notifyDaily: false,
    deliveryMethod: 'email',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(response.data.user);
      } catch (err) {
        setMessage('❌ Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/update', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ Profile updated successfully');
      navigate('/dashboard');
    } catch (err) {
      setMessage('❌ Update failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Edit Your Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="flex items-center gap-3 px-4 py-2 border rounded-xl bg-gray-50">
            <User className="text-gray-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full bg-transparent outline-none text-sm"
              required
            />
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 px-4 py-2 border rounded-xl bg-gray-50">
            <Mail className="text-gray-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full bg-transparent outline-none text-sm"
              required
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl text-sm bg-gray-50"
              required
            >
              <option value="">Select Country</option>
              {["in", "us", "gb", "au", "ca", "de", "fr", "it"].map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl text-sm bg-gray-50"
              required
            >
              <option value="">Select Category</option>
              {["top", "business", "entertainment", "environment", "food", "health", "politics", "science", "sports", "technology", "tourism", "world"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              name="notifyDaily"
              checked={formData.notifyDaily}
              onChange={handleChange}
              className="accent-blue-600"
            />
            <label htmlFor="notifyDaily">Send me daily news updates</label>
          </div>

          {/* Delivery Method */}
          <div>
            <label className="block text-sm mb-1 text-gray-700">Delivery Method</label>
            <select
              name="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl text-sm bg-gray-50"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition duration-300 shadow-md"
          >
            Update Profile
          </button>

          {/* Feedback */}
          {message && (
            <p
              className={`text-center mt-2 text-sm ${
                message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
