// components/Modal.js
import React from 'react';

export default function Modal({ show, onClose, onStartSurvey }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-1/2 max-w-2xl text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Dashboard!</h2>
        <p className="text-gray-700 mb-6">
          Ready to take your first survey? Get ranked and see how you compare!
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onStartSurvey}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Start Survey
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
