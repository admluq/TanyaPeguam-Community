import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  // Redirect authenticated users to profile setup
  if (session?.user) {
    redirect('/profile');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">TP</span>
            </div>
            <span className="text-2xl font-bold text-white">TanyaPeguam</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Donna AI <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Lawyer Intake Portal
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Automate client intake, intelligent triage, and seamless multi-agent orchestration.
            <br />
            Built for Malaysian lawyers.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold text-white mb-2">AI Orchestration</h3>
              <p className="text-sm text-gray-400">Multi-agent triage & intake</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-white mb-2">Real-Time Routing</h3>
              <p className="text-sm text-gray-400">Smart client qualification</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-white mb-2">Analytics</h3>
              <p className="text-sm text-gray-400">Track intake metrics</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg">
                Sign In with Google
              </button>
            </Link>
            <Link href="/directory">
              <button className="w-full sm:w-auto px-8 py-4 border border-gray-500 hover:border-gray-300 text-white font-semibold rounded-lg transition">
                Browse Lawyers
              </button>
            </Link>
          </div>

          {/* Support Text */}
          <p className="text-gray-400 text-sm mt-8">
            For registered TanyaPeguam lawyers only
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-slate-800 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="text-4xl font-bold text-blue-400 w-12 h-12 rounded-lg bg-blue-900 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Create Your Profile</h3>
                <p className="text-gray-300">
                  Set up your lawyer profile, firm details, and practice areas. Your profile becomes your unique identifier in the system.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-4xl font-bold text-purple-400 w-12 h-12 rounded-lg bg-purple-900 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Configure Donna AI</h3>
                <p className="text-gray-300">
                  Set up Donna's personality, knowledge base, and triage rules. Control how the AI qualifies and routes client intakes.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-4xl font-bold text-green-400 w-12 h-12 rounded-lg bg-green-900 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Deploy & Monitor</h3>
                <p className="text-gray-300">
                  Deploy the intake widget to your Facebook Group or website. Monitor all inquiries, triage results, and client conversations in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-700 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2026 TanyaPeguam. Donna AI Platform. Built for Malaysian lawyers.</p>
        </div>
      </div>
    </div>
  );
}
