import React, { useState } from 'react';

export default function FAQItem({ question, answer, hoverColorClass = "hover:text-blue-600" }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="p-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex justify-between items-center w-full text-left font-medium text-gray-900 ${hoverColorClass} transition-colors`}
            >
                {question}
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {answer}
                </p>
            )}
        </div>
    );
}
