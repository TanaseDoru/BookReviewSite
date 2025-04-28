import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/shared/Button';
import {
  fetchAuthorById,
  addBook,
  updateBook,
  fetchQuestionsByAuthorId,
  answerQuestion,
  createBookRequest,
  fetchUserNameById,
} from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const AuthorDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Încărcare informații utilizator...
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('addBook');
  const [books, setBooks] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [newBook, setNewBook] = useState({
    title: '',
    genres: '',
    pages: '',
    description: '',
    coverImage: '',
  });
  const [stats, setStats] = useState({ totalBooks: 0, avgRating: 0 });
  const [modifiedBooks, setModifiedBooks] = useState({});
  const [questions, setQuestions] = useState([]);
  const [showAnswerForm, setShowAnswerForm] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Pentru meniu colapsabil pe mobil

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const data = await fetchAuthorById(user.authorId);
        setBooks(data.books || []);
        setStats({
          totalBooks: data.books.length,
          avgRating: data.books.reduce((sum, book) => sum + book.avgRating, 0) / (data.books.length || 1),
        });
        const questionsData = await fetchQuestionsByAuthorId(user.authorId);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Eroare la încărcarea datelor autorului:', error);
      }
    };
    fetchAuthorData();
  }, [user.authorId]);

  useEffect(() => {
    const fetchUserNames = async () => {
      const ids = [...new Set(questions.map((q) => q.userId).filter((q) => !q.answerText).filter(Boolean))];
      const newUsernames = {};
      for (const userIdObj of ids) {
        try {
          const userId = userIdObj._id;
          const data = await fetchUserNameById(userId);
          newUsernames[userId] = data.firstName + ' ' + data.lastName;
        } catch (error) {
          console.error('Eroare la încărcarea numelui utilizatorului pentru userId', userIdObj._id, error);
          newUsernames[userIdObj._id] = 'Utilizator necunoscut';
        }
      }
      setUsernames((prev) => ({ ...prev, ...newUsernames }));
    };
    if (questions.length > 0) {
      fetchUserNames();
    }
  }, [questions]);

  const handleAddBook = async () => {
    const token = localStorage.getItem('token');
    try {
      const bookToAdd = {
        ...newBook,
        authorId: user.authorId,
        genres: newBook.genres.split(',').map((g) => g.trim()),
        pages: parseInt(newBook.pages, 10),
      };
      // trimitem o cerere de creare carte
      await createBookRequest(
        { requestType: 'create', payload: bookToAdd },
        token
      );
      setNewBook({
        title: '',
        genres: '',
        pages: '',
        description: '',
        coverImage: '',
      });
      alert('Cererea de adăugare carte a fost trimisă cu succes!');
    } catch (error) {
      console.error('Eroare la trimiterea cererii de adăugare:', error);
      alert('Eroare la trimiterea cererii de adăugare a cărții.');
    }
  };

  const handleFieldChange = (bookId, field, value) => {
    setModifiedBooks((prev) => ({
      ...prev,
      [bookId]: { ...prev[bookId], [field]: value },
    }));
  };

  const handleEditBookImageUpload = async (bookId, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        handleFieldChange(bookId, 'uploadStatus', 'Se procesează imaginea...');
        const base64 = await optimizeAndConvertToBase64(file, {
          maxWidth: 200,
          maxHeight: 300,
          quality: 0.5,
          maxSizeKB: 50,
        });
        const sizeInKB = Math.round(getBase64Size(base64) / 1024);
        handleFieldChange(bookId, 'uploadStatus', `Imagine procesată: ${sizeInKB} KB`);
        handleFieldChange(bookId, 'coverImage', base64);
        handleFieldChange(bookId, 'editPreviewImage', base64);
      } catch (error) {
        console.error('Eroare la procesarea imaginii:', error);
        handleFieldChange(
          bookId,
          'uploadStatus',
          'Eroare la procesarea imaginii. Încearcă o imagine mai mică sau mai simplă.'
        );
      }
    }
  };

  const handleSubmitBookChanges = async (bookId) => {
    const token = localStorage.getItem('token');
    const updatedData = modifiedBooks[bookId];
    if (!updatedData) {
      return alert('Nu există modificări de trimis');
    }
    try {
      // trimitem o cerere de modificare carte
      await createBookRequest(
        { requestType: 'update', bookId, payload: updatedData },
        token
      );
      setModifiedBooks((prev) => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });
      alert('Cererea de modificare carte a fost trimisă cu succes!');
    } catch (error) {
      console.error('Eroare la trimiterea cererii de modificare:', error);
      alert('Eroare la trimiterea cererii de modificare a cărții.');
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    const token = localStorage.getItem('token');
    if (!answerText.trim()) {
      alert('Răspunsul nu poate fi gol!');
      return;
    }
    try {
      await answerQuestion(questionId, answerText, token);
      const questionsData = await fetchQuestionsByAuthorId(user.authorId);
      setQuestions(questionsData);
      setAnswerText('');
      setShowAnswerForm(null);
      alert('Răspuns trimis cu succes!');
    } catch (error) {
      console.error('Eroare la trimiterea răspunsului:', error);
      alert('Eroare la trimiterea răspunsului.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 z-50 w-64 bg-gray-800 shadow-lg h-full md:static md:w-1/4 md:p-6 p-4 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-xl font-bold">Meniu</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white text-2xl focus:outline-none"
            aria-label="Închide meniul"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col space-y-2">
          {['addBook', 'modifyBook', 'stats', 'notifications'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab === 'addBook' && 'Adăugare carte'}
              {tab === 'modifyBook' && 'Modificare carte'}
              {tab === 'stats' && 'Statistici'}
              {tab === 'notifications' && 'Notificări'}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Overlay pentru fundal pe mobil când sidebar-ul este deschis */}
      {isSidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
      )}

      {/* Buton pentru a deschide meniul pe mobil */}
      <motion.button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-74 left-4 z-[60] p-3 bg-blue-600 rounded-lg text-white text-2xl focus:outline-none shadow-lg"
        aria-label="Deschide meniul"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        ☰
      </motion.button>

      {/* Conținut principal */}
      <motion.div
        className="w-full md:w-3/4 p-6 md:p-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === 'addBook' && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Adăugare carte nouă</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Titlu"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Genuri (separate prin virgulă)"
                value={newBook.genres}
                onChange={(e) => setNewBook({ ...newBook, genres: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Număr pagini"
                value={newBook.pages}
                onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Descriere"
                value={newBook.description}
                onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="5"
              />
              <input
                type="text"
                placeholder="URL imagine copertă"
                value={newBook.coverImage}
                onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleAddBook}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full md:w-auto"
              >
                Adaugă cartea
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'modifyBook' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Modificare carte</h2>
            {books.map((book) => {
              const mod = modifiedBooks[book._id] || {};
              const currentImageType = mod.imageType || book.imageType || 'url';
              const currentCoverImage = mod.coverImage || book.coverImage || '';
              const currentUploadStatus = mod.uploadStatus || '';
              const currentEditPreviewImage = mod.editPreviewImage || '';
              return (
                <motion.div
                  key={book._id}
                  className="bg-gray-800 rounded-xl shadow-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-1">Titlu</label>
                      <input
                        type="text"
                        defaultValue={book.title}
                        onChange={(e) => handleFieldChange(book._id, 'title', e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Genuri (separate prin virgulă)</label>
                      <input
                        type="text"
                        defaultValue={book.genres.join(', ')}
                        onChange={(e) =>
                          handleFieldChange(book._id, 'genres', e.target.value.split(',').map((g) => g.trim()))
                        }
                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Număr pagini</label>
                      <input
                        type="number"
                        defaultValue={book.pages}
                        onChange={(e) => handleFieldChange(book._id, 'pages', parseInt(e.target.value))}
                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-gray-400 mb-1">Descriere</label>
                      <textarea
                        defaultValue={book.description}
                        onChange={(e) => handleFieldChange(book._id, 'description', e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-gray-400 mb-1">Imagine copertă</label>
                      <div className="flex items-center mb-2">
                        <label className="inline-flex items-center mr-4">
                          <input
                            type="radio"
                            value="url"
                            checked={currentImageType === 'url'}
                            onChange={() => handleFieldChange(book._id, 'imageType', 'url')}
                            className="mr-1"
                          />
                          URL
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="upload"
                            checked={currentImageType === 'upload'}
                            onChange={() => handleFieldChange(book._id, 'imageType', 'upload')}
                            className="mr-1"
                          />
                          Încarcă imagine
                        </label>
                      </div>
                      {currentImageType === 'url' ? (
                        <input
                          type="text"
                          value={currentCoverImage}
                          onChange={(e) => handleFieldChange(book._id, 'coverImage', e.target.value)}
                          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Introdu URL-ul imaginii"
                        />
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleEditBookImageUpload(book._id, e)}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white"
                          />
                          {currentUploadStatus && (
                            <p className="mt-2 text-sm text-yellow-400">{currentUploadStatus}</p>
                          )}
                          {currentEditPreviewImage && (
                            <div className="mt-4">
                              <p className="mb-1 text-gray-400">Previzualizare:</p>
                              <img
                                src={currentEditPreviewImage}
                                alt="Previzualizare copertă"
                                className="max-w-full h-48 rounded-lg object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSubmitBookChanges(book._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full md:w-auto mt-4"
                  >
                    Salvează modificările
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            className="bg-gray-800 rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Statistici</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-lg font-semibold">Total cărți</p>
                <p className="text-2xl text-blue-400">{stats.totalBooks}</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-lg font-semibold">Rating mediu</p>
                <p className="text-2xl text-blue-400">{stats.avgRating.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            className="bg-gray-800 rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6">Notificări</h2>
            {questions.filter((q) => !q.answerText).length > 0 ? (
              <div className="space-y-4">
                {questions.filter((q) => !q.answerText).map((question) => (
                  <div key={question._id} className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-gray-300">
                      <strong>Întrebare:</strong> {question.questionText}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Întrebat de: {usernames[question.userId._id] || 'Utilizator necunoscut'}
                    </p>
                    <p className="text-gray-400 mt-2">Fără răspuns încă.</p>
                    <Button
                      onClick={() => setShowAnswerForm(question._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-2"
                    >
                      Răspunde
                    </Button>
                    {showAnswerForm === question._id && (
                      <div className="mt-4">
                        <textarea
                          placeholder="Scrie răspunsul tău aici..."
                          className="w-full p-3 rounded-lg bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                        />
                        <Button
                          onClick={() => handleAnswerQuestion(question._id)}
                          className="bg-green-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-2"
                        >
                          Trimite răspunsul
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Nu există întrebări noi.</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthorDashboard;