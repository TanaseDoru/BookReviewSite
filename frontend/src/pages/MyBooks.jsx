// src/pages/MyBooks.jsx
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchUserBooks, updateUserBook, fetchUserReviewForBook, deleteReview, saveReview, removeUserBook } from "../utils/api";
import Button from "../components/shared/Button";

const MyBooks = () => {
  const [userBooks, setUserBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("all");
  const [reviews, setReviews] = useState({});
  const navigate = useNavigate();

  // Load books and reviews in one function
  const loadBooksAndReviews = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      // Fetch user books
      const books = await fetchUserBooks(token);
      setUserBooks(books);
      setFilteredBooks(books);

      // Fetch reviews
      const reviewPromises = books.map(async (book) => {
        try {
          const review = await fetchUserReviewForBook(book.bookId._id, token);
          const hasReview = !!(
            review && (review.rating || (review.description && review.description.trim() !== ""))
          );
          return { bookId: book.bookId._id, hasReview, rating: review?.rating || null };
        } catch {
          return { bookId: book.bookId._id, hasReview: false, rating: null };
        }
      });
      const results = await Promise.all(reviewPromises);
      const map = results.reduce((acc, { bookId, hasReview, rating }) => {
        acc[bookId] = { hasReview, rating };
        return acc;
      }, {});
      setReviews(map);
    } catch (error) {
      console.error("Error loading books and reviews:", error);
      if (error.message.includes("401")) {
        alert("Sesiunea a expirat! Te rugăm să te autentifici din nou.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("A apărut o eroare la încărcarea cărților. Verifică conexiunea!");
      }
    }
  }, [navigate]);

  // On mount
  useEffect(() => {
    loadBooksAndReviews();
  }, [loadBooksAndReviews]);

  // Filter when activeTab changes
  useEffect(() => {
    let booksToFilter = [...userBooks];
    if (activeTab !== "all") {
      booksToFilter = booksToFilter.filter((b) => b.status === activeTab);
    }
    setFilteredBooks(booksToFilter);
  }, [activeTab, userBooks]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
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
    } else if (sortBy === "title") {
      valA = a.bookId[sortBy]?.toLowerCase() || "";
      valB = b.bookId[sortBy]?.toLowerCase() || "";
    } else if (sortBy === "avgRating" || sortBy === "rating") {
      valA = valA || 0;
      valB = valB || 0;
    }
    else if (sortBy === "author") {
      valA = a.bookId.authorId.name.toLowerCase();
      valB = b.bookId.authorId.name.toLowerCase();
    }
    if (sortOrder === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if(newStatus === "Elimina")
      {
        await removeUserBook(bookId, token);
        loadBooksAndReviews();
        return;
      }
      await updateUserBook(bookId, { status: newStatus }, token);
      // reload all to include updated dateRead
      await loadBooksAndReviews();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("A apărut o eroare la actualizarea statusului!");
    }
  };

  const handleRatingChange = async (bookId, newRating) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // If they selected the “-” option, confirm deletion
    if (newRating === "") {
      const ok = window.confirm("Sigur dorești să ștergi recenzia?");
      if (!ok) {
        // revert UI back to existing rating
        await loadBooksAndReviews();
        return;
      }
      try {
        await deleteReview(bookId, token);
        // refresh both books & reviews
        await loadBooksAndReviews();
      } catch (err) {
        console.error("Error deleting review:", err);
        alert("A apărut o eroare la ștergerea recenziei!");
      }
      return;
    }

    // Otherwise proceed with create/update
    try {
      await saveReview(bookId, { rating: newRating, description: "", isSpoiler: false }, token);
      await updateUserBook(bookId, { rating: newRating }, token);
      await loadBooksAndReviews();
    } catch (err) {
      console.error("Error updating rating:", err);
      alert("A apărut o eroare la actualizarea ratingului!");
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
                <td className="p-4">{book.bookId.authorId.name}</td>
                <td className="p-4">
                <div className="flex items-center space-x-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg"
                    onClick={() => navigate(`/editReview/${book.bookId._id}`)}
                  >
                    {reviews[book.bookId._id]?.hasReview ? "Modifică Recenzia" : "Scrie o Recenzie"}
                  </Button>
                  <select
                    value={reviews[book.bookId._id]?.rating || ""}
                    onChange={(e) => handleRatingChange(book.bookId._id, e.target.value)}
                    className="p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} ★
                      </option>
                    ))}
                  </select>
                </div>
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
                    <option value="Elimina">Elimina</option>
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