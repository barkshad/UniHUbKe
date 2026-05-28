import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone } from 'lucide-react';

export const AppDownloadPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Update UI notify the user they can install the PWA
      if (!sessionStorage.getItem('app-download-dismissed')) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Fallback: Show a generic prompt anyway for iOS/browsers that don't fire the event
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('app-download-dismissed')) {
        setIsVisible(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('app-download-dismissed', 'true');
  };

  const handleDownload = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
    } else {
      // Mock action / fallback instructions for iOS where beforeinstallprompt isn't supported
      alert('To install the app on iOS: tap the Share button and select "Add to Home Screen". On Android: tap the browser menu and select "Install App".');
    }
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[22rem] z-50"
        >
          <div className="bg-surface-800/95 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex items-start gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-[1rem] flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 relative top-0.5">
              <h3 className="text-white font-medium mb-1 drop-shadow-sm text-base">Install UniHub</h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Add to your home screen for faster browsing and a better experience.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-white text-black text-sm font-bold py-2.5 px-4 rounded-xl hover:bg-white/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <Download className="w-4 h-4" />
                  Get App
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  Later
                </button>
              </div>
            </div>

            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
