import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/shared/Button';
import {
  fetchAuthorById,
  addBook,
  updateBook,
  fetchQuestionsByAuthorId,
  answerQuestion,
  fetchUserNameById
} from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const AuthorDashboard = () => {
  const { user } = useContext(AuthContext); // Contextul pentru utilizator

  // Dacă user nu este încă definit, afișăm un mesaj de loading
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-white">Incarcare informatii utilizator...</div>;
  }

  const [activeTab, setActiveTab] = useState('addBook');
  const [books, setBooks] = useState([]);
  const [usernames, setUsernames] = useState({}); 
  const [newBook, setNewBook] = useState({
    title: '',
    genres: '',
    pages: '',
    description: '',
    coverImage: ''
  });
  const [stats, setStats] = useState({ totalBooks: 0, avgRating: 0 });
  const [modifiedBooks, setModifiedBooks] = useState({});
  const [questions, setQuestions] = useState([]);
  
  // Stări pentru formularul de răspuns în notificări:
  const [showAnswerForm, setShowAnswerForm] = useState(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const data = await fetchAuthorById(user.authorId);
        setBooks(data.books || []);
        setStats({
          totalBooks: data.books.length,
          avgRating:
            data.books.reduce((sum, book) => sum + book.avgRating, 0) /
            (data.books.length || 1)
        });
        const questionsData = await fetchQuestionsByAuthorId(user.authorId);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };
    fetchAuthorData();
  }, [user.authorId]);

  useEffect(() => {
      const fetchUserNames = async () => {
        // Extragem o listă de userId-uri unice din întrebări
        const ids = [...new Set(questions.map(q => q.userId).filter(q => !q.answerText).filter(Boolean))];
        const newUsernames = {};
        console.log('ids length:' + ids.length);
        for (const userIdObj of ids) {
          try {
            const userId = userIdObj._id;
            const data = await fetchUserNameById(userId);
            newUsernames[userId] = data.firstName + ' ' + data.lastName;
          } catch (error) {
            console.error('Error fetching username for userId', userIdObj._id, error);
            newUsernames[userIdObj._id] = 'Utilizator necunoscut';
          }
        }
        setUsernames(prev => ({ ...prev, ...newUsernames }));
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
        genres: newBook.genres.split(',').map((genre) => genre.trim()),
        pages: parseInt(newBook.pages)
      };
      const response = await addBook(bookToAdd, token);
      setBooks([...books, response]);
      setNewBook({
        title: '',
        genres: '',
        pages: '',
        description: '',
        coverImage: ''
      });
      alert('Book added successfully!');
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book.');
    }
  };

  // Actualizează starea modificărilor pentru fiecare carte
  const handleFieldChange = (bookId, field, value) => {
    setModifiedBooks((prev) => ({
      ...prev,
      [bookId]: { ...prev[bookId], [field]: value }
    }));
  };

  // Funcția pentru upload imagine
  const handleEditBookImageUpload = async (bookId, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        handleFieldChange(bookId, 'uploadStatus', 'Se procesează imaginea...');
        // Funcțiile optimizeAndConvertToBase64 și getBase64Size trebuie să fie definite în proiect
        const base64 = await optimizeAndConvertToBase64(file, {
          maxWidth: 200,
          maxHeight: 300,
          quality: 0.5,
          maxSizeKB: 50
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
    try {
      const updatedData = modifiedBooks[bookId];
      if (!updatedData) {
        alert('No changes to submit');
        return;
      }
      const updatedBook = await updateBook(bookId, updatedData, token);
      setBooks(books.map((b) => (b._id === bookId ? updatedBook : b)));
      setModifiedBooks((prev) => {
        const newModified = { ...prev };
        delete newModified[bookId];
        return newModified;
      });
      alert('Book modified successfully!');
    } catch (error) {
      console.error('Error modifying book:', error);
      alert('Failed to modify book.');
    }
  };

  const handleAnswerChange = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  // Funcție pentru trimiterea răspunsului din notificări
  const handleAnswerQuestion = async (questionId) => {
    const token = localStorage.getItem('token');
    if (!answerText.trim()) {
      alert('Răspunsul nu poate fi gol!');
      return;
    }
    try {
      await answerQuestion(questionId, answerText, token);
      // Reîncarcă întrebările pentru a elimina întrebarea răspunsă
      const questionsData = await fetchQuestionsByAuthorId(user.authorId);
      setQuestions(questionsData);
      setAnswerText('');
      setShowAnswerForm(null);
      alert('Răspuns trimis cu succes!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Eroare la trimiterea răspunsului.');
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
        <button
          onClick={() => setActiveTab('notifications')}
          className={`block w-full text-left py-2 ${activeTab === 'notifications' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        >
          Notificări
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
            {books.map((book) => {
              // Extragem valorile modificate dacă există, sau valorile existente
              const mod = modifiedBooks[book._id] || {};
              const currentImageType = mod.imageType || book.imageType || "url";
              const currentCoverImage = mod.coverImage || book.coverImage || "";
              const currentUploadStatus = mod.uploadStatus || "";
              const currentEditPreviewImage = mod.editPreviewImage || "";
              return (
                <div key={book._id} className="mb-4 p-4 bg-gray-800 rounded-lg">
                  <div className="mb-2">
                    <label className="block text-gray-400 mb-1">Titlu</label>
                    <input
                      type="text"
                      defaultValue={book.title}
                      onChange={(e) => handleFieldChange(book._id, 'title', e.target.value)}
                      className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-400 mb-1">Genuri (separate prin virgulă)</label>
                    <input
                      type="text"
                      defaultValue={book.genres.join(', ')}
                      onChange={(e) =>
                        handleFieldChange(
                          book._id,
                          'genres',
                          e.target.value.split(',').map((g) => g.trim())
                        )
                      }
                      className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                    />
                  </div>
                  {/* Blocul pentru selectarea tipului de imagine */}
                  <div className="mb-2">
                    <label className="block mb-1 text-gray-400">Imagine coperta:</label>
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
                        Incarca imagine
                      </label>
                    </div>
                    {currentImageType === 'url' ? (
                      <input
                        type="text"
                        value={currentCoverImage}
                        onChange={(e) => handleFieldChange(book._id, 'coverImage', e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                        placeholder="Introdu URL-ul imaginii"
                      />
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleEditBookImageUpload(book._id, e)}
                          className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                        {currentUploadStatus && (
                          <p className="mt-1 text-sm text-yellow-400">{currentUploadStatus}</p>
                        )}
                        {currentEditPreviewImage && (
                          <div className="mt-2">
                            <p className="mb-1">Previzualizare:</p>
                            <img
                              src={currentEditPreviewImage}
                              alt="Previzualizare coperta"
                              className="max-w-xs max-h-48 rounded"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-400 mb-1">Descriere</label>
                    <textarea
                      defaultValue={book.description}
                      onChange={(e) =>
                        handleFieldChange(book._id, 'description', e.target.value)
                      }
                      className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-400 mb-1">Număr Pagini</label>
                    <input
                      type="number"
                      defaultValue={book.pages}
                      onChange={(e) =>
                        handleFieldChange(book._id, 'pages', parseInt(e.target.value))
                      }
                      className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmitBookChanges(book._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-4"
                  >
                    Submit Changes
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Stats</h2>
            <p>Total Books: {stats.totalBooks}</p>
            <p>Average Rating: {stats.avgRating.toFixed(2)}</p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Notificări</h2>
            {questions.filter(q => !q.answerText).length > 0 ? (
              questions.filter(q => !q.answerText).map((question) => (
                <div key={question._id} className="mb-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-300">
                    <strong>Întrebare:</strong> {question.questionText}
                  </p>
                  <p className="text-gray-400 text-sm">Întrebat de: {usernames[question.userId._id] || 'Utilizator necunoscut'}</p>
                  <p className="text-gray-400 mt-2">Fără răspuns încă.</p>
                  <button
                    onClick={() => setShowAnswerForm(question._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg mt-2"
                  >
                    Răspunde
                  </button>
                  {showAnswerForm === question._id && (
                    <div className="mt-4">
                      <textarea
                        placeholder="Scrie răspunsul tău aici..."
                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600"
                        rows="4"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                      />
                      <button
                        onClick={() => handleAnswerQuestion(question._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2"
                      >
                        Trimite răspunsul
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Nu există întrebări încă.</p>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;
