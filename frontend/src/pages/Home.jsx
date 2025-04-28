import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Paginate from '../components/ui/Paginate';
import { AuthContext } from '../context/AuthContext';
import { fetchBooks, fetchUserBooks } from '../utils/api';
import { getImageSource } from '../utils/imageUtils';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [pageNumber, setPageNumber] = useState(0);
  const [books, setBooks] = useState([]);
  const [likedGenres, setLikedGenres] = useState([]);
  const navigate = useNavigate();

  const booksPerPage = 8;
  const pagesVisited = pageNumber * booksPerPage;
  const pageCount = Math.ceil(books.length / booksPerPage);

  // Shuffle helper
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setPageNumber(0);

    const loadRandom = async () => {
      try {
        const all = await fetchBooks();
        const picked = shuffle(all).slice(0, booksPerPage);
        setBooks(picked);
        setLikedGenres([]);  // clear any genres
      } catch (err) {
        console.error('Error fetching random books:', err);
      }
    };

    const loadByPreference = async () => {
      try {
        const userBooks = await fetchUserBooks(token);
        const genres = Array.from(new Set(
          userBooks.flatMap((b) => b.bookId.genres || [])
        ));
        setLikedGenres(genres);
        if (genres.length === 0) {
          // no liked genres: fallback to random
          return loadRandom();
        }
        const results = await Promise.all(
          genres.map((g) => fetchBooks({ genre: g, limit: 3 }))
        );
        const merged = results.flat();
        const unique = merged.filter(
          (b, idx, self) => self.findIndex((x) => x._id === b._id) === idx
        );
        setBooks(unique);
      } catch (err) {
        console.error('Error fetching personalized books:', err);
      }
    };

    if (user) {
      loadByPreference();
    } else {
      loadRandom();
    }
  }, [user]);

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayBooks = books
    .slice(pagesVisited, pagesVisited + booksPerPage)
    .map((book, idx) => (
      <motion.div
        key={book._id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
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
          <p className="text-gray-400">{book.authorId?.name ?? 'Unknown Author'}</p>
        </div>
      </motion.div>
    ));

  const heading = (!user || likedGenres.length === 0)
    ? 'Începe citirea'
    : 'Recomandări de cărți';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-white mb-2"
      >
        {heading}
      </motion.h2>

      {user && likedGenres.length > 0 && (
        <p className="text-gray-300 mb-6">
          <strong>Genuri apreciate:</strong> {likedGenres.join(', ')}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayBooks}
      </div>

      {books.length > booksPerPage && (
        <Paginate pageCount={pageCount} onPageChange={changePage} />
      )}
    </div>
  );
};

export default Home;
