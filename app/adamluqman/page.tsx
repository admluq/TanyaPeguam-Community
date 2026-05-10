import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DigitalCardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Digital Lawyer Card</h1>
          <p className="text-gray-300 text-lg">
            Professional digital profile for Malaysian lawyers
          </p>
        </div>

        {/* Digital Card Display */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="flex items-center gap-6 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
              <span className="text-3xl">AW</span>
            </div>

            {/* Lawyer Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Arif Wan Azmi</h2>
              <p className="text-gray-300 mb-1">Peguam Kanan</p>
              <p className="text-gray-400 text-sm">Arif Azmi & Co</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-gray-400 text-sm">
              <p className="font-semibold text-white mb-1">📞 Phone</p>
              <p className="text-gray-300">+60 1234 5678</p>
            </div>
            <div className="text-gray-400 text-sm">
              <p className="font-semibold text-white mb-1">📧 Email</p>
              <p className="text-gray-300">contact@arifazmi.com</p>
            </div>
            <div className="text-gray-400 text-sm">
              <p className="font-semibold text-white mb-1">📍 Location</p>
              <p className="text-gray-300">Kuala Lumpur, Malaysia</p>
            </div>
          </div>

          {/* Practice Areas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Practice Areas</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">Korporat</span>
              <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">Sivil</span>
              <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">Jenayah</span>
              <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">Syariah</span>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-green-400 text-sm">Available</span>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">About</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Experienced corporate lawyer specializing in corporate law and commercial litigation. 
              Committed to providing exceptional legal services to clients across Malaysia with 
              focus on integrity, professionalism, and successful outcomes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
              Contact Lawyer
            </button>
            <button className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition">
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
