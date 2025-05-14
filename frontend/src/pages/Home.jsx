import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { fetchBooks, fetchUserBooks } from '../utils/api';
import { getImageSource } from '../utils/imageUtils';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [likedGenres, setLikedGenres] = useState([]);
  const navigate = useNavigate();
  const booksPerPage = 8;

  // Shuffle helper function
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

    const loadRandom = async (excludeIds = []) => {
      try {
        const allBooks = await fetchBooks();
        const filteredBooks = allBooks.filter(b => !excludeIds.includes(b._id));
        const shuffled = shuffle(filteredBooks);
        const picked = shuffled.slice(0, booksPerPage);
        setBooks(picked);
        setLikedGenres([]);
      } catch (err) {
        console.error('Error fetching random books:', err);
      }
    };

    const loadByPreference = async () => {
      try {
        const allBooks = await fetchBooks();
        const userBooks = await fetchUserBooks(token);
        const userBookIds = userBooks.map(ub => ub.bookId._id);
        const genres = Array.from(new Set(userBooks.flatMap(ub => ub.bookId.genres || [])));
        setLikedGenres(genres);

        if (genres.length === 0) {
          await loadRandom(userBookIds);
          return;
        }

        const preferredBooks = allBooks.filter(b =>
          !userBookIds.includes(b._id) &&
          b.genres?.some(g => genres.includes(g))
        );

        let displayBooks = preferredBooks.slice(0, booksPerPage);

        if (displayBooks.length < booksPerPage) {
          const remaining = booksPerPage - displayBooks.length;
          const randomBooks = shuffle(allBooks.filter(b =>
            !userBookIds.includes(b._id) &&
            !displayBooks.some(db => db._id === b._id)
          )).slice(0, remaining);
          displayBooks = [...displayBooks, ...randomBooks];
        }

        setBooks(displayBooks);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-white mb-2"
      >
        {(!user || likedGenres.length === 0) ? 'Începe citirea' : 'Recomandări de cărți'}
      </motion.h2>

      {user && likedGenres.length > 0 && (
        <p className="text-gray-300 mb-6">
          <strong>Genuri apreciate:</strong> {likedGenres.join(', ')}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book, idx) => (
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
        ))}
      </div>
    </div>
  );
};

export default Home;