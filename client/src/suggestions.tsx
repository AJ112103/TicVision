import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Brain, Filter, RefreshCcw, Calendar, MapPin } from 'lucide-react';

interface TicData {
  timeOfDay: string;
  date: string;
  intensity: number;
  location: string;
}

const Card = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-lg border bg-white shadow-sm p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col space-y-1.5 mb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
);

const CardContent = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props}>
    {children}
  </div>
);

function mapLocationToCategory(location: string): string | undefined {
  const loc = location.toLowerCase();
  
  if (loc.includes('arm') || loc.includes('hand')) return 'Arm';
  if (loc.includes('complex') || loc.includes('blocking')) return 'Complex Vocal';
  if (loc.includes('(eyes)')) return 'Eye';
  if (loc.includes('(jaw)')) return 'Jaw';
  if (loc.includes('leg') || loc.includes('foot') || loc.includes('toe')) return 'Leg';
  if (loc.includes('(mouth)')) return 'Mouth';
  if (loc.includes('neck')) return 'Neck';
  if (loc.includes('shoulder')) return 'Shoulder';
  if (loc.includes('vocal simple') || loc.includes('breathing sounds') || loc.includes('animal sounds')) return 'Simple Vocal';
  if (loc.includes('stomach')) return 'Stomach';
  if (loc.includes('word') || loc.includes('phrase') || loc.includes('repetition') || loc.includes('palilalia')) return 'Word Phrase';
  return undefined;
}

const suggestionsMap: { [key: string]: string[] } = {
  Arm: [
    'Keep your hands in your pockets or hold them together',
    'Hold a small object like a stress ball to focus your movements',
    'Tap your fingers on a table purposefully to control the movement',
    'Squeeze your fist tightly for a few seconds then release',
  ],
  'Complex Vocal': [
    'Hum softly instead of repeating words or noises',
    'Take a deep breath and let it out slowly to relax your throat',
    'Sip some water to help restart your speech flow',
    'Exhale gently to relax your vocal cords',
  ],
  Eye: [
    'Blink slowly and deliberately to calm repetitive blinking',
    'Gently massage around your eyes to relax the muscles',
  ],
  Jaw: [
    'Open and close your mouth slowly to stretch your jaw',
    'Chew gum to give your jaw something to do',
  ],
  Leg: [
    'Cross your legs or place your feet flat on the ground',
    'Slowly lift your leg and lower it to regain control',
    'Press your feet firmly on the ground to stabilize them',
    'Curl your toes tightly and hold for a moment then release',
  ],
  Mouth: [
    'Press your tongue against the roof of your mouth to keep it still',
    'Keep your lips gently closed to avoid biting your cheek',
  ],
  Neck: [
    'Try gentle neck stretches to ease the urge',
    'Place your hand on your chin to hold it steady when the tic starts',
  ],
  Shoulder: [
    'Shrug your shoulders up, hold for a moment, then relax',
    'Rest your hands in your lap to keep your shoulders still',
  ],
  'Simple Vocal': [
    'Try taking deep, slow breaths to ease the urge to make sounds',
    'Replace the sound with a quiet hum or a soft exhale',
    'Breathe in for 4 counts then out for 6 counts to calm your breathing',
    'Rest a hand on your chest and focus on keeping your breaths steady',
    'Replace animal sounds with a soft hum to manage the urge',
    'Lightly clench your teeth to keep the sound from forming',
  ],
  Stomach: [
    'Tighten your stomach muscles for a few seconds then relax',
    'Rub your stomach in circles to ease the tension',
  ],
  'Word Phrase': [
    'Think of a calming word to repeat in your head instead of out loud',
    'Gently press your lips together when you feel the urge to speak a word',
    'Try whispering a phrase instead of saying it loudly',
    'Pause and take a slow deep breath when the urge comes',
    'Repeat words or phrases quietly in your mind instead of out loud',
    'Slow down how you speak to reduce the urge to echo',
    'Pause between words by counting to three in your head',
    'Say the repeated word quietly in your mind to redirect the tic',
  ],
};

const Suggestions: React.FC = () => {
  const [ticData, setTicData] = useState<TicData[]>([]);
  const [filteredData, setFilteredData] = useState<TicData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('all');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchTicData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ticData, timeRangeFilter, specificDate, locationFilter]);

  const fetchTicData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const ticCollection = collection(db, 'users', user.uid, 'ticHistory');
      const snapshot = await getDocs(ticCollection);
      const data: TicData[] = snapshot.docs.map(doc => ({
        timeOfDay: doc.data().timeOfDay,
        date: doc.data().date,
        intensity: doc.data().intensity,
        location: doc.data().location,
      }));

      setTicData(data);
      setUniqueLocations(Array.from(new Set(data.map(tic => tic.location))));
    } catch (error) {
      console.error('Error fetching tic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...ticData];
    const now = new Date();

    if (timeRangeFilter !== 'specificDate') {
      data = data.filter(tic => {
        const ticDate = new Date(tic.date);
        switch (timeRangeFilter) {
          case 'today':
            return ticDate.toDateString() === now.toDateString();
          case 'lastWeek':
            return now.getTime() - ticDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
          case 'lastMonth':
            return (
              now.getMonth() === ticDate.getMonth() &&
              now.getFullYear() === ticDate.getFullYear()
            );
          case 'last3Months':
            return now.getTime() - ticDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
          case 'last6Months':
            return now.getTime() - ticDate.getTime() <= 180 * 24 * 60 * 60 * 1000;
          case 'lastYear':
            return now.getFullYear() === ticDate.getFullYear();
          default:
            return true;
        }
      });
    } else if (specificDate) {
      const selectedDate = new Date(specificDate).toDateString();
      data = data.filter(tic => new Date(tic.date).toDateString() === selectedDate);
    }

    if (locationFilter.length > 0) {
      data = data.filter(tic => locationFilter.includes(tic.location));
    }

    setFilteredData(data);
  };

  const handleResetFilters = () => {
    setTimeRangeFilter('all');
    setSpecificDate('');
    setLocationFilter([]);
  };

  const toggleLocation = (location: string) => {
    setLocationFilter(prev =>
      prev.includes(location)
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  // Extract categories from the filtered data
  const categoriesFromFilteredData = Array.from(
    new Set(filteredData.map(tic => mapLocationToCategory(tic.location)))
  ).filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-6"
      >
        <Brain className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold">Tic Suggestions</h2>
      </motion.div>

      {/* Filters Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="timeRange">
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Time Range
              </label>
              <select
                id="timeRange"
                className="w-full rounded-md border border-gray-300 p-2"
                value={timeRangeFilter}
                onChange={e => setTimeRangeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="lastWeek">Last Week</option>
                <option value="lastMonth">Last Month</option>
                <option value="last3Months">Last 3 Months</option>
                <option value="last6Months">Last 6 Months</option>
                <option value="lastYear">Last Year</option>
                <option value="specificDate">Specific Date</option>
              </select>
            </div>

            {/* Specific Date Filter */}
            {timeRangeFilter === 'specificDate' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium mb-2" htmlFor="specificDate">
                  <Calendar className="w-4 h-4 inline-block mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  id="specificDate"
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={specificDate}
                  onChange={e => setSpecificDate(e.target.value)}
                />
              </motion.div>
            )}

            {/* Location Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 inline-block mr-2" />
                Location
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueLocations.map((location, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => toggleLocation(location)}
                    className={`px-3 py-1 rounded-full border transition-colors ${
                      locationFilter.includes(location)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {location}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            onClick={handleResetFilters}
          >
            <RefreshCcw className="w-4 h-4" />
            Reset Filters
          </motion.button>
        </CardContent>
      </Card>

      {/* Display Data or Loading */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8"
        >
          Loading...
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                No tic data available.
              </CardContent>
            </Card>
          ) : (
            // Render suggestions based on categories in filtered data
            categoriesFromFilteredData.map((category, idx) => {
              const suggestions = suggestionsMap[category] || [];
              if (suggestions.length === 0) return null;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {category} Tic Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Suggestions;
