import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/shared/Button';
import { fetchAuthorById, fetchUserProfile } from '../utils/api';
import { addBook } from '../utils/api';

const AuthorDashboard = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('addBook');
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', genres: '', pages: '', description: '', coverImage: '' });
  const [stats, setStats] = useState({ totalBooks: 0, avgRating: 0 });
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: '',
    role: '',
    authorId: '',
  });

  useEffect(() => {
    const fetchAuthorData = async () => {
      const token = localStorage.getItem('token');
      try {
        const _userData = await fetchUserProfile(token);
        
        setUser(_userData);
        const data = await fetchAuthorById(user.authorId);
        setBooks(data.books || []);
        setStats({
          totalBooks: data.books.length,
          avgRating: data.books.reduce((sum, book) => sum + book.avgRating, 0) / (data.books.length || 1),
        });
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };
    fetchAuthorData();
  }, [id]);

  const handleAddBook = async () => {
    const token = localStorage.getItem('token');
    try {
        newBook.author = userData.firstName + ' ' + userData.lastName;
        const response = await addBook(newBook, token);
        const book = await response.json();
        setBooks([...books, book]);
        setNewBook({ title: '', genres: '', pages: '', description: '', coverImage: '' });
        alert('Book added successfully!');
    } catch (error) {
        console.error('Error adding book:', error);
        alert('Failed to add book.');
    }
  };

  const handleModifyBook = async (bookId, updatedData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        const updatedBook = await response.json();
        setBooks(books.map((b) => (b._id === bookId ? updatedBook : b)));
        alert('Book modified successfully!');
      }
    } catch (error) {
      console.error('Error modifying book:', error);
      alert('Failed to modify book.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="w-1/4 p-6 border-r border-gray-700">
        <button
          onClick={() => setActiveTab('addBook')}
          className={`block w-full text-left py-2 ${activeTab === 'addBook' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        >
          Add Book
        </button>
        <button
          onClick={() => setActiveTab('modifyBook')}
          className={`block w-full text-left py-2 ${activeTab === 'modifyBook' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        >
          Modify Book
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`block w-full text-left py-2 ${activeTab === 'stats' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        >
          Stats
        </button>
      </div>

      <div className="w-3/4 p-6">
        {activeTab === 'addBook' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Add New Book</h2>
            <input
              type="text"
              placeholder="Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              placeholder="Genres (comma-separated)"
              value={newBook.genres}
              onChange={(e) => setNewBook({ ...newBook, genres: e.target.value })}
              className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600"
            />
            <input
              type="number"
              placeholder="Pages"
              value={newBook.pages}
              onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
              className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600"
            />
            <textarea
              placeholder="Description"
              value={newBook.description}
              onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
              className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              placeholder="Cover Image URL"
              value={newBook.coverImage}
              onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
              className="w-full p-3 mb-4 rounded-lg bg-gray-700 border border-gray-600"
            />
            <Button onClick={handleAddBook} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Add Book
            </Button>
          </div>
        )}

        {activeTab === 'modifyBook' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Modify Book</h2>
            {books.map((book) => (
              <div key={book._id} className="mb-4 p-4 bg-gray-800 rounded-lg">
                <input
                  type="text"
                  defaultValue={book.title}
                  onBlur={(e) => handleModifyBook(book._id, { ...book, title: e.target.value })}
                  className="w-full p-2 mb-2 rounded-lg bg-gray-700 border border-gray-600"
                />
                <input
                  type="text"
                  defaultValue={book.genres.join(', ')}
                  onBlur={(e) => handleModifyBook(book._id, { ...book, genres: e.target.value.split(', ') })}
                  className="w-full p-2 mb-2 rounded-lg bg-gray-700 border border-gray-600"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Stats</h2>
            <p>Total Books: {stats.totalBooks}</p>
            <p>Average Rating: {stats.avgRating.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;