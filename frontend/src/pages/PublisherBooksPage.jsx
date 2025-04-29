import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Paginate from '../components/ui/Paginate';
import { getImageSource } from '../utils/imageUtils';
import { fetchBooksByPublisher, fetchPublisherById } from '../utils/api';

const PublisherBooksPage = () => {
  const { publisherId } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [publisher, setPublisher] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const booksPerPage = 8;

  const fetchPublisherDetails = async () => {
    try {
      const data = await fetchPublisherById(publisherId);
      setPublisher(data);
    } catch (error) {
      console.error(error);
      setPublisher(null);
    }
  };
  
  const fetchPublisherBooks = async () => {
    try {
      const data = await fetchBooksByPublisher(publisherId);
      setBooks(data);
    } catch (error) {
      console.error(error);
      setBooks([]);
    }
  };

  useEffect(() => {
    fetchPublisherBooks();
    fetchPublisherDetails();
  }, [publisherId]);

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
          <p className="text-gray-400">{book.authorId ? book.authorId.name : 'Unknown Author'}</p>
          {book.edituraId && (
            <p className="text-gray-400">Editura: {book.edituraId.name}</p>
          )}
        </div>
      </motion.div>
    ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-white mb-4"
      >
        Cărți de la {publisher ? publisher.name : 'Editură'}
      </motion.h2>
      {publisher && (
        <div className="mb-6 text-gray-400">
          <p className="mb-1">An înființare: {publisher.foundedYear}</p>
          {publisher.description && (
            <p>Descriere: {publisher.description}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.length > 0 ? displayBooks : <p className="text-gray-400">Nu s-au găsit cărți.</p>}
      </div>
      {books.length > 0 && <Paginate pageCount={pageCount} onPageChange={changePage} />}
    </div>
  );
};

export default PublisherBooksPage;
