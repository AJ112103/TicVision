import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Activity, Brain, Heart } from "lucide-react";
import { getAuth } from "firebase/auth";

const features = [
  {
    icon: Activity,
    title: "Track Your Tics",
    description: "Log and monitor your tics with our intuitive tracking system",
  },
  {
    icon: Brain,
    title: "Understand Patterns",
    description: "Visualize your data through beautiful, insightful charts",
  },
  {
    icon: Heart,
    title: "Improve Well-being",
    description: "Get personalized recommendations for better management",
  },
];

const Index = () => {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    const auth = getAuth();
    if (auth.currentUser) {
      navigate("/dashboard")
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <nav className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link to="/" className="text-2xl font-bold text-primary">
            TicVision
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 pt-32">
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Understand Your Tics, Visualize Your Progress
            </span>
            <h1 className="mb-6 text-5xl font-bold leading-tight lg:text-6xl">
              Take Control of Your
              <span className="text-primary"> Journey</span>
            </h1>
            <p className="mb-8 text-lg text-text-secondary lg:text-xl">
              TicVision helps you track, understand, and manage your tics with
              powerful visualization tools and personalized insights.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={handleStartJourney}
                className="btn-primary group w-full sm:w-auto"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                to="/learn-more"
                className="btn-secondary w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card group hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-secondary bg-secondary-light">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-text-secondary">
              © {new Date().getFullYear()} TicVision. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-text-secondary hover:text-primary">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-text-secondary hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
