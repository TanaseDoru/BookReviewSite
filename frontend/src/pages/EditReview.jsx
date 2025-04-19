import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchUserReviewForBook, saveReview, fetchBookById } from '../utils/api';
import Button from '../components/shared/Button';

const EditReview = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState({
    rating: '',
    description: '',
    isSpoiler: false,
    startDate: '',
    endDate: '',
  });
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const [ratingError, setRatingError] = useState('');

  const calculateCharCount = (text) => text.length;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const bookData = await fetchBookById(bookId);
        setBook(bookData);

        const existingReview = await fetchUserReviewForBook(bookId, token);
        if (existingReview) {
          const initialDescription = existingReview.description || '';
          setReview({
            rating: existingReview.rating || '',
            description: initialDescription,
            isSpoiler: existingReview.isSpoiler || false,
            startDate: existingReview.startDate
              ? new Date(existingReview.startDate).toISOString().split('T')[0]
              : '',
            endDate: existingReview.endDate
              ? new Date(existingReview.endDate).toISOString().split('T')[0]
              : '',
          });
          setCharCount(calculateCharCount(initialDescription));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Nu s-au putut încărca datele cărții sau recenziei');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookId, navigate]);

  const handleDescriptionChange = (e) => {
    const newText = e.target.value;
    const newCharCount = calculateCharCount(newText);
    if (newCharCount <= 500) {
      setReview({ ...review, description: newText });
      setCharCount(newCharCount);
    }
  };

  const validateInputs = () => {
    if (!review.rating) {
      setRatingError('Rating-ul este obligatoriu');
      return false;
    }
    setRatingError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const reviewData = {
        rating: parseInt(review.rating),
        description: review.description,
        isSpoiler: review.isSpoiler,
        startDate: review.startDate || null,
        endDate: review.endDate || null,
      };
      await saveReview(bookId, reviewData, token);
      navigate('/myBooks');
    } catch (err) {
      setError('Nu s-a putut salva recenzia');
      console.error(err);
      if (err.message.includes('401')) {
        alert('Sesiunea a expirat! Te rugăm să te autentifici din nou.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          className="text-white text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg
            className="animate-spin h-10 w-10 text-blue-400 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p>Se încarcă...</p>
        </motion.div>
      </div>
    );
  }

  // Variante pentru animații
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1, // Animație progresivă pentru copii
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 md:p-8 w-full max-w-md md:max-w-2xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {book && (
            <motion.div className="flex flex-col md:flex-row items-center gap-4 mb-6" variants={itemVariants}>
              <motion.img
                src={book.coverImage || '/assets/blankProfile.png'}
                alt={book.title}
                className="w-20 md:w-32 h-auto object-cover rounded-lg shadow-md border-2 border-gray-700 hover:border-blue-400 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center md:text-left">
                {review.description || review.rating
                  ? `Modifică Recenzia pentru "${book.title}"`
                  : `Scrie o Recenzie pentru "${book.title}"`}
              </h1>
            </motion.div>
          )}
          {error && (
            <motion.p
              className="text-red-500 text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
              <div className="md:col-span-2">
                <label className="block mb-1 text-white font-semibold">Rating (1-5):</label>
                <select
                  value={review.rating}
                  onChange={(e) => {
                    setReview({ ...review, rating: e.target.value });
                    setRatingError('');
                  }}
                  className={`w-full p-3 bg-gray-700 border ${
                    ratingError ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
                >
                  <option value="">Selectează rating</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} ★
                    </option>
                  ))}
                </select>
                {ratingError && (
                  <p className="text-red-500 text-sm mt-1">{ratingError}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-white font-semibold">Recenzie:</label>
                <textarea
                  value={review.description}
                  onChange={handleDescriptionChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white h-40"
                  placeholder="Scrie recenzia ta aici..."
                />
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        charCount >= 400 && charCount < 500
                          ? 'text-yellow-500'
                          : charCount === 500
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {charCount}/500 litere
                    </span>
                  </div>
                  <motion.div
                    className="h-2 bg-gray-600 rounded mt-1"
                    initial={{ width: 0 }}
                    animate={{ width: `${(charCount / 500) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`h-full rounded ${
                        charCount >= 400 && charCount < 500
                          ? 'bg-yellow-500'
                          : charCount === 500
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                    ></div>
                  </motion.div>
                </div>
              </div>
              <div>
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={review.isSpoiler}
                    onChange={(e) => setReview({ ...review, isSpoiler: e.target.checked })}
                    className="mr-2 text-blue-500 focus:ring-blue-500"
                  />
                  Conține spoilere
                </label>
              </div>
              <div>
                <label className="block mb-1 text-white font-semibold">
                  Data Început Citire (opțional):
                </label>
                <input
                  type="date"
                  value={review.startDate}
                  onChange={(e) => setReview({ ...review, startDate: e.target.value })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-white font-semibold">
                  Data Terminat Citire (opțional):
                </label>
                <input
                  type="date"
                  value={review.endDate}
                  onChange={(e) => setReview({ ...review, endDate: e.target.value })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </motion.div>
            <motion.div className="flex gap-4 mt-6" variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold"
                aria-label="Salvează recenzia"
              >
                Salvează
              </Button>
              <Button
                type="button"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg text-lg font-semibold"
                onClick={() => navigate('/myBooks')}
                aria-label="Anulează modificarea"
              >
                Anulează
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditReview;