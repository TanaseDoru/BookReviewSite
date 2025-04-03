import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAuthorById } from '../utils/api';

const AuthorPage = () => {
  const { id } = useParams(); // Schimbăm de la `name` la `id`
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        console.log(id);
        const data = await fetchAuthorById(id); // Folosim fetchAuthorById
        setAuthor(data.author); // Setăm autorul din răspuns
        setBooks(data.books); // Setăm cărțile din răspuns
      } catch (error) {
        console.error('Error fetching author:', error);
      }
    };
    loadAuthor();
  }, [id]);

  if (!author) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      <div className="flex items-center gap-6">
        <img
          src={author.picture || '/assets/blankProfile.png'}
          alt={author.name}
          className="w-40 h-40 object-cover rounded-full shadow-lg"
        />
        <div>
          <h1 className="text-4xl font-bold">{author.name}</h1>
          <p className="text-gray-300 mt-2">{author.description || 'No description available.'}</p>
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
    </div>
  );
};

export default AuthorPage;