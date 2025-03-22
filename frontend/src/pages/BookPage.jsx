// src/pages/BookPage.jsx
import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchBookById, fetchAuthorByName, addUserBook, fetchUserBooks, updateUserBook } from '../utils/api';
import fullStar from '../assets/fullStar.png';
import emptyStar from '../assets/emptyStar.png';
import Button from '../components/shared/Button';

const BookPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [authorId, setAuthorId] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userBook, setUserBook] = useState(null); // Store the user's book entry
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookAndUserBook = async () => {
      try {
        // Fetch book details
        const bookData = await fetchBookById(bookId);
        setBook(bookData);

        // Fetch author ID if available
        if (bookData.author) {
          const authorData = await fetchAuthorByName(bookData.author);
          if (authorData.length > 0) {
            setAuthorId(authorData[0]._id);
          }
        }

        // Fetch userBooks to check if this book is in the user's list
        if (user) {
          const token = localStorage.getItem('token');
          const userBooks = await fetchUserBooks(token);
          const existingUserBook = userBooks.find((ub) => ub.bookId._id === bookId);
          setUserBook(existingUserBook || null);
        }
      } catch (error) {
        console.error('Error fetching book or user books:', error);
      }
    };
    loadBookAndUserBook();
  }, [bookId, user]);

  const handleAddToList = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await addUserBook(bookId, 'Vreau sa citesc', token);
      // alert('Book added to your list!');
      // Update userBook state to reflect the new addition
      setUserBook({ bookId: { _id: bookId }, status: 'Vreau sa citesc' });
    } catch (error) {
      console.error('Error adding book to list:', error);
      alert('Failed to add book to your list.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      alert('book id:' + bookId);
      await updateUserBook(bookId, { status: newStatus }, token);
      alert('Status updated successfully!');
      // Update the userBook state to reflect the new status
      setUserBook({ ...userBook, status: newStatus });
    } catch (error) {
      console.error('Error updating book status:', error);
      alert('Failed to update book status.');
    }
  };

  if (!book) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white flex gap-10">
      {/* Left Section */}
      <div className="w-80 flex flex-col items-center sticky top-10">
        <img
          src={book.coverImage || '/assets/blankProfile.png'}
          alt={book.title}
          className="w-64 h-96 object-cover rounded-lg shadow-lg"
        />
        <a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer">
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Cumpara
          </Button>
        </a>
        {userBook ? (
          <div className="mt-4">
            <select
              value={userBook.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-40 bg-gray-700 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Vreau sa citesc">Vreau să citesc</option>
              <option value="Citesc">Citesc</option>
              <option value="Citit">Citit</option>
            </select>
          </div>
        ) : (
          <Button
            onClick={handleAddToList}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Vreau să citesc
          </Button>
        )}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Rate this book:</h3>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <img
                key={star}
                src={userRating >= star ? fullStar : emptyStar}
                alt="star"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setUserRating(star)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold">{book.title}</h1>
        <h2 className="text-xl text-gray-400 mt-2">
          {authorId ? (
            <button
              onClick={() => navigate(`/authors/${book.author}`)}
              className="text-blue-400 hover:underline"
            >
              {book.author}
            </button>
          ) : (
            <span>{book.author}</span>
          )}
        </h2>
        <p className="mt-4 text-gray-300">{book.description || 'No description available.'}</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Genres:</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {(book.genres || []).map((genre, index) => (
              <button
                key={index}
                className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                onClick={() => navigate(`/browse?genres=${genre}`)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;