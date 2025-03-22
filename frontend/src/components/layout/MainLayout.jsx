// src/components/layout/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <NavBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 py-4 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} BookReview. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;