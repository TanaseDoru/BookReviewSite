// src/routes/router.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import Browse from '../pages/Browse';
import BookPage from '../pages/BookPage';
import AuthorPage from '../pages/AuthorPage';
import MyBooks from '../pages/MyBooks';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import Register from '../pages/Register';
import EditReview from "../pages/EditReview"; // Import EditRev
import AdminPage from '../pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/browse', element: <Browse /> },
      { path: '/book/:bookId', element: <BookPage /> },
      { path: '/authors/:id', element: <AuthorPage /> },
      { path: '/myBooks', element: <MyBooks /> },
      { path: '/profile', element: <Profile /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: "/editReview/:bookId", element: <EditReview /> },
      { path: "/admin", element: <AdminPage /> }, 
    ],
  },
]);