import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/shared/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  if (user) {
    navigate('/');
    return null;
  }

  const validateInputs = () => {
    let isValid = true;
    if (!email) {
      setEmailError('Câmpul email este obligatoriu');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Introdu un email valid');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Câmpul parolă este obligatoriu');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      navigate('/');
    } catch (error) {
      // Verificăm mesajul specific pentru cont dezactivat
      if (error.message === 'Account deactivated') {
        setError('Contul este dezactivat. Ne pare rau.');
      } else {
        setError(error.message || 'Email sau parolă incorectă');
      }
    }
  };


  // Variante pentru animații
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, type: 'spring', stiffness: 200 },
    },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <motion.div
        className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-center mb-6">
          <img src="/image.png" className="w-16 h-12" alt="BookReview Logo" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-blue-400">Autentificare</h2>
        <p className="text-gray-400 mb-6 text-center">Conectează-te pentru a continua</p>
        {error && (
          <motion.p
            className="text-red-500 text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
        <div className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-3 bg-gray-700 border ${
                emailError ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Parola"
              className={`w-full p-3 bg-gray-700 border ${
                passwordError ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
          <motion.div
            animate={email && password ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold"
              aria-label="Autentificare"
            >
              Autentificare
            </Button>
          </motion.div>
          <Button
            onClick={() => navigate('/register')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold"
            aria-label="Creează cont"
          >
            Creează cont
          </Button>
        </div>
      </motion.div>

      {forgotPassword && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-50 px-4"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-sm relative"
            variants={modalVariants}
          >
            <button
              onClick={() => setForgotPassword(false)}
              className="absolute top-2 right-2 text-white text-xl focus:outline-none"
              aria-label="Închide modalul"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 text-center text-white">Resetare Parolă</h3>
            <p className="text-gray-400 mb-4 text-center">
              Introdu email-ul pentru a primi un link de resetare.
            </p>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 mb-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Button
              onClick={handleSendResetEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              aria-label="Trimite email de resetare"
            >
              Trimite email
            </Button>
            <Button
              onClick={() => setForgotPassword(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg mt-2"
              aria-label="Anulează resetarea parolei"
            >
              Anulează
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;