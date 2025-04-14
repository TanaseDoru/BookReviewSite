import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/shared/Button';
import { fetchAuthorById, fetchUserProfile, addBook, updateBook, fetchQuestionsByAuthorId, answerQuestion } from '../utils/api';

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
  const [modifiedBooks, setModifiedBooks] = useState({});
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchAuthorData = async () => {
      const token = localStorage.getItem('token');
      try {
        const _userData = await fetchUserProfile(token);
        setUser(_userData);
        const data = await fetchAuthorById(id);
        setBooks(data.books || []);
        setStats({
          totalBooks: data.books.length,
          avgRating: data.books.reduce((sum, book) => sum + book.avgRating, 0) / (data.books.length || 1),
        });
        const questionsData = await fetchQuestionsByAuthorId(id);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };
    fetchAuthorData();
  }, [id]);

  const handleAddBook = async () => {
    const token = localStorage.getItem('token');
    try {
      const bookToAdd = {
        ...newBook,
        authorId: user.authorId,
        genres: newBook.genres.split(',').map((genre) => genre.trim()),
        pages: parseInt(newBook.pages),
      };
      const response = await addBook(bookToAdd, token);
      setBooks([...books, response]);
      setNewBook({ title: '', genres: '', pages: '', description: '', coverImage: '' });
      alert('Book added successfully!');
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book.');
    }
  };

  const handleFieldChange = (bookId, field, value) => {
    setModifiedBooks((prev) => ({
      ...prev,
      [bookId]: { ...prev[bookId], [field]: value },
    }));
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

  const handleSubmitAnswer = async (questionId) => {
    const token = localStorage.getItem('token');
    const answerText = answers[questionId];
    if (!answerText || !answerText.trim()) {
      alert('Răspunsul nu poate fi gol!');
      return;
    }
    try {
      await answerQuestion(questionId, answerText, token);
      const questionsData = await fetchQuestionsByAuthorId(id);
      setQuestions(questionsData);
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });
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
            {books.map((book) => (
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
                      handleFieldChange(book._id, 'genres', e.target.value.split(',').map((g) => g.trim()))
                    }
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-400 mb-1">Link Imagine Copertă</label>
                  <input
                    type="text"
                    defaultValue={book.coverImage}
                    onChange={(e) => handleFieldChange(book._id, 'coverImage', e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-400 mb-1">Descriere</label>
                  <textarea
                    defaultValue={book.description}
                    onChange={(e) => handleFieldChange(book._id, 'description', e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-400 mb-1">Număr Pagini</label>
                  <input
                    type="number"
                    defaultValue={book.pages}
                    onChange={(e) => handleFieldChange(book._id, 'pages', parseInt(e.target.value))}
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

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Notificări</h2>
            {questions.length > 0 ? (
              questions.map((question) => (
                <div key={question._id} className="mb-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-300">
                    <strong>Întrebare:</strong> {question.questionText}
                  </p>
                  <p className="text-gray-400 text-sm">Întrebat de: {question.userId.username}</p>
                  {question.answerText ? (
                    <p className="text-gray-300 mt-2">
                      <strong>Răspuns:</strong> {question.answerText}
                    </p>
                  ) : (
                    <div>
                      <textarea
                        placeholder="Scrie răspunsul tău aici..."
                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 mt-2"
                        rows="4"
                        value={answers[question._id] || ''}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      />
                      <Button
                        onClick={() => handleSubmitAnswer(question._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2"
                      >
                        Trimite Răspuns
                      </Button>
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