// src/pages/Login.jsx
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api';
import { AuthContext } from "../context/AuthContext";
import Button from '../components/shared/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
  
      // Setează toate datele utilizatorului în context
      setUser(data.user);
  
      alert(`Bine ai venit, ${data.user.firstName}!`);
      navigate("/");
    } catch (error) {
      setError(error.message || "Email sau parolă incorectă");
    }
  };

  const handleSendResetEmail = () => {
    alert(`Mail trimis (Neimplementat) la ${resetEmail}`);
    setForgotPassword(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Autentificare</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Parola"
          className="w-full p-3 mb-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p
          className="text-blue-400 text-sm cursor-pointer hover:underline text-right mb-4"
          onClick={() => setForgotPassword(true)}
        >
          Am uitat parola?
        </p>
        <Button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold"
        >
          Login
        </Button>
        <Button
          onClick={() => navigate('/register')}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold mt-4"
        >
          Creează cont
        </Button>
      </div>

      {forgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-xl font-bold mb-4">Resetare Parolă</h3>
            <p className="text-gray-400 mb-4">Introduceți email-ul pentru a primi un link de resetare.</p>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Button
              onClick={handleSendResetEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              Trimite email
            </Button>
            <Button
              onClick={() => setForgotPassword(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg mt-2"
            >
              Anulează
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;