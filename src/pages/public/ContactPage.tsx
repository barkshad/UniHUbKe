import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="flex-1 py-24 md:py-32">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">Get In Touch</h1>
          <p className="text-lg text-white/60">
            Have a question, feedback, or need help with a listing? We're here to help. Fill out the form below and our team will get back to you within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden">
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-10 bg-surface-800/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-display font-medium text-white mb-2">Message Sent!</h3>
                    <p className="text-white/60 mb-6">Thanks! We'll get back to you within 24 hours.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Email Email</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                  >
                    <option>General Inquiry</option>
                    <option>Report a Listing</option>
                    <option>Partnership</option>
                    <option>Technical Issue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Message</label>
                  <textarea 
                    required 
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors resize-none" 
                    placeholder="How can we help you?" 
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-medium py-4 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-display font-medium text-white">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center text-white/50 shrink-0 border border-white/5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/50 mb-1">Email Us</div>
                    <a href="mailto:hello@unihub.test" className="text-white hover:text-brand-400 transition-colors">hello@unihub.test</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center text-white/50 shrink-0 border border-white/5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/50 mb-1">Office Hours</div>
                    <div className="text-white">Mon–Fri, 8:00 AM – 6:00 PM EAT</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <h3 className="text-2xl font-display font-medium text-white mb-6">Follow Us</h3>
              <div className="flex gap-4">
                {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <a key={social} href="#" className="px-5 py-3 rounded-xl bg-surface-800 text-sm font-medium text-white/70 hover:text-white hover:bg-surface-700 transition-colors border border-white/5">
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full aspect-video md:aspect-[4/3] bg-surface-800 rounded-3xl border border-white/5 mt-8 overflow-hidden relative flex flex-col items-center justify-center group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center grayscale mix-blend-overlay group-hover:opacity-10 transition-opacity duration-1000"></div>
              <MapPin className="w-8 h-8 text-brand-500 mb-2 relative z-10 animate-bounce" />
              <div className="text-white/60 font-medium relative z-10">Nairobi, Kenya 📍</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
