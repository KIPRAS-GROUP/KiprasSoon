"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";
import ContactModal from "./Modal";
const Card: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Ana Kart: Kipras Group */}
      <div className="bg-gray-800 text-white p-8 rounded-xl shadow-2xl transition-all transform hover:scale-105 hover:shadow-3xl flex flex-col md:flex-row space-y-6 md:space-y-0">
        {/* Sol Alan: Resim */}
        <div className="flex-none w-full md:w-1/3 mb-4 md:mb-0">
          <Image
            src="/kipras.jpeg"
            width={700}
            height={700}
            alt="Kipras Group"
            className="w-full h-full rounded-lg object-cover shadow-lg"
          />
        </div>

        {/* Sağ Alan: Başlık, Metin ve Buton */}
        <div className="flex-1 pl-4">
          <h2 className="text-4xl font-bold mb-4">Kipras Group</h2>
          <p className="text-lg text-gray-300 mb-4">
            Tecrübemiz ve yenilikçi yaklaşımımızla, şehrin siluetini
            değiştirecek yeni projemizi sizlerle buluşturmak için gün sayıyoruz.
          </p>

          <button
            onClick={openModal}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            Bizimle Çalışmak İster Misiniz?
          </button>
        </div>
      </div>
      {/* Çizgi ile Ayırma */}
      <div className="border-t-2 border-gray-600 my-8"></div>

      <div className="bg-gray-800 text-white p-8 rounded-xl shadow-2xl transition-all transform hover:scale-105 hover:shadow-3xl mt-[-80px] relative">
        <h3 className="text-3xl font-bold mb-4">İletişim</h3>
        <p className="text-lg text-gray-300 mb-4">
          Bilgi ve iletişim için:{" "}
          <a
            href="mailto:info@kipras.com.tr"
            className="hover:text-blue-500 transition underline"
          >
            info@kipras.com.tr
          </a>
        </p>

        <div className="space-y-4">
          {/* Sosyal Medya Kartı */}
          <div className="flex space-x-6">
            {/* Instagram Icon */}
            <a
              href="https://www.instagram.com/kiprasgroup/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-300 hover:text-blue-500 transition"
            >
              <FaInstagram />
            </a>

            {/* LinkedIn Icon */}
            <a
              href="https://www.linkedin.com/company/kipras/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-gray-300 hover:text-blue-700 transition"
            >
              <FaLinkedin />
            </a>

            <a
              href="mailto:info@kipras.com.tr"
              className="text-3xl text-gray-300 hover:text-blue-500 transition"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>
      {/* Modal: */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 p-8 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()} // Modal dışına tıklanırsa kapanmasın
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Bize ulaşın
              <button
                onClick={closeModal}
                className="ml-[60%] text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                X
              </button>
            </h2>
            <ContactModal />
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
