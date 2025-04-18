import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaInstagram, FaTwitter } from 'react-icons/fa'; // Folosim react-icons pentru pictograme

const Contact = () => {
  // Variante pentru animații
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: i * 0.2 },
    }),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-gray-900">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-white mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Contact
      </motion.h2>
      <motion.p
        className="text-gray-400 mb-8 text-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Conectează-te cu noi prin email sau pe rețelele sociale!
      </motion.p>

      <motion.div
        className="bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col space-y-6">
          <motion.div
            className="flex items-center space-x-4"
            variants={itemVariants}
            custom={0}
          >
            <FaEnvelope className="text-blue-400 text-2xl" />
            <div>
              <span className="text-white font-semibold">Email: </span>
              <motion.a
                href="mailto:tanase.doru21@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                tanase.doru21@gmail.com
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center space-x-4"
            variants={itemVariants}
            custom={1}
          >
            <FaInstagram className="text-blue-400 text-2xl" />
            <div>
              <span className="text-white font-semibold">Instagram: </span>
              <motion.a
                href="https://www.instagram.com/doru.tns"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                @doru.tns
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center space-x-4"
            variants={itemVariants}
            custom={2}
          >
            <FaTwitter className="text-blue-400 text-2xl" />
            <div>
              <span className="text-white font-semibold">X.com: </span>
              <motion.a
                href="https://x.com/OrdinaryOwl0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                @OrdinaryOwl0
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;