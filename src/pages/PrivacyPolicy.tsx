import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center space-x-3 mb-8 border-b border-slate-800 pb-6">
        <Shield size={32} className="text-purple-500" />
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      </div>

      <div className="space-y-6 text-slate-300">
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
          <p>
            Welcome to <strong>Aesthetic Gaming Setups</strong> ("we," "our," or "us"). We are committed to protecting your privacy. 
            This Privacy Policy explains how our content management application handles your data when you use our services 
            to manage your Pinterest content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Data Collection and Usage</h2>
          <p className="mb-2">
            <strong>Personal Data:</strong> We do not store your personal data, passwords, or Pinterest credentials on our servers. 
            All Pinterest Access Tokens are stored locally on your device (in LocalStorage) or transmitted securely via our proxy solely for the purpose of communicating directly with the Pinterest API.
          </p>
          <p>
            <strong>Content Generation:</strong> The text and descriptions you input are processed by AI models (Google Gemini) to generate creative content. 
            We do not retain this data after the session ends.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Pinterest Data</h2>
          <p>
            Our application connects to Pinterest on your behalf to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Read your public boards to suggest where to pin content.</li>
            <li>Create new Pins (upload images and text) upon your explicit request.</li>
          </ul>
          <p className="mt-2">
            We adhere to the <a href="https://developers.pinterest.com/terms/" className="text-purple-400 hover:underline" target="_blank" rel="noreferrer">Pinterest Developer Terms</a> and do not use your Pinterest data for tracking or advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
          <p>
            We use the following third-party services:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Google Gemini API:</strong> For generating image and text content.</li>
            <li><strong>Pinterest API:</strong> For publishing content to your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: <br/>
            <span className="text-slate-400">admin@gamingsetupaesthetic.blogspot.com</span>
          </p>
        </section>

        <div className="pt-8 text-sm text-slate-500 border-t border-slate-800">
          Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;