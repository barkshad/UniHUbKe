import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-8xl md:text-9xl font-display font-medium text-white/10 mb-4">404</h1>
        <h2 className="text-2xl md:text-4xl font-display font-medium mb-6">Page Not Found</h2>
        <p className="text-white/50 max-w-md mx-auto mb-10 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/"
          className="bg-white text-black px-8 py-4 rounded-full font-medium inline-flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};
