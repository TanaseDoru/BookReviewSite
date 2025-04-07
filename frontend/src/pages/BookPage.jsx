import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchBookById, fetchAuthorByName, addUserBook, fetchUserBooks, updateUserBook, fetchBookReviews, likeReview, fetchUserReviewForBook, saveReview } from "../utils/api";
import fullStar from "../assets/fullStar.png";
import emptyStar from "../assets/emptyStar.png";
import Button from "../components/shared/Button";
import Paginate from "../components/ui/Paginate";

const BookPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [authorId, setAuthorId] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userBook, setUserBook] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [showSpoiler, setShowSpoiler] = useState({});
  const [likedReviews, setLikedReviews] = useState({});

  const loadBookAndUserBook = async () => {
    try {
      const bookData = await fetchBookById(bookId);
      setBook(bookData);

      if (user) {
        const token = localStorage.getItem("token");
        const userBooks = await fetchUserBooks(token);
        const existingUserBook = userBooks.find((ub) => ub.bookId._id === bookId);
        setUserBook(existingUserBook || null);

        try {
          const reviewData = await fetchUserReviewForBook(bookId, token);
          if (reviewData && reviewData._id) {
            setUserReview(reviewData);
            setUserRating(reviewData.rating);
          } else {
            setUserReview(null);
            setUserRating(0);
          }
        } catch (error) {
          console.error("Error fetching user review:", error);
          setUserReview(null);
          setUserRating(0);
        }
      }

      // Setăm authorId direct din book.authorId
      if (bookData.authorId) {
        setAuthorId(bookData.authorId._id);
      }
    } catch (error) {
      console.error("Error fetching book or user books:", error);
    }
  };

  const toggleExpand = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const loadRatingDistribution = async () => {
    try {
      const data = await fetchBookReviews(bookId, 1, 1);
      setRatingDistribution(data.ratingDistribution);
    } catch (error) {
      console.error("Error fetching rating distribution:", error);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await fetchBookReviews(bookId, currentPage, 8, selectedRating);
      setReviews(data.reviews);
      setTotalReviews(data.totalReviews);
      setTotalPages(data.totalPages);

      const liked = {};
      data.reviews.forEach((review) => {
        liked[review._id] = user && user._id ? review.likes.includes(user._id) : false;
      });
      setLikedReviews(liked);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    loadBookAndUserBook();
    loadRatingDistribution();
  }, [bookId, user]);

  useEffect(() => {
    loadReviews();
  }, [bookId, currentPage, user]);

  const handleRatingClick = async (rating) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const reviewData = { rating };
      const savedReview = await saveReview(bookId, reviewData, token);
      setUserReview(savedReview);
      setUserRating(rating);
      loadReviews();
      loadBookAndUserBook();
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Failed to save review.");
    }
  };

  const handleAddToList = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const newUserBook = await addUserBook(bookId, "Vreau sa citesc", token);
      setUserBook(newUserBook);
      await loadBookAndUserBook();
    } catch (error) {
      console.error("Error adding book to list:", error);
      alert("Failed to add book to your list.");
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!userBook) {
        const newUserBook = await addUserBook(bookId, newStatus, token);
        setUserBook(newUserBook);
      } else {
        await updateUserBook(book._id, { status: newStatus }, token);
        setUserBook({ ...userBook, status: newStatus });
      }
      await loadBookAndUserBook();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("A apărut o eroare la actualizarea statusului!");
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
    window.scrollTo(0, 0);
  };

  const handleRatingFilter = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
    setCurrentPage(1);
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const data = await likeReview(reviewId, token);
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId ? { ...review, likes: Array(data.likes).fill({}) } : review
        )
      );
      setLikedReviews((prev) => ({
        ...prev,
        [reviewId]: data.hasLiked,
      }));
    } catch (error) {
      console.error("Error liking review:", error);
      alert("Failed to like/unlike review.");
    }
  };

  const toggleSpoiler = (reviewId) => {
    setShowSpoiler((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  if (!book) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white flex gap-10">
      {/* Left Section */}
      <div className="w-80 flex flex-col items-center sticky top-10">
        <img
          src={book.coverImage || "/assets/blankProfile.png"}
          alt={book.title}
          className="w-64 h-96 object-cover rounded-lg shadow-lg"
        />
        <a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer">
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Cumpara
          </Button>
        </a>
        {userBook ? (
          <div className="mt-4">
            <select
              value={userBook.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-40 bg-gray-700 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Vreau sa citesc">Vreau să citesc</option>
              <option value="Citesc">Citesc</option>
              <option value="Citit">Citit</option>
            </select>
          </div>
        ) : (
          <Button
            onClick={handleAddToList}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Vreau să citesc
          </Button>
        )}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Rate this book:</h3>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <img
                key={star}
                src={userRating >= star ? fullStar : emptyStar}
                alt="star"
                className="w-6 h-6 cursor-pointer"
                onClick={() => handleRatingClick(star)}
              />
            ))}
          </div>
          {userReview && (
            <Button
              onClick={() => navigate(`/editReview/${bookId}`)}
              className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 rounded-lg"
            >
              Modifica Recenzia
            </Button>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold">{book.title}</h1>
        <h2 className="text-xl text-gray-400 mt-2">
          {authorId ? (
            <button
              onClick={() => navigate(`/authors/${authorId}`)}
              className="text-blue-400 hover:underline"
            >
              {book.authorId ? book.authorId.name : "Unknown Author"}
            </button>
          ) : (
            <span>{book.authorId ? book.authorId.name : "Unknown Author"}</span>
          )}
        </h2>
        <p className="mt-2 text-gray-300 whitespace-pre-line">{book.description || "No description provided."}</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Genres:</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {(book.genres || []).map((genre, index) => (
              <button
                key={index}
                className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                onClick={() => navigate(`/browse?genres=${genre}`)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Distribution and Reviews */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Review-uri ({totalReviews} review-uri)</h2>
          <div className="flex items-center gap-4 mt-4">
            <div className="text-4xl font-bold">{book.avgRating.toFixed(2)}</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <img
                  key={star}
                  src={book.avgRating >= star ? fullStar : emptyStar}
                  alt="star"
                  className="w-6 h-6"
                />
              ))}
            </div>
            <div className="text-gray-400">({totalReviews} review-uri)</div>
          </div>

          {/* Rating Filter */}
          <div className="mt-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div
                key={star}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleRatingFilter(star)}
              >
                <span className="text-lg">{star} stele</span>
                <div className="flex-1 h-4 bg-gray-200 rounded">
                  <div
                    className={`h-full rounded ${
                      star === 5
                        ? "bg-green-600"
                        : star === 4
                        ? "bg-lime-500"
                        : star === 3
                        ? "bg-yellow-500"
                        : star === 2
                        ? "bg-orange-500"
                        : "bg-red-500"
                    } ${selectedRating === star ? "opacity-100" : "opacity-70"}`}
                    style={{
                      width: `${
                        totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-gray-400">({ratingDistribution[star]})</span>
              </div>
            ))}
          </div>

          {/* Reviews List */}
          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400">Nu există review-uri pentru această carte.</p>
            ) : (
              reviews
                .filter((review) => !selectedRating || review.rating === selectedRating)
                .map((review) => (
                  <div key={review._id} className="border-b border-gray-700 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {review.userId.firstName} {review.userId.lastName}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <img
                            key={star}
                            src={review.rating >= star ? fullStar : emptyStar}
                            alt="star"
                            className="w-4 h-4"
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.isSpoiler && !showSpoiler[review._id] ? (
                      <div className="mt-2">
                        <p className="text-yellow-500">Aceasta recenzie conține spoilere.</p>
                        <button
                          onClick={() => toggleSpoiler(review._id)}
                          className="text-blue-400 hover:underline"
                        >
                          Vreau să citesc recenzia
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        {review.description ? (
                          (() => {
                            const words = review.description.split(/\s+/);
                            if (words.length > 100 && !expandedReviews[review._id]) {
                              const truncated = words.slice(0, 100).join(" ");
                              return (
                                <>
                                  <p className="text-gray-300 whitespace-pre-line">
                                    {truncated}...
                                  </p>
                                  <button
                                    onClick={() => toggleExpand(review._id)}
                                    className="text-blue-400 hover:underline mt-1"
                                  >
                                    arată mai mult...
                                  </button>
                                </>
                              );
                            } else {
                              return (
                                <p className="text-gray-300 whitespace-pre-line">
                                  {review.description}
                                </p>
                              );
                            }
                          })()
                        ) : (
                          <p className="text-gray-300">No description provided.</p>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleLikeReview(review._id)}
                        className={`flex items-center gap-1 ${
                          likedReviews[review._id] ? "text-red-500" : "text-gray-400"
                        } hover:text-red-500 transition`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={likedReviews[review._id] ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{review.likes.length} Likes</span>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Paginate
              pageCount={totalPages}
              onPageChange={handlePageChange}
              forcePage={currentPage - 1}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookPage;