// src/pages/MyBooks.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserBooks, updateUserBook } from '../utils/api';
import Button from '../components/shared/Button';

const MyBooks = () => {
  const [userBooks, setUserBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const books = await fetchUserBooks(token);
        setUserBooks(books);
        setFilteredBooks(books);
      } catch (error) {
        console.error('Error fetching user books:', error);
        if (error.message.includes('401')) {
          alert('Sesiunea a expirat! Te rugăm să te autentifici din nou.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          alert('A apărut o eroare la încărcarea cărților. Verifică conexiunea!');
        }
      }
    };
    fetchBooks();
  }, [navigate]);

  useEffect(() => {
    let booksToFilter = [...userBooks];
    if (activeTab !== 'all') {
      booksToFilter = booksToFilter.filter((book) => book.status === activeTab);
    }
    setFilteredBooks(booksToFilter);
  }, [activeTab, userBooks]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'dateAdded' || sortBy === 'dateRead') {
      valA = new Date(valA);
      valB = new Date(valB);
    } else if (sortBy === 'title' || sortBy === 'author') {
      valA = a.bookId[sortBy]?.toLowerCase() || '';
      valB = b.bookId[sortBy]?.toLowerCase() || '';
    } else if (sortBy === 'avgRating' || sortBy === 'rating') {
      valA = valA || 0;
      valB = valB || 0;
    }

    if (sortOrder === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await updateUserBook(bookId, { status: newStatus }, token);
      setUserBooks(
        userBooks.map((book) =>
          book._id === bookId ? { ...book, status: newStatus } : book
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('A apărut o eroare la actualizarea statusului!');
    }
  };

  const handleRatingChange = async (bookId, newRating) => {
    try {
      const token = localStorage.getItem('token');
      await updateUserBook(bookId, { rating: newRating }, token);
      setUserBooks(
        userBooks.map((book) =>
          book._id === bookId ? { ...book, rating: newRating } : book
        )
      );
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('A apărut o eroare la actualizarea ratingului!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">My Books</h1>

      {/* Bookshelves Tabs */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Bookshelves</h2>
        <div className="flex space-x-4">
          <Button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({userBooks.length})
          </Button>
          <Button
            onClick={() => setActiveTab('Citit')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'Citit' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Read ({userBooks.filter((b) => b.status === 'Citit').length})
          </Button>
          <Button
            onClick={() => setActiveTab('Citesc')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'Citesc' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Currently Reading ({userBooks.filter((b) => b.status === 'Citesc').length})
          </Button>
          <Button
            onClick={() => setActiveTab('Vreau sa citesc')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'Vreau sa citesc' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Want to Read ({userBooks.filter((b) => b.status === 'Vreau sa citesc').length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-gray-800 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="p-4">Cover</th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('title')}>
                Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('author')}>
                Author {sortBy === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('avgRating')}>
                Avg Rating {sortBy === 'avgRating' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-4">Rating</th>
              <th className="p-4">Shelves</th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('dateAdded')}>
                Date Added {sortBy === 'dateAdded' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort('dateRead')}>
                Date Read {sortBy === 'dateRead' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBooks.map((book) => (
              <tr key={book._id} className="border-b border-gray-700 hover:bg-gray-600">
                <td className="p-4">
                  {book.bookId.coverImage ? (
                    <img src={book.bookId.coverImage} alt="cover" className="w-12 h-16 object-cover rounded" />
                  ) : (
                    'No cover'
                  )}
                </td>
                <td className="p-4">{book.bookId.title}</td>
                <td className="p-4">{book.bookId.author}</td>
                <td className="p-4">{book.bookId.avgRating.toFixed(2)}</td>
                <td className="p-4">
                  <select
                    value={book.rating || ''}
                    onChange={(e) => handleRatingChange(book._id, parseInt(e.target.value))}
                    className="p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} ★
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <select
                    value={book.status}
                    onChange={(e) => handleStatusChange(book._id, e.target.value)}
                    className="p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Vreau sa citesc">Vreau sa citesc</option>
                    <option value="Citesc">Citesc</option>
                    <option value="Citit">Citit</option>
                  </select>
                </td>
                <td className="p-4">{new Date(book.dateAdded).toLocaleDateString()}</td>
                <td className="p-4">{book.dateRead ? new Date(book.dateRead).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyBooks;