import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Users, Clock, Star, MessageSquare } from 'lucide-react';

const LearnMore: React.FC = () => {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <nav className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary">
            TicVision
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/login" className="btn-secondary text-sm sm:text-base px-3 sm:px-6 py-2 sm:py-3">
              Sign In
            </Link>
            <Link to="/register" className="btn-secondary text-sm sm:text-base px-3 sm:px-6 py-2 sm:py-3">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
        {/* Overview Section */}
        <section className="py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="mb-6 text-3xl sm:text-4xl font-bold">
              About <span className="text-primary">TicVision</span>
            </h2>
            <p className="text-base sm:text-lg text-text-secondary lg:text-xl">
              TicVision is a comprehensive app designed to empower individuals with Tourette's syndrome by offering tools to understand, track, and manage their tics effectively. Our mission is to provide a supportive platform that enhances the quality of life for our users through insightful data visualization and personalized management strategies.
            </p>
          </motion.div>
        </section>

        {/* Key Features Section */}
        <section className="py-12 sm:py-20 bg-gray-50">
          <motion.div
            className="mx-auto max-w-5xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-6 text-3xl sm:text-4xl font-bold">
              Key <span className="text-primary">Features</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto px-4">
              <motion.div
                className="card group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Tic Tracking</h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Log and visualize your tics using trends and comparative analysis.
                </p>
              </motion.div>

              <motion.div
                className="card group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Understand Patterns</h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Visualize your data through beautiful, insightful charts to recognize patterns and triggers.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Upcoming Features Section */}
        <section className="py-12 sm:py-20">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-6 text-3xl sm:text-4xl font-bold">
              Coming <span className="text-primary">Soon</span>
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <motion.div
                className="card group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Personalized AI Guidance</h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Tailored recommendations, relaxation exercises, and predictive alerts to help you manage your tics more effectively.
                </p>
              </motion.div>

              <motion.div
                className="card group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Real-Time Alerts</h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Receive timely notifications to help manage and respond to tic episodes effectively.
                </p>
              </motion.div>

              <motion.div
                className="card group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Personalized Insights</h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Gain customized recommendations and strategies tailored to your unique tic patterns.
                </p>
              </motion.div>

              <motion.div
                className="card group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Community Support</h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Connect with a community of individuals who understand your journey and share valuable insights.
                </p>
              </motion.div>

              <motion.div
                className="card group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Feedback & Support</h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Access professional support and provide feedback to help us improve your experience.
                </p>
              </motion.div>

              <motion.div
                className="card group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Advanced Analytics</h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Enhanced data analysis tools to provide deeper insights into your tic patterns and triggers.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-secondary bg-secondary-light mt-12 sm:mt-0">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-text-secondary">
              © {new Date().getFullYear()} TicVision. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <a href="https://www.termsfeed.com/live/7b535df7-4adb-424e-9592-321ef0e23384" className="text-xs sm:text-sm text-text-secondary hover:text-primary">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearnMore;