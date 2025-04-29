// src/utils/api.js
const API_BASE_URL = "http://localhost:3000/api";

const apiRequest = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // only set JSON content-type if we're *not* sending FormData
  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method,
    headers,
    // if FormData, pass it straight; otherwise JSON.stringify
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : null,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  } else {
    const text = await response.text();
    console.error("Răspuns non-JSON:", text);
    throw new Error("Serverul a returnat un răspuns invalid");
  }
};

// Existing API functions...
export const login = (email, password) =>
  apiRequest('/auth/login', 'POST', { email, password });

export const register = (firstName, lastName, email, password) =>
  apiRequest('/auth/register', 'POST', { firstName, lastName, email, password });

export const fetchUserProfile = (token) =>
  apiRequest('/profile', 'GET', null, token);

export const fetchBooks = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/books${query ? `?${query}` : ''}`);
};

export const fetchBookById = (bookId) =>
  apiRequest(`/books/${bookId}`);

export const fetchAuthorByName = (name) =>
  apiRequest(`/authors/name/${name}`);

export const fetchUserBooks = (token) =>
  apiRequest('/user-books', 'GET', null, token);

export const fetchAuthorById = (id) =>
  apiRequest(`/authors/${id}`);

export const addUserBook = (bookId, status, token) =>
  apiRequest('/user-books/add', 'POST', { bookId, status }, token);

export const updateUserBook = (bookId, updates, token) =>
  apiRequest(`/user-books/${bookId}`, 'PATCH', updates, token);

export const updateProfileName = (firstName, lastName, token) =>
  apiRequest('/profile/update-name', 'PUT', { firstName, lastName }, token);

export const updateProfilePassword = (currentPassword, newPassword, token) =>
  apiRequest('/profile/update-password', 'PUT', { currentPassword, newPassword }, token);

export const uploadProfilePicture = (file, token) => {
  const formData = new FormData();
  formData.append("profilePicture", file);
  return apiRequest("/profile/upload-picture", "POST", formData, token);
};


export const fetchUserReviewForBook = (bookId, token) =>
  apiRequest(`/reviews/user/book/${bookId}`, "GET", null, token);

export const saveReview = (bookId, reviewData, token) =>
  apiRequest(`/reviews/book/${bookId}`, "POST", reviewData, token);

export const fetchBookReviews = (bookId, page = 1, limit = 8, rating = null) => {
  const query = new URLSearchParams({ page, limit });
  if (rating) query.append("rating", rating);
  return apiRequest(`/reviews/book/${bookId}?${query.toString()}`);
};

export const likeReview = (reviewId, token) =>
  apiRequest(`/reviews/like/${reviewId}`, "POST", null, token);

// Funcții pentru statistici
export const fetchSiteStats = (token) =>
  apiRequest('/admin/stats', 'GET', null, token);

// Funcții pentru adăugare carte
export const addBook = (bookData, token) =>
  apiRequest('/admin/books', 'POST', bookData, token);

// Funcții pentru adăugare autor
export const addAuthor = (authorData, token) =>
  apiRequest('/admin/authors', 'POST', authorData, token);

// Funcții pentru gestionare utilizatori și roluri
export const fetchUsers = (email = '', token) =>
  apiRequest(`/admin/users?email=${email}`, 'GET', null, token);

export const updateUserRole = (userId, role, token) =>
  apiRequest(`/admin/users/${userId}/role`, 'PATCH', { role }, token);

// Funcții pentru notificări
export const fetchAuthorRequests = (token) =>
  apiRequest('/admin/author-requests', 'GET', null, token);

export const updateAuthorName = (authorId, name, token) =>
  apiRequest(`/admin/authors/${authorId}/updateName`, 'PUT', { name }, token);

export const approveAuthorRequest = (requestId, authorId, token) =>
  apiRequest(`/admin/author-requests/${requestId}/approve`, 'POST', { authorId }, token);

export const rejectAuthorRequest = (requestId, token) =>
  apiRequest(`/admin/author-requests/${requestId}/reject`, 'DELETE', null, token);

// Funcție pentru modificarea unei cărți
export const updateBook = (bookId, updatedData, token) =>
  apiRequest(`/books/${bookId}`, 'PUT', updatedData, token);

// Fetch questions by author ID
export const fetchQuestionsByAuthorId = async (authorId) => {
  return apiRequest(`/questions/${authorId}`);
};

// Ask a question
export const askQuestion = async (authorId, questionText, token) => {
  return apiRequest(`/questions/ask/${authorId}`, "POST", { questionText }, token);
};

// Fetch userName from id
export const fetchUserNameById = async (userId) => {
  return apiRequest(`/users/${userId}`);
};

// Answer a question
export const answerQuestion = async (questionId, answerText, token) => {
  return apiRequest(`/questions/answer/${questionId}`, "PUT", { answerText }, token);
};

export const updateAuthorPicture = (authorId, picture, token) =>
  apiRequest(`/authors/${authorId}`, 'PUT', { picture }, token);

export const createAuthorRequest = (userId, details, token) =>
  apiRequest('/notifications', 'POST', { userId, details }, token);

// New function to check pending author request
export const checkAuthorRequest = async (token) =>
  apiRequest('/notifications/check', 'GET', null, token);

export const fetchMyAuthorRequests = (token) =>
  apiRequest('/notifications/my-notifications', 'GET', null, token);

export const updateUserActiveStatus = async (userId, isActive, token) => {
  return apiRequest(`/admin/users/${userId}/isActive`, 'PUT', { isActive }, token);
};

export const getUserIdByAuthorId = async (authorId) => {
  return apiRequest(`/users/getUserByAuthorId/${authorId}`);
};

// Funcții BookRequest
export const fetchBookRequests = (token) =>
  {return apiRequest('/book-requests', 'GET', null, token);};

export const fetchMyBookRequests = (token) =>
  apiRequest('/book-requests/my', 'GET', null, token);

export const createBookRequest = (data, token) =>
  apiRequest('/book-requests', 'POST', data, token);

export const approveBookRequest = (id, token) =>
  apiRequest(`/book-requests/${id}/approve`, 'PUT', null, token);

export const rejectBookRequest = (id, token) =>
  apiRequest(`/book-requests/${id}/reject`, 'PUT', null, token);

export const deleteReview = (bookId, token) =>
  apiRequest(`/reviews/book/${bookId}`, 'DELETE', null, token);

export const fetchPublishers = (token) => {
  return apiRequest('/publishers', 'GET', null, token);
};

export const addPublisher = (publisherData, token) => 
  apiRequest('/publishers', 'POST', { publisherData }, token);

export const fetchPublisherById = (id) =>
  apiRequest(`/publishers/${id}`);

export const fetchBooksByPublisher = (id) =>
  apiRequest(`/publishers/${id}/books`);

export const removeUserBook = (bookId, token) =>
  apiRequest(`/user-books/${bookId}`, 'DELETE', null, token);