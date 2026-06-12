import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function DisruptionPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="font-semibold text-gray-900">Störungsdetails</div>
                </div>
            </div>
            <div className="max-w-md mx-auto p-4">
                <h1 className="text-xl font-bold mb-4">Störung #{id}</h1>
                <p className="text-gray-600">Details zu dieser Störung werden hier angezeigt.</p>
            </div>
        </div>
    );
}
