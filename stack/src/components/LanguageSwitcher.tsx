import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../lib/axiosinstance"; // Check this path matches your structure
import { useAuth } from "../lib/AuthContext";     // Check this path matches your structure
import { toast } from "react-toastify";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  
  const [targetLang, setTargetLang] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français (French)" },
    { code: "es", name: "Español (Spanish)" },
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "pt", name: "Português (Portuguese)" },
    { code: "zh", name: "中文 (Chinese)" },
  ];

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    if (lang === i18n.language) return;

    // If not logged in, allow switch without OTP
    if (!user) {
        i18n.changeLanguage(lang);
        return;
    }

    setTargetLang(lang);
    setLoading(true);

    try {
        // --- RULE IMPLEMENTATION ---
        if (lang === 'fr') {
            // French -> Verify Email
            await axiosInstance.post('/user/otp/generate', { 
                channel: 'email', 
                contact: user.email 
            });
            toast.info(`OTP sent to your email (${user.email})`);
        } else {
            // Others -> Verify Mobile (Mocking mobile number)
            const mobile = "9999999999"; 
            await axiosInstance.post('/user/otp/generate', { 
                channel: 'mobile', 
                contact: mobile 
            });
            toast.info(`OTP sent to mobile (${mobile})`);
        }
        setShowOtpInput(true);
    } catch (error) {
        console.error(error);
        toast.error("Failed to send verification");
    } finally {
        setLoading(false);
    }
  };

  const verifyAndSwitch = async () => {
    try {
        const contact = targetLang === 'fr' ? user.email : "9999999999";

        await axiosInstance.post('/user/otp/verify', { contact, otp });
        
        // Success! Switch Language
        i18n.changeLanguage(targetLang);
        toast.success("Language changed successfully!");
        setShowOtpInput(false);
        setOtp("");
    } catch (error) {
        toast.error("Invalid OTP");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!showOtpInput ? (
        <select 
          onChange={handleLanguageChange} 
          value={i18n.language}
          className="bg-transparent text-sm border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      ) : (
        <div className="flex items-center gap-2 animate-pulse bg-white p-1 rounded border border-orange-200">
            <input 
                type="text" 
                placeholder="OTP" 
                className="w-16 text-xs border rounded px-1 py-1 outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
            />
            <button 
                onClick={verifyAndSwitch}
                className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
            >
                ✓
            </button>
            <button 
                onClick={() => setShowOtpInput(false)}
                className="text-gray-400 text-xs px-1 hover:text-red-500"
            >
                ✕
            </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;