// src/pages/Browse.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Paginate from '../components/ui/Paginate';
import FilterMenu from '../components/ui/FilterMenu';
import { fetchBooks } from '../utils/api';
import { getImageSource } from '../utils/imageUtils';

const Browse = () => {
  const [filters, setFilters] = useState({
    showMenu: false,
    type: '',
    value: '',
    minPages: '',
    maxPages: '',
  });
  const [pageNumber, setPageNumber] = useState(0);
  const [books, setBooks] = useState([]);
  const booksPerPage = 8;
  const navigate = useNavigate();
  const location = useLocation();

  const fetchBooksWithFilters = async (params) => {
    try {
      const data = await fetchBooks(params);
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParams = {};
    if (params.get('title')) filterParams.title = params.get('title');
    if (params.get('author')) filterParams.author = params.get('author');
    if (params.get('genres')) filterParams.genres = params.get('genres');
    if (params.get('minPages')) filterParams.minPages = params.get('minPages');
    if (params.get('maxPages')) filterParams.maxPages = params.get('maxPages');
    fetchBooksWithFilters(filterParams);
  }, [location.search]);

  const pagesVisited = pageNumber * booksPerPage;
  const pageCount = Math.ceil(books.length / booksPerPage);
  const changePage = ({ selected }) => setPageNumber(selected);

  const displayBooks = books
    .slice(pagesVisited, pagesVisited + booksPerPage)
    .map((book, index) => (
      <motion.div
        key={book._id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-gray-800 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        onClick={() => navigate(`/book/${book._id}`)}
      >
        <img
          src={getImageSource(book.coverImage, '/assets/blankProfile.png')}
          alt={book.title}
          className="w-full h-100 object-fill rounded-t-xl"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/blankProfile.png';
          }}
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white truncate">{book.title}</h3>
          <p className="text-gray-400">{book.authorId ? book.authorId.name : "Unknown Author"}</p>
        </div>
      </motion.div>
    ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-white mb-6"
      >
        Caută cărți
      </motion.h2>
      <div className="flex justify-end mb-6">
        <FilterMenu
          filters={filters}
          setFilters={setFilters}
          applyFilters={(params) => fetchBooksWithFilters(params)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.length > 0 ? displayBooks : <p className="text-gray-400">No books found.</p>}
      </div>
      {books.length > 0 && <Paginate pageCount={pageCount} onPageChange={changePage} />}
    </div>
  );
};

export default Browse;