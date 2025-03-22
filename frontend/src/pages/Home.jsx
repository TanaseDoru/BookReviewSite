// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Paginate from '../components/ui/Paginate';
import { fetchBooks } from '../utils/api';

const Home = () => {
  const [pageNumber, setPageNumber] = useState(0);
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  const booksPerPage = 8;
  const pagesVisited = pageNumber * booksPerPage;

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchBooks();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    loadBooks();
  }, []);

  const pageCount = Math.ceil(books.length / booksPerPage);

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayBooks = books
    .slice(pagesVisited, pagesVisited + booksPerPage)
    .map((book) => (
      <div
        key={book._id}
        className="bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300"
        onClick={() => navigate(`/book/${book._id}`)}
      >
        <img
          src={book.coverImage || '/assets/blankProfile.png'}
          alt={book.title}
          className="w-full h-100 object-fill rounded-lg"
        />
      </div>
    ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-3xl font-bold text-white mb-6">Recomandări de cărți</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayBooks}
      </div>
      {books.length > 0 && <Paginate pageCount={pageCount} onPageChange={changePage} />}
    </div>
  );
};

export default Home;