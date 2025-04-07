import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  fetchSiteStats,
  addBook,
  addAuthor,
  fetchUsers,
  updateUserRole,
  fetchAuthorRequests,
  approveAuthorRequest,
  rejectAuthorRequest,
  fetchAuthorByName,
  fetchBooks,
  updateBook,
  fetchBookById,
} from '../utils/api';
import Button from '../components/shared/Button';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State definitions
  const [stats, setStats] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genres: '',
    pages: '',
    coverImage: '',
    description: '',
  });
  const [authorForm, setAuthorForm] = useState({
    name: '',
    picture: '',
    born: '',
    isAlive: true,
    died: '',
    genres: '',
    description: '',
  });
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [authorRequests, setAuthorRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [searchBookTitle, setSearchBookTitle] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editBookForm, setEditBookForm] = useState({
    title: '',
    author: '',
    genres: '',
    pages: '',
    coverImage: '',
    description: '',
  });

  // Tab definitions
  const tabs = [
    { id: 'stats', label: 'Statistici' },
    { id: 'addBook', label: 'Adaugă Carte' },
    { id: 'editBook', label: 'Modificare Carte' },
    { id: 'addAuthor', label: 'Adaugă Autor' },
    { id: 'roles', label: 'Atribuire Roluri' },
    { id: 'notifications', label: 'Notificări' },
  ];

  // Load initial data
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchSiteStats(token);
        setStats(data);
      } catch (error) {
        console.error('Eroare la încărcarea statisticilor:', error);
      }
    };

    const loadUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchUsers('', token);
        setUsers(data);
      } catch (error) {
        console.error('Eroare la încărcarea utilizatorilor:', error);
      }
    };

    const loadAuthorRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchAuthorRequests(token);
        setAuthorRequests(data);
      } catch (error) {
        console.error('Eroare la încărcarea cererilor de autor:', error);
      }
    };

    loadStats();
    loadUsers();
    loadAuthorRequests();
  }, [user, navigate]);

  // Load books when edit tab is opened
  useEffect(() => {
    if (activeTab === 'editBook') {
      loadBooks();
    }
  }, [activeTab]);

  // Load books function
  const loadBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await fetchBooks({ title: searchBookTitle }, token);
      setBooks(data);
    } catch (error) {
      console.error('Eroare la încărcarea cărților:', error);
    }
  };

  // Real-time filtering for books
  useEffect(() => {
    if (activeTab === 'editBook') {
      const delayDebounceFn = setTimeout(() => {
        loadBooks();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchBookTitle]);

  // Handlers
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { title, author, genres, pages, coverImage, description } = bookForm;

      const existingAuthor = await fetchAuthorByName(author, token);
      let authorId;

      if (existingAuthor && existingAuthor.author) {
        authorId = existingAuthor.author._id;
      } else {
        const newAuthorData = { name: author };
        const newAuthor = await addAuthor(newAuthorData, token);
        authorId = newAuthor._id;
      }

      const bookData = {
        title,
        authorId,
        genres: genres.split(',').map((genre) => genre.trim()),
        pages: parseInt(pages),
        coverImage,
        description: description || '',
      };

      await addBook(bookData, token);
      alert('Carte adăugată cu succes!');
      setBookForm({ title: '', author: '', genres: '', pages: '', coverImage: '', description: '' });
    } catch (error) {
      console.error('Eroare la adăugarea cărții:', error);
      alert('Eroare la adăugarea cărții.');
    }
  };

  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { title, author, genres, pages, coverImage, description } = editBookForm;

      const existingAuthor = await fetchAuthorByName(author, token);
      if (!existingAuthor || !existingAuthor.author) {
        alert('Autorul nu există. Te rugăm să adaugi autorul mai întâi.');
        return;
      }
      const authorId = existingAuthor.author._id;

      const updatedData = {
        title,
        authorId,
        genres: genres.split(',').map((genre) => genre.trim()),
        pages: parseInt(pages),
        coverImage,
        description,
      };

      await updateBook(selectedBook._id, updatedData, token);
      alert('Carte actualizată cu succes!');
      setSelectedBook(null);
      setEditBookForm({ title: '', author: '', genres: '', pages: '', coverImage: '', description: '' });
      loadBooks(); // Reîncarcă lista de cărți după actualizare
    } catch (error) {
      console.error('Eroare la actualizarea cărții:', error);
      alert('Eroare la actualizarea cărții.');
    }
  };

  // Funcție pentru a încărca detaliile cărții selectate
  const loadBookDetails = async (book) => {
    try {
      const token = localStorage.getItem('token');
      const bookDetails = await fetchBookById(book._id);
      setSelectedBook(bookDetails);
      setEditBookForm({
        title: bookDetails.title,
        author: bookDetails.authorId.name,
        genres: bookDetails.genres.join(', '),
        pages: bookDetails.pages,
        coverImage: bookDetails.coverImage,
        description: bookDetails.description,
      });
    } catch (error) {
      console.error('Eroare la încărcarea detaliilor cărții:', error);
      alert('Eroare la încărcarea detaliilor cărții.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      try {
        const token = localStorage.getItem('token');
        await apiRequest(`/admin/users/${userId}`, 'DELETE', null, token);
        setUsers(users.filter((u) => u._id !== userId));
        alert('Utilizator șters cu succes!');
      } catch (error) {
        console.error('Eroare la ștergerea utilizatorului:', error);
        alert('Eroare la ștergerea utilizatorului.');
      }
    }
  };

  const handleAuthorSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const authorData = {
        ...authorForm,
        genres: authorForm.genres.split(',').map((genre) => genre.trim()),
        isAlive: authorForm.isAlive === 'true',
      };
      await addAuthor(authorData, token);
      alert('Autor adăugat cu succes!');
      setAuthorForm({ name: '', picture: '', born: '', isAlive: true, died: '', genres: '', description: '' });
    } catch (error) {
      console.error('Eroare la adăugarea autorului:', error);
      alert('Eroare la adăugarea autorului.');
    }
  };

  const handleSearchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await fetchUsers(searchEmail, token);
      setUsers(data);
    } catch (error) {
      console.error('Eroare la căutarea utilizatorilor:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await updateUserRole(userId, newRole, token);
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      alert('Rol actualizat cu succes!');
    } catch (error) {
      console.error('Eroare la actualizarea rolului:', error);
      alert('Eroare la actualizarea rolului.');
    }
  };

  const handleApproveRequest = async (requestId, authorId) => {
    try {
      const token = localStorage.getItem('token');
      await approveAuthorRequest(requestId, authorId, token);
      setAuthorRequests(authorRequests.filter((req) => req._id !== requestId));
      alert('Cerere de autor aprobată!');
    } catch (error) {
      console.error('Eroare la aprobarea cererii:', error);
      alert('Eroare la aprobarea cererii.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await rejectAuthorRequest(requestId, token);
      setAuthorRequests(authorRequests.filter((req) => req._id !== requestId));
      alert('Cerere de autor respinsă!');
    } catch (error) {
      console.error('Eroare la respingerea cererii:', error);
      alert('Eroare la respingerea cererii.');
    }
  };

  if (!stats) return <div className="text-white text-center mt-10">Se încarcă...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      <h1 className="text-4xl font-bold mb-8">Panou de Administrare</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Statistici</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Cărți cu cele mai multe review-uri</h3>
              <ul className="mt-2">
                {stats.booksWithMostReviews.map((book) => (
                  <li key={book._id} className="text-gray-300">
                    <NavLink to={`/book/${book._id}`} className="text-blue-400 hover:underline">
                      {book.title}
                    </NavLink>
                    : {book.reviewCount} review-uri
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Cărți cu cel mai mare rating</h3>
              <ul className="mt-2">
                {stats.booksWithHighestRating.map((book) => (
                  <li key={book._id} className="text-gray-300">
                    <NavLink to={`/book/${book._id}`} className="text-blue-400 hover:underline">
                      {book.title}
                    </NavLink>
                    : {book.avgRating.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Comentarii cu cele mai multe like-uri</h3>
              <ul className="mt-2">
                {stats.reviewsWithMostLikes.map((review) => (
                  <li key={review._id} className="text-gray-300">
                    {review.userId.firstName} {review.userId.lastName} pe{' '}
                    <NavLink to={`/book/${review.bookId._id}`} className="text-blue-400 hover:underline">
                      {review.bookId.title}
                    </NavLink>
                    : {review.likes.length} like-uri
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Utilizatori cu cele mai multe review-uri</h3>
              <ul className="mt-2">
                {stats.usersWithMostReviews.map((user) => (
                  <li key={user._id} className="text-gray-300">
                    {user.firstName} {user.lastName}: {user.reviewCount} review-uri
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Add Book Tab */}
      {activeTab === 'addBook' && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Adaugă Carte</h2>
          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Titlu:</label>
              <input
                type="text"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Autor:</label>
              <input
                type="text"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Genuri (separate prin virgulă):</label>
              <input
                type="text"
                value={bookForm.genres}
                onChange={(e) => setBookForm({ ...bookForm, genres: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Număr de pagini:</label>
              <input
                type="number"
                value={bookForm.pages}
                onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Imagine copertă (URL):</label>
              <input
                type="text"
                value={bookForm.coverImage}
                onChange={(e) => setBookForm({ ...bookForm, coverImage: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Descriere:</label>
              <textarea
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white h-32"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Adaugă Carte
            </Button>
          </form>
        </section>
      )}

      {/* Edit Book Tab */}
      {activeTab === 'editBook' && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Modificare Carte</h2>
          <div className="mb-4">
            <label className="block mb-1">Caută carte după titlu:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchBookTitle}
                onChange={(e) => setSearchBookTitle(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Introdu titlu..."
              />
            </div>
          </div>
          {books.length > 0 && (
            <ul className="space-y-2 mb-4">
              {books.map((book) => (
                <li key={book._id} className="flex justify-between items-center">
                  <span>{book.title}</span>
                  <button
                    onClick={() => loadBookDetails(book)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                  >
                    Editează
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedBook && (
            <form onSubmit={handleEditBookSubmit} className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold">Editare: {selectedBook.title}</h3>
              <div>
                <label className="block mb-1">Titlu:</label>
                <input
                  type="text"
                  value={editBookForm.title}
                  onChange={(e) => setEditBookForm({ ...editBookForm, title: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Autor:</label>
                <input
                  type="text"
                  value={editBookForm.author}
                  onChange={(e) => setEditBookForm({ ...editBookForm, author: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Genuri (separate prin virgulă):</label>
                <input
                  type="text"
                  value={editBookForm.genres}
                  onChange={(e) => setEditBookForm({ ...editBookForm, genres: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Număr de pagini:</label>
                <input
                  type="number"
                  value={editBookForm.pages}
                  onChange={(e) => setEditBookForm({ ...editBookForm, pages: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Imagine copertă (URL):</label>
                <input
                  type="text"
                  value={editBookForm.coverImage}
                  onChange={(e) => setEditBookForm({ ...editBookForm, coverImage: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block mb-1">Descriere:</label>
                <textarea
                  value={editBookForm.description}
                  onChange={(e) => setEditBookForm({ ...editBookForm, description: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white h-32"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Salvează Modificările
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedBook(null);
                    setEditBookForm({
                      title: '',
                      author: '',
                      genres: '',
                      pages: '',
                      coverImage: '',
                      description: '',
                    });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Anulează
                </Button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* Add Author Tab */}
      {activeTab === 'addAuthor' && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Adaugă Autor</h2>
          <form onSubmit={handleAuthorSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Nume:</label>
              <input
                type="text"
                value={authorForm.name}
                onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Imagine (URL):</label>
              <input
                type="text"
                value={authorForm.picture}
                onChange={(e) => setAuthorForm({ ...authorForm, picture: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Data nașterii:</label>
              <input
                type="date"
                value={authorForm.born}
                onChange={(e) => setAuthorForm({ ...authorForm, born: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block mb-1">În viață:</label>
              <select
                value={authorForm.isAlive.toString()}
                onChange={(e) => setAuthorForm({ ...authorForm, isAlive: e.target.value === 'true' })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="true">Da</option>
                <option value="false">Nu</option>
              </select>
            </div>
            {!authorForm.isAlive && (
              <div>
                <label className="block mb-1">Data decesului:</label>
                <input
                  type="date"
                  value={authorForm.died}
                  onChange={(e) => setAuthorForm({ ...authorForm, died: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
              </div>
            )}
            <div>
              <label className="block mb-1">Genuri (separate prin virgulă):</label>
              <input
                type="text"
                value={authorForm.genres}
                onChange={(e) => setAuthorForm({ ...authorForm, genres: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block mb-1">Descriere:</label>
              <textarea
                value={authorForm.description}
                onChange={(e) => setAuthorForm({ ...authorForm, description: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white h-32"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Adaugă Autor
            </Button>
          </form>
        </section>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Atribuire Roluri</h2>
          <div className="mb-4">
            <label className="block mb-1">Caută utilizator după email:</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Introdu email..."
              />
              <button
                onClick={handleSearchUsers}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Caută
              </button>
            </div>
          </div>
          {users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Nume</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Rol</th>
                    <th className="px-4 py-2 text-left">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t border-gray-700">
                      <td className="px-4 py-2">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">{u.role}</td>
                      <td className="px-4 py-2">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="p-1 rounded bg-gray-700 text-white mr-2"
                        >
                          <option value="user">Utilizator</option>
                          <option value="author">Autor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Notificări</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Cereri de autor</h3>
            {authorRequests.length === 0 ? (
              <p className="text-gray-400">Nu există cereri de autor în așteptare.</p>
            ) : (
              <div className="space-y-4">
                {authorRequests.map((req) => (
                  <div key={req._id} className="bg-gray-800 p-4 rounded-lg">
                    <p>
                      <span className="font-semibold">Utilizator:</span> {req.userId.firstName} {req.userId.lastName}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {req.userId.email}
                    </p>
                    <p>
                      <span className="font-semibold">Autor solicitat:</span> {req.authorName}
                    </p>
                    <p>
                      <span className="font-semibold">Motivație:</span> {req.reason}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(req._id, req.authorId)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Aprobă
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Respinge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminPage;
