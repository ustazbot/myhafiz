'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Heart, BookOpen, Users, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FAQPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please log in to access the FAQ feature.
          </p>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Add document to Firestore
      const docRef = await addDoc(collection(db, 'contactMessages'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        userId: user.uid,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        status: 'new' // You can use this to track message status
      });
      
      console.log('Message sent successfully with ID:', docRef.id);
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#F6EFD2] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#E2DDB4]">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl p-3 sm:p-4">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2 sm:mb-3">
                    FAQ MyHafiz
                  </h1>
                  <p className="text-base sm:text-lg text-black">
                    {language === 'en' ? 'Frequently Asked Questions' : 'Soalan Lazim'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: How to Use / Cara Guna */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#E2DDB4]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                {language === 'en' ? 'How to Use' : 'Cara Guna'}
              </h2>
            </div>
            
            <div className="prose max-w-none">
              {language === 'en' ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>Brief guide:</strong>
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>When registering, choose your role (Hafiz, Teacher, or Parent).</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>If you are a Teacher or Parent: after logging in, go to "Dashboard" and enter your student's email to link their account.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>If you are a Student or Hafiz: go to "Notifications" and click "Accept" if there is a link request from a Teacher's email.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>For memorization tracking: when you have memorized a verse, click the icon (✓) and check "Progress" to see your total memorized verses.</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <strong>Panduan ringkas:</strong>
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Semasa mendaftar, pilih peranan anda (Hafiz, Guru, atau Ibubapa).</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Jika anda Guru atau Ibubapa: selepas log masuk, pergi ke "Dashboard" dan masukkan email pelajar untuk menghubungkan akaun mereka.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Jika anda Pelajar atau Hafiz: pergi ke "Notifikasi" dan klik "Terima" jika ada permintaan sambungan dari email Guru.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Untuk rekod hafazan: jika sudah menghafaz satu ayat, klik ikon (✓) dan semak di "Kemajuan" untuk jumlah ayat yang dihafaz.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: About Us / Tentang Kami */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#E2DDB4]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                {language === 'en' ? 'About Us' : 'Tentang Kami'}
              </h2>
            </div>
            
            <div className="prose max-w-none">
              {language === 'en' ? (
                <div className="space-y-4 text-gray-700">
                  <p>
                    MyHafiz was developed by Syahnas (@ustazbot) to assist Hafiz, teachers, and parents in tracking Quran memorization.
                  </p>
                  <p>
                    Quran text and data are sourced from official APIs and authentic resources: Quran.com, Tanzil.net, and Qul.Tarteel.ai. All verses retain the Uthmani script and the arrangement according to the standard mushaf.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-gray-700">
                  <p>
                    MyHafiz dibangunkan oleh Syahnas (@ustazbot) untuk membantu Hafiz, guru, dan ibubapa dalam menjejaki hafazan al-Quran.
                  </p>
                  <p>
                    Teks al-Quran diperoleh daripada API rasmi dan sumber sahih: Quran.com, Tanzil.net, dan Qul.Tarteel.ai. Semua ayat mengekalkan rasm Uthmani dan susunan mengikut mushaf standard.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Support MyHafiz / Infaq MyHafiz */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#E2DDB4]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                {language === 'en' ? 'Support MyHafiz' : 'Infaq MyHafiz'}
              </h2>
            </div>
            
            <div className="space-y-6">
              {/* Support Text */}
              <div className="prose max-w-none">
                {language === 'en' ? (
                  <div className="space-y-4 text-gray-700">
                    <p>
                      MyHafiz is completely free to use. Your donations help us cover server costs, maintain the platform, and continue improving its features.
                    </p>
                    <p>
                      Please consider supporting us through one of the links below:
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 text-gray-700">
                    <p>
                      MyHafiz adalah percuma untuk digunakan. Sumbangan anda membantu kami menampung kos pelayan, menyelenggara platform, dan menambah baik fungsi-fungsi baharu.
                    </p>
                    <p>
                      Sila pertimbangkan untuk menyokong kami melalui pautan berikut:
                    </p>
                  </div>
                )}
              </div>

              {/* Donation Buttons */}
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="https://toyyibpay.com/MyHafiz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>💚</span>
                  <span>{language === 'en' ? 'Donate via ToyyibPay' : 'Infaq melalui ToyyibPay'}</span>
                </a>
                
                <a
                  href="https://donate.stripe.com/dRm8wRalV1dcch68e44ow01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>💳</span>
                  <span>{language === 'en' ? 'Donate via Stripe' : 'Infaq melalui Stripe'}</span>
                </a>
              </div>

              {/* Contact Form */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-black mb-4">
                  {language === 'en' ? 'Send us your questions or suggestions:' : 'Hantarkan soalan atau cadangan anda:'}
                </h3>
                
                {isSubmitted && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        {language === 'en' ? 'Message has been sent successfully!' : 'Mesej telah dihantar dengan jayanya!'}
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'en' ? 'Name' : 'Nama'}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={language === 'en' ? 'Enter your name' : 'Masukkan nama anda'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'en' ? 'Email' : 'Emel'}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={language === 'en' ? 'Enter your email' : 'Masukkan emel anda'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'en' ? 'Message' : 'Mesej'}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      placeholder={language === 'en' ? 'Enter your message or question' : 'Masukkan mesej atau soalan anda'}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{language === 'en' ? 'Sending...' : 'Menghantar...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{language === 'en' ? 'Send Message' : 'Hantar Mesej'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
