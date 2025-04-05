import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateProfileName, updateProfilePassword, uploadProfilePicture } from '../utils/api';
import Button from '../components/shared/Button';
import blankProfile from '../assets/blankProfile.png';

const Profile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: '',
    role: '',
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const data = await fetchUserProfile(token);
        setUser(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const data = await uploadProfilePicture(file, token);
      setUser({ ...user, profilePicture: `data:image/png;base64,${data.profilePicture}` });

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
        await fetch(`http://localhost:3000/api/authors/${user._id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: `${user.firstName} ${user.lastName}` }),
        });
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

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="w-1/4 p-6 border-r border-gray-700">
        <div className="flex flex-col items-center">
          <img
            src={user.profilePicture ? `data:image/png;base64,${user.profilePicture}` : blankProfile}
            alt="Profile"
            className="w-32 h-32 rounded-full shadow-lg mb-4"
          />
          <h2 className="text-2xl font-semibold">
            {user.firstName} {user.lastName}
          </h2>
        </div>
      </div>

      <div className="w-3/4 p-6">
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Profile
          </Button>
          <Button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Account Security
          </Button>
          <Button
            onClick={() => setActiveTab('extra')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'extra' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Extra
          </Button>
        </div>

        {activeTab === 'profile' && (
          <div>
            <h3 className="text-2xl font-bold mb-4">Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-300">First Name</label>
                <input
                  type="text"
                  value={user.firstName}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-300">Last Name</label>
                <input
                  type="text"
                  value={user.lastName}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-300">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600"
                />
              </div>
              <Button
                onClick={handleNameUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Apply Changes
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 className="text-2xl font-bold mb-4">Account Security</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-300">Email</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600"
                />
              </div>
              {!showChangePassword ? (
                <Button
                  onClick={() => setShowChangePassword(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-gray-300">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {error && <p className="text-red-500">{error}</p>}
                  <Button
                    onClick={handlePasswordChange}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Update Password
                  </Button>
                  <Button
                    onClick={() => setShowChangePassword(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'extra' && (
          <div>
            <h3 className="text-2xl font-bold mb-4">Extra</h3>
            <p className="text-gray-400">This section is empty for now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;