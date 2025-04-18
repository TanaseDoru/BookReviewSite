// src/pages/MyBooks.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchUserBooks, updateUserBook, fetchUserReviewForBook, saveReview } from "../utils/api";
import Button from "../components/shared/Button";

const MyBooks = () => {
  const [userBooks, setUserBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("all");
  const [reviews, setReviews] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooksAndReviews = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const books = await fetchUserBooks(token);
        setUserBooks(books);
        setFilteredBooks(books);

        const reviewPromises = books.map(async (book) => {
          try {
            const review = await fetchUserReviewForBook(book.bookId._id, token);
            const hasReview = !!(review && (review.rating || (review.description && review.description.trim() !== "")));
            return { bookId: book.bookId._id, hasReview, rating: review?.rating || null };
          } catch (err) {
            return { bookId: book.bookId._id, hasReview: false, rating: null };
          }
        });
        const reviewResults = await Promise.all(reviewPromises);
        const reviewsMap = reviewResults.reduce(
          (acc, { bookId, hasReview, rating }) => {
            acc[bookId] = { hasReview, rating };
            return acc;
          },
          {}
        );
        setReviews(reviewsMap);
      } catch (error) {
        console.error("Error fetching user books:", error);
        if (error.message.includes("401")) {
          alert("Sesiunea a expirat! Te rugăm să te autentifici din nou.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert("A apărut o eroare la încărcarea cărților. Verifică conexiunea!");
        }
      }
    };
    fetchBooksAndReviews();
  }, [navigate]);

  useEffect(() => {
    let booksToFilter = [...userBooks];
    if (activeTab !== "all") {
      booksToFilter = booksToFilter.filter((book) => book.status === activeTab);
    }
    setFilteredBooks(booksToFilter);
  }, [activeTab, userBooks]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "dateAdded" || sortBy === "dateRead") {
      valA = new Date(valA);
      valB = new Date(valB);
    } else if (sortBy === "title" || sortBy === "author") {
      valA = a.bookId[sortBy]?.toLowerCase() || "";
      valB = b.bookId[sortBy]?.toLowerCase() || "";
    } else if (sortBy === "avgRating" || sortBy === "rating") {
      valA = valA || 0;
      valB = valB || 0;
    }

    if (sortOrder === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await updateUserBook(bookId, { status: newStatus }, token);
      setUserBooks(
        userBooks.map((book) =>
          book.bookId._id === bookId ? { ...book, status: newStatus } : book
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("A apărut o eroare la actualizarea statusului!");
    }
  };

  const handleRatingChange = async (bookId, newRating) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const reviewData = {
        rating: newRating,
        description: "",
        isSpoiler: false,
      };
      await saveReview(bookId, reviewData, token);
      await updateUserBook(bookId, { rating: newRating }, token);

      setReviews((prev) => ({
        ...prev,
        [bookId]: { hasReview: true, rating: newRating },
      }));

      setUserBooks(
        userBooks.map((book) =>
          book.bookId._id === bookId ? { ...book, rating: newRating } : book
        )
      );
    } catch (error) {
      console.error("Error updating rating:", error);
      if (error.status === 401) {
        alert("Sesiunea a expirat! Te rugăm să te autentifici din nou.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("A apărut o eroare la actualizarea ratingului!");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-white mb-6"
      >
        Cartile Mele
      </motion.h1>

      {/* Bookshelves Tabs */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Stare</h2>
        <div className="flex space-x-4">
          <Button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Toate ({userBooks.length})
          </Button>
          <Button
            onClick={() => setActiveTab("Citit")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "Citit"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Citit ({userBooks.filter((b) => b.status === "Citit").length})
          </Button>
          <Button
            onClick={() => setActiveTab("Citesc")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "Citesc"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Citesc ({userBooks.filter((b) => b.status === "Citesc").length})
          </Button>
          <Button
            onClick={() => setActiveTab("Vreau sa citesc")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "Vreau sa citesc"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Vreau sa citesc (
            {userBooks.filter((b) => b.status === "Vreau sa citesc").length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-gray-800 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="p-4">Cover</th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort("title")}>
                Titlu {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort("author")}>
                Autor {sortBy === "author" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort("avgRating")}>
                Recenzie {sortBy === "avgRating" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-4">Recenzia mea</th>
              <th className="p-4">Stare</th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort("dateAdded")}>
                Data Adaugat {sortBy === "dateAdded" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-4 cursor-pointer" onClick={() => handleSort("dateRead")}>
                Data Citit {sortBy === "dateRead" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBooks.map((book, index) => (
              <motion.tr
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-gray-700 hover:bg-gray-600"
              >
                <td className="p-4">
                  {book.bookId.coverImage ? (
                    <img
                      src={book.bookId.coverImage}
                      alt="cover"
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    "No cover"
                  )}
                </td>
                <td className="p-4">
                  <Link to={`/book/${book.bookId._id}`} className="text-blue-500 hover:underline">
                    {book.bookId.title}
                  </Link>
                </td>
                <td className="p-4">{book.bookId.author}</td>
                <td className="p-4">{book.bookId.avgRating.toFixed(2) || "—"}</td>
                <td className="p-4 flex gap-2 items-center">
                  <button
                    className="buttonStyle bg-blue-500 hover:bg-blue-600 text-sm"
                    onClick={() => navigate(`/editReview/${book.bookId._id}`)}
                  >
                    {reviews[book.bookId._id]?.hasReview ? "Modifica Recenzia" : "Scrie o Recenzie"}
                  </button>
                  <select
                    value={reviews[book.bookId._id]?.rating || ""}
                    onChange={(e) => handleRatingChange(book.bookId._id, parseInt(e.target.value))}
                    className="p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} ★
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <select
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.bookId._id, e.target.value)}
                    className="p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Vreau sa citesc">Vreau sa citesc</option>
                    <option value="Citesc">Citesc</option>
                    <option value="Citit">Citit</option>
                  </select>
                </td>
                <td className="p-4">{new Date(book.dateAdded).toLocaleDateString()}</td>
                <td className="p-4">
                  {book.dateRead ? new Date(book.dateRead).toLocaleDateString() : "—"}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyBooks;