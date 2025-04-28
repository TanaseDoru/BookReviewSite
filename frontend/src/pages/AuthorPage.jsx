import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAuthorById, fetchQuestionsByAuthorId, askQuestion, answerQuestion, fetchUserNameById } from '../utils/api';
import blankProfile from '../assets/blankProfile.png';
import { AuthContext } from '../context/AuthContext';

const AuthorPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext); // Contextul pentru utilizator
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const isAuthor = user && author && user.authorId === author._id;

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const data = await fetchAuthorById(id);
        setAuthor(data.author);
        setBooks(data.books);
        const questionsData = await fetchQuestionsByAuthorId(id);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching author or questions:', error);
      }
    };
    loadAuthor();
  }, [id]);

  useEffect(() => {
    const fetchUserNames = async () => {
      const ids = [...new Set(questions.map(q => q.userId).filter(Boolean))];
      const newUsernames = {};
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

  const handleAskQuestion = async () => {
    if (!questionText.trim()) {
      alert('Întrebarea nu poate fi goală!');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await askQuestion(id, questionText, token);
      setQuestionText('');
      const questionsData = await fetchQuestionsByAuthorId(id);
      setQuestions(questionsData);
      alert('Întrebarea a fost trimisă cu succes!');
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Eroare la trimiterea întrebării.');
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    if (!answerText.trim()) {
      alert('Răspunsul nu poate fi gol!');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await answerQuestion(questionId, answerText, token);
      setAnswerText('');
      setShowAnswerForm(null);
      const questionsData = await fetchQuestionsByAuthorId(id);
      setQuestions(questionsData);
      alert('Răspunsul a fost trimis cu succes!');
    } catch (error) {
      console.error('Error answering question:', error);
      alert('Eroare la trimiterea răspunsului.');
    }
  };

  if (!author)
    return <div className="text-white text-center mt-10">Loading...</div>;

  // Verificăm dacă autorul poate primi întrebări
  const canAskQuestions = author.isAlive && author.isActive;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      <div className="flex items-center gap-6">
        <img
          src={author.picture || blankProfile}
          alt={author.name}
          className="w-40 h-40 object-cover rounded-full shadow-lg"
        />
        <div>
          <h1 className="text-4xl font-bold">{author.name}</h1>
          <p className="text-gray-300 mt-2">{author.description || 'No description available.'}</p>
          {!author.isActive && (
            <p className="text-red-500 mt-2">Acest utilizator are contul dezactivat.</p>
          )}
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Books by {author.name}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book._id}
              className="bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition duration-300"
              onClick={() => navigate(`/book/${book._id}`)}
            >
              <img
                src={book.coverImage || '/assets/blankProfile.png'}
                alt={book.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h4 className="text-lg font-semibold truncate">{book.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Întrebări și Răspunsuri</h3>
        {questions.length > 0 ? (
          questions.map((question) => (
            <div key={question._id} className="mb-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300">
                <strong>Întrebare:</strong> {question.questionText}
              </p>
              <p className="text-gray-400 text-sm">
                Întrebat de: {usernames[question.userId._id] || 'Utilizator necunoscut'}
              </p>
              {question.answerText ? (
                <div className="mt-2 p-3 bg-blue-900 rounded-lg">
                  <p className="text-white font-semibold">
                    <strong>Răspuns de la {author.name}:</strong>
                  </p>
                  <p className="text-gray-200">{question.answerText}</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 mt-2">Fără răspuns încă.</p>
                  {isAuthor && (
                    <button
                      onClick={() => setShowAnswerForm(question._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg mt-2"
                    >
                      Răspunde
                    </button>
                  )}
                </>
              )}
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
        {isLoggedIn && !isAuthor && canAskQuestions && (
          <button
            onClick={() => setShowQuestionForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4"
          >
            Pune o întrebare
          </button>
        )}
        {showQuestionForm && (
          <div className="mt-4">
            <textarea
              placeholder="Scrie întrebarea ta aici..."
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600"
              rows="4"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
            <button
              onClick={handleAskQuestion}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2"
            >
              Trimite întrebarea
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorPage;