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

        <div className="glass-panel p-8 md:p-12 rounded-3xl text-white/70 space-y-8 leading-relaxed mb-10">
          <p className="text-lg">Last updated: June 2025</p>
          
          {type === 'privacy' ? (
            <>
              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">1. Introduction</h2>
                <p>
                  Welcome to UniHub. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our platform and tell you about your privacy rights and how the law protects you.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">2. Information We Collect</h2>
                <p>
                  We may collect, use, store and transfer different kinds of personal data about you. This includes: Account information (name, email format), listing browsing history, contact form inputs, and technical data about your device and browser.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">3. How We Use Your Information</h2>
                <p>
                  We use your personal data to match you with appropriate housing listings, send booking confirmations and updates, improve our platform's functionality, and maintain a safe environment for all users.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">4. Sharing Your Information</h2>
                <p>
                  Your information is only shared with landlords when you explicitly inquire about a property. We do not sell, rent, or trade your personal information to third parties for commercial purposes.
                </p>
              </section>
              
              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">5. Cookies</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our platform and hold certain information. These are strictly used for session management and basic analytics to improve user experience.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">6. Data Retention</h2>
                <p>
                  We retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. Data is kept while your account is active and deleted within 30 days of account closure.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">7. Your Rights</h2>
                <p>
                  Under certain circumstances, you have rights under data protection laws in relation to your personal data. This includes the right to request access, correction, or deletion of your personal data. Contact us at hello@unihub.test to exercise these rights.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">8. Children's Privacy</h2>
                <p>
                  Our platform is intended for users who are 18 years of age or older. We do not knowingly collect personally identifiable information from anyone under the age of 18.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">9. Changes to This Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify registered users of any material changes via email prior to the change becoming effective.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">10. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at: hello@unihub.test
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the UniHub platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">2. Description of Service</h2>
                <p>
                  UniHub is an online listing platform designed to connect people with housing providers in Kenya. We act as a marketplace; we do not own, manage, or control the properties listed on the platform and we are not a landlord.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">3. User Accounts</h2>
                <p>
                  To use certain features of the platform, you must register for an account. You must be at least 18 years old. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">4. Listings & Bookings</h2>
                <p>
                  Landlords are solely responsible for the accuracy, legality, and safety of their property listings. While UniHub strives to verify listings, we do not guarantee the availability, quality, or condition of any housing option. Renters are encouraged to perform their own due diligence.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">5. Prohibited Conduct</h2>
                <p>
                  Users agree not to: post fake, misleading, or discriminatory listings; engage in harassing or abusive behavior; commit fraud; or scrape/extract data from the platform for commercial purposes without explicit permission.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">6. Payments</h2>
                <p>
                  Any financial transactions, including rent payments or deposits, are strictly between the tenant and the landlord. UniHub is not a party to these transactions and is not liable for any payment disputes or lost funds.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">7. Intellectual Property</h2>
                <p>
                  The platform, including its original content, features, functionality, and design elements, is strictly owned by UniHub and is protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">8. Disclaimers</h2>
                <p>
                  The platform is provided on an "as is" and "as available" basis. UniHub expressly disclaims any warranties of merchantability or fitness for a particular purpose. We do not guarantee housing quality.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">9. Limitation of Liability</h2>
                <p>
                  In no event shall UniHub be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of the service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">10. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of the Republic of Kenya, without regard to its conflict of law provisions.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-display font-medium text-white">11. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at: hello@unihub.test
                </p>
              </section>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
