"use client";
import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    position: "",
    message: "",
    cv: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString();
        if (base64) {
          setFormData((prevData) => ({
            ...prevData,
            cv: base64,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Form başarıyla gönderildi!");
      } else {
        alert("Bir hata oluştu.");
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-y-auto max-h-[80vh]">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.name}
              onChange={handleInputChange}
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
              value={formData.surname}
              onChange={handleInputChange}
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
            value={formData.phone}
            onChange={handleInputChange}
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
            value={formData.email}
            onChange={handleInputChange}
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
            value={formData.position}
            onChange={handleInputChange}
            className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seçiniz</option>
            <option value="developer">Geliştirici</option>
            <option value="designer">Tasarımcı</option>
            <option value="ceo">CEO</option>
            <option value="reklam">Reklam</option>
            <option value="broker">Broker</option>
            <option value="manager">Müdür</option>
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
            value={formData.message}
            onChange={handleInputChange}
            className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={4}
          />
        </div>

        {/* CV */}
        <div>
          <label htmlFor="cv" className="block text-sm font-medium text-white">
            CV Yükle
          </label>
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mt-1 p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

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
  );
};

export default ContactForm;
