import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Search, MapPin, Clock, Star, Filter, X } from 'lucide-react';

const SearchPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const availabilityOptions = [
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'evenings', label: 'Evenings' },
    { value: 'mornings', label: 'Mornings' },
    { value: 'afternoons', label: 'Afternoons' },
    { value: 'flexible', label: 'Flexible' }
  ];

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 2) {
        try {
          const response = await axios.get(`/api/users/suggestions/skills?query=${searchTerm}`);
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('skill', searchTerm);
      if (location) params.append('location', location);
      if (availability) params.append('availability', availability);

      const response = await axios.get(`/api/users/search?${params.toString()}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setAvailability('');
    setUsers([]);
  };

  const hasFilters = searchTerm || location || availability;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Skills</h1>
        <p className="text-gray-600 mb-6">
          Search for people who can teach you the skills you want to learn, or find someone to swap skills with.
        </p>

        {/* Search Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Skill Search */}
            <div className="relative">
              <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-2">
                Skill to Learn
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="skill"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g., JavaScript, Cooking, Guitar"
                />
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Filter */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Any availability</option>
                  {availabilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </button>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </button>
              )}
            </div>

            {users.length > 0 && (
              <p className="text-sm text-gray-500">
                Found {users.length} user{users.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {users.length > 0 && (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {user.profilePhotoURL ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={user.profilePhotoURL}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xl font-medium text-primary-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link
                          to={`/user/${user.id}`}
                          className="hover:text-primary-600"
                        >
                          {user.name}
                        </Link>
                      </h3>
                      {user.location && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {user.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {user.rating.toFixed(1)} ({user.totalRatings})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-3">
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Skills Offered:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.skillsOffered.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skillsOffered.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{user.skillsOffered.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Skills Wanted:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.skillsWanted.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skillsWanted.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{user.skillsWanted.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  {user.availability && user.availability.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-900">Availability:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.availability.map((avail, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {avail}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {user.bio && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <Link
                    to={`/user/${user._id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && searchTerm && users.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or browse for different skills.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Initial State */}
      {!searchTerm && users.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
          <p className="text-gray-500">
            Enter a skill you want to learn to find people who can teach you.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 