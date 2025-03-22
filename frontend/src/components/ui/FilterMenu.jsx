// src/components/ui/FilterMenu.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';

const FilterMenu = ({ filters, setFilters, applyFilters }) => {
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();

  // Fetch genres from the backend using the API utility
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/books/genres');
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (filters.type === 'title' && filters.value) {
      params.set('title', filters.value);
    } else if (filters.type === 'author' && filters.value) {
      params.set('author', filters.value);
    } else if (filters.type === 'genre' && filters.value) {
      params.set('genres', filters.value);
    } else if (filters.type === 'pages') {
      if (filters.minPages) params.set('minPages', filters.minPages);
      if (filters.maxPages) params.set('maxPages', filters.maxPages);
    }

    console.log('Applying filters:', {
      type: filters.type,
      value: filters.value,
      minPages: filters.minPages,
      maxPages: filters.maxPages,
    });
    console.log('URL Parameters:', params.toString());

    // Update the URL and trigger the filter application
    navigate(`?${params.toString()}`);
    applyFilters(params);
    setFilters({ ...filters, showMenu: false }); // Close the menu after applying filters
  };

  const handleResetFilters = () => {
    setFilters({
      showMenu: false,
      type: '',
      value: '',
      minPages: '',
      maxPages: '',
    });
    navigate(''); // Clear URL parameters
    applyFilters(new URLSearchParams()); // Reset filters
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <Button
        onClick={() => setFilters({ ...filters, showMenu: !filters.showMenu })}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
      >
        Filtre
      </Button>

      {/* Filter Menu Dropdown */}
      {filters.showMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 text-white shadow-lg rounded-lg p-6 z-10">
          {/* Filter Type Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Filtrează după:</label>
            <select
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value, value: '' });
                console.log('Selected filter type:', e.target.value);
              }}
              aria-label="Select filter type"
            >
              <option value="">Alege...</option>
              <option value="title">Titlu</option>
              <option value="author">Autor</option>
              <option value="genre">Gen</option>
              <option value="pages">Număr Pagini</option>
            </select>
          </div>

          {/* Title or Author Input */}
          {(filters.type === 'title' || filters.type === 'author') && (
            <div className="mt-4">
              <input
                type="text"
                placeholder={`Caută după ${filters.type}...`}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.value}
                onChange={(e) => setFilters({ ...filters, value: e.target.value })}
                aria-label={`Search by ${filters.type}`}
              />
            </div>
          )}

          {/* Genre Selection */}
          {filters.type === 'genre' && (
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-300">Gen:</label>
              <select
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.value}
                onChange={(e) => {
                  setFilters({ ...filters, value: e.target.value });
                  console.log('Selected genre:', e.target.value);
                }}
                aria-label="Select genre"
              >
                <option value="">Toate</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pages Range */}
          {filters.type === 'pages' && (
            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Minim"
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.minPages}
                  onChange={(e) => setFilters({ ...filters, minPages: e.target.value })}
                  aria-label="Minimum pages"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Maxim"
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.maxPages}
                  onChange={(e) => setFilters({ ...filters, maxPages: e.target.value })}
                  aria-label="Maximum pages"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleApplyFilters}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Aplică Filtre
            </Button>
            <Button
              onClick={handleResetFilters}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Resetează
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterMenu;