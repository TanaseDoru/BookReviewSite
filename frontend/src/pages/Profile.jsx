import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateAuthorName, updateProfileName, updateProfilePassword, uploadProfilePicture } from '../utils/api';
import Button from '../components/shared/Button';
import blankProfile from '../assets/blankProfile.png';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Pentru meniu colapsabil pe mobil
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const data = await uploadProfilePicture(file, token);
      const updatedUser = { ...user, profilePicture: `data:image/png;base64,${data.profilePicture}` };
      setUser(updatedUser);

      if (user.role === 'author') {
        await fetch(`http://localhost:3000/api/authors/${user._id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ picture: data.profilePicture }),
        });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  const handleNameUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await updateProfileName(user.firstName, user.lastName, token);

      if (user.role === 'author') {
        await updateAuthorName(user.authorId, `${user.firstName} ${user.lastName}`, token);
      }

      alert('Profile updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update profile.');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await updateProfilePassword(currentPassword, newPassword, token);
      alert('Password updated successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.message || 'Failed to update password.');
    }
  };

  const handleAuthorRequest = () => {
    setNotification('DE IMPLEMENTAT SISTEMUL DE NOTIFICARI');
  };

  // Variante pentru animații
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 z-50 w-64 bg-gray-800 shadow-lg h-full md:static md:w-1/4 md:p-6 p-4 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-xl font-bold">Profil</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white text-2xl focus:outline-none"
            aria-label="Închide meniul"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center">
          <motion.img
            src={user.profilePicture ? `data:image/png;base64,${user.profilePicture}` : blankProfile}
            alt="Profile"
            className="w-32 h-32 rounded-full shadow-lg mb-4 border-2 border-blue-400 hover:border-blue-500 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
          />
          <h2 className="text-2xl font-semibold text-center">
            {user.firstName} {user.lastName}
          </h2>
        </div>
      </motion.div>

      {/* Overlay pentru fundal pe mobil când sidebar-ul este deschis */}
      {isSidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
      )}

      {/* Buton pentru a deschide meniul pe mobil */}
      <motion.button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-16 right-4 z-[60] p-3 bg-blue-600 rounded-lg text-white text-2xl focus:outline-none shadow-lg"
        aria-label="Deschide meniul"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        ☰
      </motion.button>

      {/* Conținut principal */}
      <motion.div
        className="w-full md:w-3/4 p-6 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-wrap gap-4 mb-8">
          {['profile', 'security', 'extra'].map((tab) => (
            <motion.div key={tab} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm md:text-base ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab === 'profile' && 'Profil'}
                {tab === 'security' && 'Securitate Cont'}
                {tab === 'extra' && 'Extra'}
              </Button>
            </motion.div>
          ))}
        </div>

        {activeTab === 'profile' && (
          <motion.div
            className="bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
            variants={containerVariants}
          >
            <h3 className="text-2xl font-bold mb-4">Profil</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-300">Prenume</label>
                <input
                  type="text"
                  value={user.firstName}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-300">Nume</label>
                <input
                  type="text"
                  value={user.lastName}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-300">Imagine de Profil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
                />
              </div>
              <Button
                onClick={handleNameUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full md:w-auto"
              >
                Aplică Modificările
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            className="bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
            variants={containerVariants}
          >
            <h3 className="text-2xl font-bold mb-4">Securitate Cont</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-300">Email</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 opacity-70"
                />
              </div>
              {!showChangePassword ? (
                <Button
                  onClick={() => setShowChangePassword(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full md:w-auto"
                >
                  Schimbă Parola
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-gray-300">Parola Actuală</label>
                    <input
                      type="password"
                      placeholder="Introdu parola actuală"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Parola Nouă</label>
                    <input
                      type="password"
                      placeholder="Introdu parola nouă"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Confirmă Parola Nouă</label>
                    <input
                      type="password"
                      placeholder="Confirmă parola nouă"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {error && (
                    <motion.p
                      className="text-red-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handlePasswordChange}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
                    >
                      Actualizează Parola
                    </Button>
                    <Button
                      onClick={() => setShowChangePassword(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
                    >
                      Anulează
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'extra' && (
          <motion.div
            className="bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
            variants={containerVariants}
          >
            <h3 className="text-2xl font-bold mb-4">Extra</h3>
            {user.role === 'author' ? (
              <div>
                <p className="text-gray-400 mb-4">Accesează pagina ta de autor:</p>
                <Link
                  to={`/authors/${user.authorId}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Pagina de Autor
                </Link>
              </div>
            ) : (
              <div>
                <Button
                  onClick={handleAuthorRequest}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full md:w-auto"
                >
                  Trimite cerere de autor
                </Button>
                {notification && (
                  <motion.p
                    className="text-yellow-500 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {notification}
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;