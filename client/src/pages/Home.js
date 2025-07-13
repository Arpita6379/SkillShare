import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Find Skills',
      description: 'Search for people with the skills you need and discover new opportunities to learn.'
    },
    {
      icon: MessageSquare,
      title: 'Connect & Swap',
      description: 'Send swap requests, schedule sessions, and exchange knowledge with others.'
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'Leave feedback and ratings after each swap to build trust in the community.'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All profiles are verified and the platform is moderated for your safety.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '1,000+' },
    { label: 'Skills Exchanged', value: '5,000+' },
    { label: 'Successful Swaps', value: '3,000+' },
    { label: 'Average Rating', value: '4.8★' }
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Skill Swap</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-50 to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Exchange Skills</span>
                  <span className="block text-primary-600">Learn Together</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Connect with people who have the skills you want to learn, and share your expertise in return. 
                  Build meaningful relationships while expanding your knowledge.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {!isAuthenticated ? (
                    <>
                      <div className="rounded-md shadow">
                        <Link
                          to="/register"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                        >
                          Get Started
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Link
                          to="/search"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                        >
                          Browse Skills
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md shadow">
                      <Link
                        to="/dashboard"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-primary-400 to-blue-500 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Globe className="mx-auto h-24 w-24 mb-4" />
              <h3 className="text-2xl font-bold">Global Community</h3>
              <p className="mt-2">Connect with learners worldwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to start swapping skills
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform makes it easy to find, connect, and exchange skills with people around the world.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">How it Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mx-auto">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Create Your Profile</h3>
                <p className="mt-2 text-base text-gray-500">
                  List the skills you can teach and the skills you want to learn.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mx-auto">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Find & Connect</h3>
                <p className="mt-2 text-base text-gray-500">
                  Search for people with the skills you need and send swap requests.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mx-auto">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Learn & Share</h3>
                <p className="mt-2 text-base text-gray-500">
                  Meet up, exchange knowledge, and leave feedback for each other.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start swapping skills?</span>
            <span className="block">Join our community today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Connect with thousands of learners and start your skill exchange journey.
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 sm:w-auto"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white">Skill Swap</h3>
            <p className="mt-2 text-gray-400">
              Connecting people through knowledge exchange
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <Link to="/search" className="text-gray-400 hover:text-gray-300">
                Browse Skills
              </Link>
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="text-gray-400 hover:text-gray-300">
                    Sign In
                  </Link>
                  <Link to="/register" className="text-gray-400 hover:text-gray-300">
                    Register
                  </Link>
                </>
              )}
            </div>
            <p className="mt-8 text-gray-400 text-sm">
              © 2024 Skill Swap Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 