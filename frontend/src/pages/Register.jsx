import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register, login } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/shared/Button';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateInputs = () => {
    let isValid = true;

    if (!firstName) {
      setFirstNameError('Câmpul prenume este obligatoriu');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName) {
      setLastNameError('Câmpul nume este obligatoriu');
      isValid = false;
    } else {
      setLastNameError('');
    }

    if (!email) {
      setEmailError('Câmpul email este obligatoriu');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Introdu un email valid');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Câmpul parolă este obligatoriu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Parola trebuie să aibă cel puțin 6 caractere');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      await register(firstName, lastName, email, password);
      const loginData = await login(email, password);
      console.log("login data:", loginData);
      localStorage.setItem('token', loginData.token);

      setUser(loginData.user);

      navigate('/');
    } catch (error) {
      setError(error.message || 'Eroare la înregistrare');
    }
  };

  // Variante pentru animații
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-green-400">Înregistrare</h2>
        <p className="text-gray-400 mb-6 text-center">Creează-ți contul pentru a începe</p>
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
              type="text"
              placeholder="Prenume"
              className={`w-full p-3 bg-gray-700 border ${
                firstNameError ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white`}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setFirstNameError('');
              }}
            />
            {firstNameError && (
              <p className="text-red-500 text-sm mt-1">{firstNameError}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Nume"
              className={`w-full p-3 bg-gray-700 border ${
                lastNameError ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white`}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setLastNameError('');
              }}
            />
            {lastNameError && (
              <p className="text-red-500 text-sm mt-1">{lastNameError}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-3 bg-gray-700 border ${
                emailError ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white`}
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
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white`}
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
            animate={firstName && lastName && email && password ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <Button
              onClick={handleRegister}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold"
              aria-label="Creează Cont"
            >
              Creează Cont
            </Button>
          </motion.div>
          <p className="text-gray-400 text-center mt-4">
            Ai deja cont?{' '}
            <Link to="/login" className="text-green-400 hover:underline">
              Conectează-te
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;