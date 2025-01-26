"use client";
import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

// Modal için props tipini tanımlayalım
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Özel hata tipi tanımlayalım
interface FormError {
  message: string;
}

export default function Modal({ isOpen, onClose }: ModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal görünürlük kontrolü ekleyelim
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const reCaptchaToken = recaptchaRef.current?.getValue();
      if (!reCaptchaToken) {
        setError("Lütfen reCAPTCHA doğrulamasını tamamlayın");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData(e.currentTarget);
      const file = formData.get("cv") as File;

      // Dosya türü kontrolü
      const fileType = file.name.split(".").pop()?.toLowerCase() || "";
      const allowedTypes = ["pdf", "doc", "docx", "txt"];

      if (!allowedTypes.includes(fileType)) {
        setError("Lütfen sadece PDF, DOC, DOCX veya TXT dosyası yükleyin");
        setIsSubmitting(false);
        return;
      }

      // Dosyayı base64'e çevir
      const base64File = await convertToBase64(file);

      const data = {
        name: formData.get("name"),
        surname: formData.get("surname"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        position: formData.get("position"),
        message: formData.get("message"),
        cv: base64File,
        fileType: fileType,
        reCaptchaToken: reCaptchaToken
      };

      const response = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Bir hata oluştu");
      }

      // Form başarıyla gönderildi
      formRef.current?.reset(); // Formu sıfırla
      recaptchaRef.current?.reset(); // reCAPTCHA'yı sıfırla
      onClose(); // Modal'ı kapat
    } catch (err) {
      const error = err as FormError;
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Base64'e çevirme fonksiyonu
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    // Modal arka planı ekleyelim
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-y-auto max-h-[80vh]">
        {/* Kapatma butonu ekleyelim */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">Kapat</span>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mevcut form içeriği */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Ad ve Soyad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white"
              >
                Ad
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="surname"
                className="block text-sm font-medium text-white"
              >
                Soyad
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                required
                className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Telefon */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-white"
            >
              Telefon
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* E-posta */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Pozisyon */}
          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-white"
            >
              Pozisyon
            </label>
            <select
              id="position"
              name="position"
              required
              className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Seçiniz</option>
              <option value="Developer">Developer</option>
              <option value="Tasarımcı">Tasarımcı</option>
              <option value="Reklam">Reklam</option>
              <option value="Kişisel Asistan">Kişisel Asistan</option>
              <option value="Broker">Broker</option>
              <option value="Mimar">Mimar</option>
              <option value="İç Mimar">İç Mimar</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          {/* Mesaj */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-white"
            >
              Mesaj
            </label>
            <textarea
              id="message"
              name="message"
              required
              className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
            />
          </div>

          {/* CV */}
          <div>
            <label
              htmlFor="cv"
              className="block text-sm font-medium text-white"
            >
              CV Yükle
            </label>
            <input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              required
              className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
            size="normal"
            theme="dark"
          />

          {error && <div className="text-red-500">{error}</div>}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg transition ${
                isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
