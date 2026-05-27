import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, FileText } from 'lucide-react';

export const LegalPage = ({ type }: { type: 'privacy' | 'terms' }) => {
  return (
    <div className="container mx-auto px-6 py-24 max-w-4xl min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            {type === 'privacy' ? <ShieldCheck className="w-8 h-8 text-white" /> : <FileText className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-medium">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl text-white/70 space-y-8 leading-relaxed">
          <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-medium text-white">1. Introduction</h2>
            <p>
              Welcome to UniHub. {type === 'privacy' 
                ? 'We respect your privacy and are committed to protecting your personal data.' 
                : 'These terms outline the rules and regulations for the use of our platform.'}
              By accessing moving forward, you agree to these terms completely.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-medium text-white">
              {type === 'privacy' ? '2. Data Collection' : '2. User Obligations'}
            </h2>
            <p>
              {type === 'privacy' 
                ? 'We only collect information necessary to provide our student housing connection services effectively. This may include your name, contact information, and basic interaction data.' 
                : 'Users must provide accurate information when registering or listing properties. Fraudulent behavior will result in immediate account termination.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-medium text-white">3. Platform Usage</h2>
            <p>
              UniHub acts as a marketplace to connect students with landlords. We aim to verify listings but strongly advise students to inspect properties before making monetary commitments.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};
