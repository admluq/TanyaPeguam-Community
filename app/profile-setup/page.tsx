import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Save, User, MapPin, Globe, MessageCircle, Shield, Check } from 'lucide-react';

export default async function ProfileSetupPage() {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Lawyer Profile</h1>
          <p className="text-gray-300 text-lg">
            Set up your professional profile and Donna AI configuration
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
              <User size={40} />
            </div>
          </div>

          <form className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="How clients will see your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="arif-wan-azmir"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Firm Name</label>
              <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Arif Azmi & Co"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                  type="tel"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="+60 1234 5678"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                  type="email"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@arifazmi.com"
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="AWAY">Away</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief professional biography..."
                />
              </div>
            </div>

            {/* Practice Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Practice Areas</label>
              <div className="space-y-2">
                {['Korporat & Sivil', 'Jenayah', 'Syariah'].map((area) => (
                  <label key={area} className="flex items-center gap-2 text-gray-300">
                    <input type="checkbox" className="rounded border-slate-600" />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div>
              <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-600 cursor-pointer hover:border-blue-500 transition-colors">
                <input type="checkbox" className="rounded border-slate-600" />
                <div>
                  <Shield size={16} className="text-green-400" />
                  <span className="text-sm text-gray-300">
                    I verify that I have a valid Sijil Annual Practicing Certificate
                  </span>
                </div>
              </label>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Social Links</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-gray-300 text-sm">LinkedIn</label>
                  <input
                    type="url"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/arif-wan-azmir"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-300 text-sm">Website</label>
                  <input
                    type="url"
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://arifazmi.com"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <input
                  type="text"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Kuala Lumpur, Malaysia"
                />
              </div>
            </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Social Links</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-gray-300 text-sm">LinkedIn</label>
                <input
                  type="url"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/arif-wan-azmir"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-300 text-sm">Website</label>
                <input
                  type="url"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://arifazmi.com"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <input
                type="text"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            </div>
          </label>
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Social Links</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">LinkedIn</label>
              <input
                type="url"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/arif-wan-azmir"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">Website</label>
              <input
                type="url"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="https://arifazmi.com"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            <input
              type="text"
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Kuala Lumpur, Malaysia"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Save Profile
          </button>
          <Link href="/dashboard">
            <button
              type="button"
              className="px-6 py-3 border border-gray-500 hover:border-gray-300 text-gray-300 font-semibold rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  </div>
);
}
