import { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchSiteStats,
  addBook,
  addAuthor,
  fetchUsers,
  updateUserRole,
  fetchBookRequests,
  rejectBookRequest,
  fetchAuthorRequests,
  approveAuthorRequest,
  rejectAuthorRequest,
  approveBookRequest,
  fetchAuthorById,
  fetchAuthorByName,
  fetchBooks,
  updateBook,
  fetchBookById,
  updateUserActiveStatus,
} from '../utils/api';
import { optimizeAndConvertToBase64, getBase64Size } from '../utils/imageUtils';
import Button from '../components/shared/Button';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State definitions
  const [stats, setStats] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genres: '',
    pages: '',
    coverImage: '',
    description: '',
    imageType: 'url',
  });
  const [authorForm, setAuthorForm] = useState({
    name: '',
    picture: '',
    born: '',
    isAlive: true,
    died: '',
    genres: '',
    description: '',
    imageType: 'url',
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
    imageType: 'url',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState(null);
  const [authorPreviewImage, setAuthorPreviewImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [authorExists, setAuthorExists] = useState(true);
  const [authorChecked, setAuthorChecked] = useState(false);

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

  const [bookRequests, setBookRequests] = useState([]);
  const [bookAuthorNames, setBookAuthorNames] = useState({});
  useEffect(() => {
    if (activeTab === 'notifications') {
      const token = localStorage.getItem('token');

      fetchBookRequests(token)
        .then(async (data) => {
          data = data.filter((r) => r.status === 'pending');
          setBookRequests(data);

          // Preia numele autorilor
          const ids = [...new Set(data.map((r) => r.payload.authorId).filter(Boolean))];
          console.log('Book ids:', ids);
          const names = {};
          for (const id of ids) {
            try {
              const author = await fetchAuthorById(id, token);
              console.log('Author:', author);
              names[id] = author.author.name;
            } catch {
              names[id] = 'Autor necunoscut';
            }
          }
          setBookAuthorNames(names);
        })
        .catch(console.error);
    }
  }, [activeTab]);
  

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

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !currentStatus; // Inversează starea curentă
      await updateUserActiveStatus(userId, newStatus, token); // Funcție nouă din api.js
      setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: newStatus } : u)));
    } catch (error) {
      console.error('Eroare la actualizarea stării utilizatorului:', error);
      alert('Eroare la actualizarea stării utilizatorului.');
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

  // Verifică existența autorului când se schimbă numele
  useEffect(() => {
    const checkAuthorExists = async () => {
      if (bookForm.author.trim() === '') {
        setAuthorChecked(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const result = await fetchAuthorByName(bookForm.author, token);
        setAuthorExists(result && result.author);
        setAuthorChecked(true);
      } catch (error) {
        console.error('Eroare la verificarea autorului:', error);
        setAuthorExists(false);
        setAuthorChecked(true);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkAuthorExists();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [bookForm.author]);

  // Handler pentru încărcarea imaginii cărții
  const handleBookImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadStatus('Se procesează imaginea...');
        const base64 = await optimizeAndConvertToBase64(file, {
          maxWidth: 200,
          maxHeight: 300,
          quality: 0.5,
          maxSizeKB: 50,
        });
        const sizeInKB = Math.round(getBase64Size(base64) / 1024);
        setUploadStatus(`Imagine procesată: ${sizeInKB} KB`);
        setBookForm({ ...bookForm, coverImage: base64 });
        setPreviewImage(base64);
      } catch (error) {
        console.error('Eroare la procesarea imaginii:', error);
        setUploadStatus('Eroare la procesarea imaginii.');
      }
    }
  };

  // Handler pentru încărcarea imaginii cărții în modul de editare
  const handleEditBookImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadStatus('Se procesează imaginea...');
        const base64 = await optimizeAndConvertToBase64(file, {
          maxWidth: 200,
          maxHeight: 300,
          quality: 0.5,
          maxSizeKB: 50,
        });
        const sizeInKB = Math.round(getBase64Size(base64) / 1024);
        setUploadStatus(`Imagine procesată: ${sizeInKB} KB`);
        setEditBookForm({ ...editBookForm, coverImage: base64 });
        setEditPreviewImage(base64);
      } catch (error) {
        console.error('Eroare la procesarea imaginii:', error);
        setUploadStatus('Eroare la procesarea imaginii.');
      }
    }
  };

  // Handler pentru încărcarea imaginii autorului
  const handleAuthorImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadStatus('Se procesează imaginea...');
        const base64 = await optimizeAndConvertToBase64(file, {
          maxWidth: 200,
          maxHeight: 300,
          quality: 0.5,
          maxSizeKB: 50,
        });
        const sizeInKB = Math.round(getBase64Size(base64) / 1024);
        setUploadStatus(`Imagine procesată: ${sizeInKB} KB`);
        setAuthorForm({ ...authorForm, picture: base64 });
        setAuthorPreviewImage(base64);
      } catch (error) {
        console.error('Eroare la procesarea imaginii:', error);
        setUploadStatus('Eroare la procesarea imaginii.');
      }
    }
  };

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
        if (
          !window.confirm(
            `Autorul "${author}" nu există în baza de date. Doriți să îl adăugați automat ca autor nou?`
          )
        ) {
          setActiveTab('addAuthor');
          setAuthorForm({ ...authorForm, name: author });
          return;
        }
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
      setBookForm({
        title: '',
        author: '',
        genres: '',
        pages: '',
        coverImage: '',
        description: '',
        imageType: 'url',
      });
      setPreviewImage(null);
      setUploadStatus('');
      setAuthorChecked(false);
    } catch (error) {
      console.error('Eroare la adăugarea cărții:', error);
      alert('Eroare la adăugarea cărții.');
    }
  };

  const handleApproveBookRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await approveBookRequest(requestId, token);
      setBookRequests(bookRequests.filter((req) => req._id !== requestId));
    }
    catch (error) {
      console.error('Eroare la aprobarea cererii de carte:', error);
      alert('Eroare la aprobarea cererii de carte.');
    }

  }

  const handleRejectBookRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await rejectBookRequest(requestId, token);
      setBookRequests(bookRequests.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error('Eroare la respingerea cererii de carte:', error);
      alert('Eroare la respingerea cererii de carte.');
    }
  }

  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { title, author, genres, pages, coverImage, description } = editBookForm;

      const existingAuthor = await fetchAuthorByName(author, token);
      let authorId;

      if (!existingAuthor || !existingAuthor.author) {
        if (
          !window.confirm(
            `Autorul "${author}" nu există în baza de date. Doriți să îl adăugați automat ca autor nou?`
          )
        ) {
          setActiveTab('addAuthor');
          setAuthorForm({ ...authorForm, name: author });
          return;
        }
        const newAuthorData = { name: author };
        const newAuthor = await addAuthor(newAuthorData, token);
        authorId = newAuthor._id;
      } else {
        authorId = existingAuthor.author._id;
      }

      const updatedData = {
        title,
        authorId,
        genres: genres.split(',').map((genre) => genre.trim()),
        pages: parseInt(pages),
        coverImage,
        description,
      };

      await updateBook(selectedBook._id, updatedData, token);
      setSelectedBook(null);
      setEditBookForm({
        title: '',
        author: '',
        genres: '',
        pages: '',
        coverImage: '',
        description: '',
        imageType: 'url',
      });
      setEditPreviewImage(null);
      setUploadStatus('');
      loadBooks();
    } catch (error) {
      console.error('Eroare la actualizarea cărții:', error);
      alert('Eroare la actualizarea cărții.');
    }
  };

  const loadBookDetails = async (book) => {
    try {
      const token = localStorage.getItem('token');
      const bookDetails = await fetchBookById(book._id);
      setSelectedBook(bookDetails);

      const imageType = bookDetails.coverImage && bookDetails.coverImage.startsWith('data:') ? 'upload' : 'url';

      setEditBookForm({
        title: bookDetails.title,
        author: bookDetails.authorId.name,
        genres: bookDetails.genres.join(', '),
        pages: bookDetails.pages,
        coverImage: bookDetails.coverImage,
        description: bookDetails.description,
        imageType: imageType,
      });

      setEditPreviewImage(bookDetails.coverImage);
    } catch (error) {
      console.error('Eroare la încărcarea detaliilor cărții:', error);
      alert('Eroare la încărcarea detaliilor cărții.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      try {
        const token = localStorage.getItem('token');
        updateUserActiveStatus(userId, false, token);
        setUsers(users.filter((u) => u._id !== userId));
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
      setAuthorForm({
        name: '',
        picture: '',
        born: '',
        isAlive: true,
        died: '',
        genres: '',
        description: '',
        imageType: 'url',
      });
      setAuthorPreviewImage(null);
      setUploadStatus('');
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
    } catch (error) {
      console.error('Eroare la actualizarea rolului:', error);
      alert('Eroare la actualizarea rolului.');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      // Găsim notificarea pentru a obține datele utilizatorului
      const request = authorRequests.find((req) => req._id === requestId);
      if (!request) {
        throw new Error('Cererea nu a fost găsită.');
      }
  
      // Creăm un cont de autor cu numele utilizatorului
      const authorData = {
        name: `${request.userId.firstName} ${request.userId.lastName}`,
        picture: '', // Imaginea va fi completată ulterior, dacă e nevoie
        isAlive: true,
        genres: [],
        description: '',
      };
      const newAuthor = await addAuthor(authorData, token);
  
      // Actualizăm utilizatorul: setăm rolul 'author' și asociem authorId
      await updateUserRole(request.userId._id, 'author', token);
  
      // Actualizăm starea notificării la 'accepted'
      await approveAuthorRequest(requestId, newAuthor._id, token);
  
      // Eliminăm cererea din listă
      setAuthorRequests(authorRequests.filter((req) => req._id !== requestId));
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
    } catch (error) {
      console.error('Eroare la respingerea cererii:', error);
      alert('Eroare la respingerea cererii.');
    }
  };

  if (!stats) {
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p>Se încarcă...</p>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Panou de Administrare</h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <motion.section
            className="mb-12 bg-gray-800 rounded-xl shadow-lg p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold mb-4">Statistici</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="bg-gray-700 p-4 rounded-lg">
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
              </motion.div>
              <motion.div variants={itemVariants} className="bg-gray-700 p-4 rounded-lg">
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
              </motion.div>
              <motion.div variants={itemVariants} className="bg-gray-700 p-4 rounded-lg">
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
              </motion.div>
              <motion.div variants={itemVariants} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Utilizatori cu cele mai multe review-uri</h3>
                <ul className="mt-2">
                  {stats.usersWithMostReviews.map((user) => (
                    <li key={user._id} className="text-gray-300">
                      {user.firstName} {user.lastName}: {user.reviewCount} review-uri
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Add Book Tab */}
        {activeTab === 'addBook' && (
          <motion.section
            className="mb-12 bg-gray-800 rounded-xl shadow-lg p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold mb-4">Adaugă Carte</h2>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Titlu:</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Autor:</label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => {
                    setBookForm({ ...bookForm, author: e.target.value });
                    setAuthorChecked(false);
                  }}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {authorChecked && !authorExists && bookForm.author.trim() !== '' && (
                  <p className="mt-1 text-yellow-400">
                    Atenție: Autorul "{bookForm.author}" nu există în baza de date.
                    Va fi creat automat sau{' '}
                    <button
                      type="button"
                      className="text-blue-400 underline"
                      onClick={() => {
                        setActiveTab('addAuthor');
                        setAuthorForm({ ...authorForm, name: bookForm.author });
                      }}
                    >
                      adăugați manual
                    </button>
                    .
                  </p>
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Genuri (separate prin virgulă):</label>
                <input
                  type="text"
                  value={bookForm.genres}
                  onChange={(e) => setBookForm({ ...bookForm, genres: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Număr de pagini:</label>
                <input
                  type="number"
                  value={bookForm.pages}
                  onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Imagine copertă:</label>
                <div className="flex items-center mb-2">
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      value="url"
                      checked={bookForm.imageType === 'url'}
                      onChange={() => setBookForm({ ...bookForm, imageType: 'url', coverImage: '' })}
                      className="mr-1"
                    />
                    URL
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="upload"
                      checked={bookForm.imageType === 'upload'}
                      onChange={() => setBookForm({ ...bookForm, imageType: 'upload', coverImage: '' })}
                      className="mr-1"
                    />
                    Încarcă imagine
                  </label>
                </div>
                {bookForm.imageType === 'url' ? (
                  <input
                    type="text"
                    value={bookForm.coverImage}
                    onChange={(e) => setBookForm({ ...bookForm, coverImage: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Introdu URL-ul imaginii"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBookImageUpload}
                      className="w-full p-2 rounded bg-gray-700 text-white"
                      ref={fileInputRef}
                    />
                    {uploadStatus && <p className="mt-1 text-sm text-yellow-400">{uploadStatus}</p>}
                    {previewImage && (
                      <div className="mt-2">
                        <p className="mb-1">Previzualizare:</p>
                        <img src={previewImage} alt="Previzualizare" className="max-w-xs max-h-48 rounded" />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Descriere:</label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Adaugă Carte
                </Button>
              </motion.div>
            </form>
          </motion.section>
        )}

        {/* Edit Book Tab */}
        {activeTab === 'editBook' && (
          <motion.section
            className="mb-12 bg-gray-800 rounded-xl shadow-lg p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold mb-4">Modificare Carte</h2>
            <motion.div variants={itemVariants} className="mb-4">
              <label className="block mb-1">Caută carte după titlu:</label>
              <input
                type="text"
                value={searchBookTitle}
                onChange={(e) => setSearchBookTitle(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introdu titlu..."
              />
            </motion.div>
            {books.length > 0 && (
              <motion.ul className="space-y-2 mb-4" variants={itemVariants}>
                {books.map((book) => (
                  <li key={book._id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                    <span>{book.title}</span>
                    <button
                      onClick={() => loadBookDetails(book)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                    >
                      Editează
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
            {selectedBook && (
              <form onSubmit={handleEditBookSubmit} className="space-y-4 mt-6">
                <h3 className="text-xl font-semibold">Editare: {selectedBook.title}</h3>
                <motion.div variants={itemVariants}>
                  <label className="block mb-1">Titlu:</label>
                  <input
                    type="text"
                    value={editBookForm.title}
                    onChange={(e) => setEditBookForm({ ...editBookForm, title: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block mb-1">Autor:</label>
                  <input
                    type="text"
                    value={editBookForm.author}
                    onChange={(e) => setEditBookForm({ ...editBookForm, author: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block mb-1">Genuri (separate prin virgulă):</label>
                  <input
                    type="text"
                    value={editBookForm.genres}
                    onChange={(e) => setEditBookForm({ ...editBookForm, genres: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block mb-1">Număr de pagini:</label>
                  <input
                    type="number"
                    value={editBookForm.pages}
                    onChange={(e) => setEditBookForm({ ...editBookForm, pages: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block mb-1">Imagine copertă:</label>
                  <div className="flex items-center mb-2">
                    <label className="inline-flex items-center mr-4">
                      <input
                        type="radio"
                        value="url"
                        checked={editBookForm.imageType === 'url'}
                        onChange={() => setEditBookForm({ ...editBookForm, imageType: 'url', coverImage: '' })}
                        className="mr-1"
                      />
                      URL
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="upload"
                        checked={editBookForm.imageType === 'upload'}
                        onChange={() => setEditBookForm({ ...editBookForm, imageType: 'upload', coverImage: '' })}
                        className="mr-1"
                      />
                      Încarcă imagine
                    </label>
                  </div>
                  {editBookForm.imageType === 'url' ? (
                    <input
                      type="text"
                      value={editBookForm.coverImage}
                      onChange={(e) => setEditBookForm({ ...editBookForm, coverImage: e.target.value })}
                      className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Introdu URL-ul imaginii"
                    />
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditBookImageUpload}
                        className="w-full p-2 rounded bg-gray-700 text-white"
                      />
                      {uploadStatus && <p className="mt-1 text-sm text-yellow-400">{uploadStatus}</p>}
                      {editPreviewImage && (
                        <div className="mt-2">
                          <p className="mb-1">Previzualizare:</p>
                          <img src={editPreviewImage} alt="Previzualizare" className="max-w-xs max-h-48 rounded" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block mb-1">Descriere:</label>
                  <textarea
                    value={editBookForm.description}
                    onChange={(e) => setEditBookForm({ ...editBookForm, description: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </motion.div>
                <motion.div className="flex gap-2" variants={itemVariants}>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
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
                        imageType: 'url',
                      });
                      setEditPreviewImage(null);
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Anulează
                  </Button>
                </motion.div>
              </form>
            )}
          </motion.section>
        )}

        {/* Add Author Tab */}
        {activeTab === 'addAuthor' && (
          <motion.section
            className="mb-12 bg-gray-800 rounded-xl shadow-lg p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold mb-4">Adaugă Autor</h2>
            <form onSubmit={handleAuthorSubmit} className="space-y-4">
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Nume:</label>
                <input
                  type="text"
                  value={authorForm.name}
                  onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Imagine autor:</label>
                <div className="flex items-center mb-2">
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      value="url"
                      checked={authorForm.imageType === 'url'}
                      onChange={() => setAuthorForm({ ...authorForm, imageType: 'url', picture: '' })}
                      className="mr-1"
                    />
                    URL
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="upload"
                      checked={authorForm.imageType === 'upload'}
                      onChange={() => setAuthorForm({ ...authorForm, imageType: 'upload', picture: '' })}
                      className="mr-1"
                    />
                    Încarcă imagine
                  </label>
                </div>
                {authorForm.imageType === 'url' ? (
                  <input
                    type="text"
                    value={authorForm.picture}
                    onChange={(e) => setAuthorForm({ ...authorForm, picture: e.target.value })}
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Introdu URL-ul imaginii"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAuthorImageUpload}
                      className="w-full p-2 rounded bg-gray-700 text-white"
                    />
                    {uploadStatus && <p className="mt-1 text-sm text-yellow-400">{uploadStatus}</p>}
                    {authorPreviewImage && (
                      <div className="mt-2">
                        <p className="mb-1">Previzualizare:</p>
                        <img src={authorPreviewImage} alt="Previzualizare" className="max-w-xs max-h-48 rounded" />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Data nașterii:</label>
                <input
                  type="date"
                  value={authorForm.born}
                  onChange={(e) => setAuthorForm({ ...authorForm, born: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">În viață:</label>
                <select
                  value={authorForm.isAlive.toString()}
                  onChange={(e) => setAuthorForm({ ...authorForm, isAlive: e.target.value === 'true' })}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Da</option>
                  <option value="false">Nu</option>
                </select>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Genuri (separate prin virgulă):</label>
                <input
                  type="text"
                  value={authorForm.genres}
                  onChange={(e) => setAuthorForm({ ...authorForm, genres: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-1">Descriere:</label>
                <textarea
                  value={authorForm.description}
                  onChange={(e) => setAuthorForm({ ...authorForm, description: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 text-white h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Adaugă Autor
                </Button>
              </motion.div>
            </form>
          </motion.section>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <motion.section
            className="mb-12 bg-gray-800 rounded-xl shadow-lg p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold mb-4">Atribuire Roluri</h2>
            <motion.div variants={itemVariants} className="mb-4">
              <label className="block mb-1">Caută utilizator după email:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introdu email..."
                />
                <Button
                  onClick={handleSearchUsers}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Caută
                </Button>
              </div>
            </motion.div>
            {users.length > 0 && (
              <motion.div className="overflow-x-auto" variants={itemVariants}>
                <table className="min-w-full bg-gray-700 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Nume</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Rol</th>
                      <th className="px-4 py-2 text-left">Stare</th>
                      <th className="px-4 py-2 text-left">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => (
                      <tr key={u._id} className={index % 2 === 0 ? 'bg-gray-600' : 'bg-gray-700'}>
                        <td className="px-4 py-2">{u.firstName} {u.lastName}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.role}</td>
                        <td className="px-4 py-2">{u.isActive ? 'Activ' : 'Dezactivat'}</td>
                        <td className="px-4 py-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="p-1 rounded bg-gray-800 text-white mr-2"
                          >
                            <option value="user">Utilizator</option>
                            <option value="author">Autor</option>
                            <option value="admin">Admin</option>
                          </select>
                          {u.isActive ? (
                            <button
                              onClick={() => handleToggleActive(u._id, u.isActive)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                            >
                              Dezactivează
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(u._id, u.isActive)}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm"
                            >
                              Activează
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.section
            className="mb-12 bg-gray-800 rounded-xl shadow-lg p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold mb-4">Notificări</h2>
            <div className="space-y-4">
              {(authorRequests.length + bookRequests.length) === 0 ? (
                <p className="text-gray-400">Nu există cereri în așteptare.</p>
              ) : (
                <div className="space-y-4">
                  {/* Cereri de autor */}
                  {authorRequests.map((req) => (
                    <motion.div
                      key={req._id}
                      className="bg-gray-700 p-4 rounded-lg"
                      variants={itemVariants}
                    >
                      <p><strong>Utilizator:</strong> {req.userId.firstName} {req.userId.lastName}</p>
                      <p><strong>Email:</strong> {req.userId.email}</p>
                      <p><strong>Motivație:</strong> {req.details}</p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={() => handleApproveRequest(req._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                          Aprobă
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(req._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                          Respinge
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Cereri de carte */}
                  {bookRequests.map((req) => (
                    <motion.div key={req._id} className="bg-gray-700 p-4 rounded-lg" variants={itemVariants}>
                      <p><strong>Tip cerere:</strong> {req.requestType}</p>
                      <p><strong>Titlu:</strong> {req.payload.title}</p>
                      <p><strong>Autor:</strong> {bookAuthorNames[req.payload.authorId]}</p>
                      <p><strong>Descriere:</strong> {req.payload.description}</p>
                      {req.payload.coverImage && (
                        <div className="mt-2">
                          <p className="text-gray-400 mb-1">Previzualizare copertă:</p>
                          <img
                            src={req.payload.coverImage}
                            alt="Previzualizare copertă"
                            className=" h-auto rounded-lg object-contain max-w-3xs"
                          />
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => handleApproveBookRequest(req._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                          Aprobă
                        </Button>
                        <Button
                          onClick={() => handleRejectBookRequest(req._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                          Respinge
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}



      </div>
    </div>
  );
};

export default AdminPage;