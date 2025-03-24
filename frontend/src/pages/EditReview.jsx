import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserReviewForBook, saveReview, fetchBookById } from "../utils/api";

const EditReview = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState({
    rating: "",
    description: "",
    isSpoiler: false,
    startDate: "",
    endDate: "",
  });
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [charCount, setCharCount] = useState(0); // Am schimbat din wordCount în charCount

  // Funcție pentru calcularea numărului de litere
  const calculateCharCount = (text) => text.length;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const bookData = await fetchBookById(bookId);
        setBook(bookData);

        const existingReview = await fetchUserReviewForBook(bookId, token);
        if (existingReview) {
          const initialDescription = existingReview.description || "";
          setReview({
            rating: existingReview.rating || "",
            description: initialDescription,
            isSpoiler: existingReview.isSpoiler || false,
            startDate: existingReview.startDate
              ? new Date(existingReview.startDate).toISOString().split("T")[0]
              : "",
            endDate: existingReview.endDate
              ? new Date(existingReview.endDate).toISOString().split("T")[0]
              : "",
          });
          setCharCount(calculateCharCount(initialDescription)); // Calculăm literele inițiale
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load book or review");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookId, navigate]);

  // Gestionăm schimbarea textului și limităm la 500 de litere
  const handleDescriptionChange = (e) => {
    const newText = e.target.value;
    const newCharCount = calculateCharCount(newText);
    if (newCharCount <= 500) {
      setReview({ ...review, description: newText });
      setCharCount(newCharCount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!review.rating) {
      setError("Rating is required");
      return;
    }

    try {
      const reviewData = {
        rating: parseInt(review.rating),
        description: review.description,
        isSpoiler: review.isSpoiler,
        startDate: review.startDate || null,
        endDate: review.endDate || null,
      };
      await saveReview(bookId, reviewData, token);
      navigate("/myBooks");
    } catch (err) {
      setError("Failed to save review");
      console.error(err);
      if (err.message.includes("401")) {
        alert("Sesiunea a expirat! Te rugăm să te autentifici din nou.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {book && (
        <div className="flex items-center gap-4 mb-6">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-24 h-32 object-cover rounded"
            />
          ) : (
            <div className="w-24 h-32 bg-gray-700 flex items-center justify-center rounded">
              <span className="text-gray-400">No cover</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-white">
            {review.description || review.rating
              ? `Modifica Recenzia pentru "${book.title}"`
              : `Scrie o Recenzie pentru "${book.title}"`}
          </h1>
        </div>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-white">Rating (1-5):</label>
          <select
            value={review.rating}
            onChange={(e) => setReview({ ...review, rating: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value="">Select rating</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} ★
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-white">Recenzie:</label>
          <textarea
            value={review.description}
            onChange={handleDescriptionChange}
            className="w-full p-2 rounded bg-gray-700 text-white h-40"
            placeholder="Scrie recenzia ta aici..."
          />
          <div
            className={`text-sm mt-1 ${
              charCount >= 400 && charCount < 500
                ? "text-yellow-500"
                : charCount === 500
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {charCount}/500 litere
          </div>
        </div>
        <div>
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={review.isSpoiler}
              onChange={(e) => setReview({ ...review, isSpoiler: e.target.checked })}
              className="mr-2"
            />
            Conține spoilere
          </label>
        </div>
        <div>
          <label className="block mb-1 text-white">Data Început Citire (opțional):</label>
          <input
            type="date"
            value={review.startDate}
            onChange={(e) => setReview({ ...review, startDate: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-white">Data Terminat Citire (opțional):</label>
          <input
            type="date"
            value={review.endDate}
            onChange={(e) => setReview({ ...review, endDate: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="buttonStyle bg-blue-500 hover:bg-blue-600">
            Salvează
          </button>
          <button
            type="button"
            className="buttonStyle bg-gray-500 hover:bg-gray-600"
            onClick={() => navigate("/myBooks")}
          >
            Anulează
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReview;