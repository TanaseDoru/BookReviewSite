import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  fetchSiteStats,
  addBook,
  addAuthor,
  fetchUsers,
  updateUserRole,
  fetchAuthorRequests,
  approveAuthorRequest,
  rejectAuthorRequest,
} from '../utils/api';
import Button from '../components/shared/Button';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
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

  // Verificare acces și încărcare date inițiale
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    console.log('User:', user);

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

  // Gestionare submit formular carte
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const bookData = {
        ...bookForm,
        genres: bookForm.genres.split(',').map((genre) => genre.trim()),
        pages: parseInt(bookForm.pages),
        description: bookForm.description || '',
      };
      await addBook(bookData, token);
      alert('Carte adăugată cu succes!');
      setBookForm({ title: '', author: '', genres: '', pages: '', coverImage: '', description: '' });
    } catch (error) {
      console.error('Eroare la adăugarea cărții:', error);
      alert('Eroare la adăugarea cărții.');
    }
  };

  // Gestionare submit formular autor
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

  // Căutare utilizatori după email
  const handleSearchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await fetchUsers(searchEmail, token);
      setUsers(data);
    } catch (error) {
      console.error('Eroare la căutarea utilizatorilor:', error);
    }
  };

  // Schimbare rol utilizator
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

  // Aprobare cerere autor
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

  // Respingere cerere autor
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

  // Afișare "Loading" dacă statisticile nu sunt încărcate
  if (!stats) return <div className="text-white text-center mt-10">Se încarcă...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      <h1 className="text-4xl font-bold mb-8">Panou de Administrare</h1>

      {/* Secțiunea Statistici */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Statistici</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Cărți cu cele mai multe review-uri</h3>
            <ul className="mt-2">
              {stats.booksWithMostReviews.map((book) => (
                <li key={book._id} className="text-gray-300">
                  {book.title}: {book.reviewCount} review-uri
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Cărți cu cel mai mare rating</h3>
            <ul className="mt-2">
              {stats.booksWithHighestRating.map((book) => (
                <li key={book._id} className="text-gray-300">
                  {book.title}: {book.avgRating.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Comentarii cu cele mai multe like-uri</h3>
            <ul className="mt-2">
              {stats.reviewsWithMostLikes.map((review) => (
                <li key={review._id} className="text-gray-300">
                  {review.userId.firstName} {review.userId.lastName} pe {review.bookId.title}: {review.likes.length} like-uri
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

      {/* Secțiunea Adăugare Carte */}
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

      {/* Secțiunea Adăugare Autor */}
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
              type="text"
              value={authorForm.born}
              onChange={(e) => setAuthorForm({ ...authorForm, born: e.target.value })}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="Ex: 1926-04-28"
            />
          </div>
          <div>
            <label className="block mb-1">Este în viață:</label>
            <select
              value={authorForm.isAlive}
              onChange={(e) => setAuthorForm({ ...authorForm, isAlive: e.target.value })}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="true">Da</option>
              <option value="false">Nu</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Data decesului (dacă nu este în viață):</label>
            <input
              type="text"
              value={authorForm.died}
              onChange={(e) => setAuthorForm({ ...authorForm, died: e.target.value })}
              className="w-full p-2 rounded bg-gray-700 text-white"
              disabled={authorForm.isAlive === 'true'}
              placeholder="Ex: 2016-02-19"
            />
          </div>
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
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Adaugă Autor
          </button>
        </form>
      </section>

      {/* Secțiunea Atribuire Roluri */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Atribuire Roluri</h2>
        <div className="mb-4">
          <label className="block mb-1">Caută utilizator după email:</label>
          <div className="flex gap-2">
            <input
              type="text"
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
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Utilizatori</h3>
          {users.length === 0 ? (
            <p className="text-gray-300">Niciun utilizator găsit.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u._id} className="flex justify-between items-center">
                  <span>
                    {u.firstName} {u.lastName} ({u.email}) - Rol: {u.role}
                  </span>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="bg-gray-700 text-white p-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="author">Author</option>
                  </select>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Secțiunea Notificări */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Notificări (Cereri pentru a deveni autor)</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          {authorRequests.length === 0 ? (
            <p className="text-gray-300">Nicio cerere de autor în așteptare.</p>
          ) : (
            <ul className="space-y-4">
              {authorRequests.map((req) => (
                <li key={req._id} className="flex justify-between items-center">
                  <span>
                    {req.firstName} {req.lastName} ({req.email}) - Propus ca: {req.authorId?.name || 'N/A'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(req._id, req.authorId?._id)}
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
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;