import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DirectoryPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Lawyers Directory</h1>
          <p className="text-gray-300 text-lg">
            Browse and connect with verified Malaysian lawyers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search lawyers by name, firm, or practice area..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
              Search
            </button>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">All</span>
            <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">Korporat</span>
            <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">Sivil</span>
            <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">Jenayah</span>
            <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">Syariah</span>
          </div>
        </div>

        {/* Lawyer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((lawyer: any) => (
            <div key={lawyer.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-all">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {lawyer.name?.split(' ').map((word: string, index: number) => (
                    <span key={index} className={index === 0 ? 'text-blue-200' : 'text-blue-100'}>
                      {word}
                    </span>
                  ))}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{lawyer.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">{lawyer.firm}</p>
                  <p className="text-gray-400 text-xs mb-4">
                    {lawyer.practiceAreas?.join(' • ')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition">
                    View Profile
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
