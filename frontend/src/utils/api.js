// src/utils/api.js
const API_BASE_URL = "http://localhost:3000/api";

const apiRequest = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("Sending token:", token); // Debug log
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      delete headers["Content-Type"];
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  console.log("Making request to:", `${API_BASE_URL}${endpoint}`); // Debug log
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    console.log("Request failed with response:", data); // Debug log
    throw new Error(data.message || "Request failed");
  }

  return data;
};

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

export const addUserBook = (bookId, status, token) =>
  apiRequest('/user-books/add', 'POST', { bookId, status }, token);

export const updateUserBook = (bookId, updates, token) =>
  apiRequest(`/user-books/${bookId}`, 'PATCH', updates, token);

export const updateProfileName = (firstName, lastName, token) =>
  apiRequest('/profile/update-name', 'PUT', { firstName, lastName }, token);

export const updateProfilePassword = (newPassword, token) =>
  apiRequest('/profile/update-password', 'PUT', { newPassword }, token);

export const uploadProfilePicture = (file, token) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return apiRequest('/profile/upload-picture', 'POST', formData, token);
};

export const fetchBookReviews = (bookId) =>
  apiRequest(`/reviews/book/${bookId}`, 'GET');

export const fetchUserReviewForBook = (bookId, token) =>
  apiRequest(`/reviews/user/book/${bookId}`, "GET", null, token);

export const saveReview = (bookId, reviewData, token) =>
  apiRequest(`/reviews/book/${bookId}`, "POST", reviewData, token);