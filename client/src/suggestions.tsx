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
  
  // Vocal Tics - Map to specific categories
  if (loc.includes('simple vocal') || loc.includes('grunt') || loc.includes('cough') || 
      loc.includes('throat clear') || loc.includes('sniff')) {
    return 'Vocal Simple';
  }
  if (loc.includes('complex vocal') || loc.includes('multiple sounds')) {
    return 'Vocal Complex';
  }
  if (loc.includes('word') && !loc.includes('phrase')) {
    return 'Vocal Word';
  }
  if (loc.includes('phrase') || loc.includes('sentence')) {
    return 'Vocal Phrase';
  }
  if (loc.includes('breathing') || loc.includes('breath')) {
    return 'Vocal Breathing Sounds';
  }
  if (loc.includes('echo') || loc.includes('repeat after')) {
    return 'Vocal Repetition';
  }
  if (loc.includes('block') || loc.includes('stuck')) {
    return 'Vocal Blocking';
  }
  if (loc.includes('palilalia') || loc.includes('repeat own')) {
    return 'Vocal Palilalia';
  }
  if (loc.includes('animal') || loc.includes('bark') || loc.includes('meow')) {
    return 'Vocal Animal Sounds';
  }
  
  // Motor Tics
  if (loc.includes('breathing') && !loc.includes('vocal')) {
    return 'Motor Breathing';
  }
  if (loc.includes('eyes') || loc.includes('blink')) {
    return 'Motor Face (Eyes)';
  }
  if (loc.includes('jaw')) {
    return 'Motor Face (Jaw)';
  }
  if (loc.includes('mouth') && !loc.includes('vocal')) {
    return 'Motor Face (Mouth)';
  }
  if (loc.includes('neck')) {
    return 'Motor Neck';
  }
  if (loc.includes('shoulder')) {
    return 'Motor Shoulder';
  }
  if (loc.includes('chest')) {
    return 'Motor Chest';
  }
  if (loc.includes('stomach')) {
    return 'Motor Stomach';
  }
  if (loc.includes('arm')) {
    return 'Motor Arm';
  }
  if (loc.includes('hand') || loc.includes('finger')) {
    return 'Motor Hand/Finger';
  }
  if (loc.includes('foot') || loc.includes('toe')) {
    return 'Motor Foot/Toe';
  }
  if (loc.includes('pelvis') || loc.includes('hip')) {
    return 'Motor Pelvis';
  }
  if (loc.includes('leg')) {
    return 'Motor Leg';
  }
  if (loc.includes('back')) {
    return 'Motor Back';
  }
  if (loc.includes('combined') || loc.includes('multiple') || 
      (loc.match(/\band\b/) && !loc.includes('vocal'))) {
    return 'Motor Combined Movements';
  }
  
  // Default mappings for general vocal tics that don't fit specific categories
  if (loc.includes('vocal')) {
    if (loc.includes('repeat') || loc.includes('same')) {
      return 'Vocal Palilalia';
    }
    if (loc.includes('complex')) {
      return 'Vocal Complex';
    }
    return 'Vocal Simple'; // Default for unspecified vocal tics
  }
  
  return undefined;
}

const suggestionsMap: { [key: string]: string[] } = {
  'Vocal Simple': [
    'Try taking deep, slow breaths to ease the urge to make sounds.',
    'Replace the sound with a quiet hum or a soft exhale.',
  ],
  'Vocal Complex': [
    'Hum softly instead of repeating words or noises.',
    'Take a deep breath and let it out slowly to relax your throat.',
  ],
  'Vocal Word': [
    'Think of a calming word to repeat in your head instead of out loud.',
    'Gently press your lips together when you feel the urge to speak a word.',
  ],
  'Vocal Phrase': [
    'Try whispering the phrase instead of saying it loudly.',
    'Pause and take a slow, deep breath when the urge comes.',
  ],
  'Vocal Breathing Sounds': [
    'Breathe in for 4 counts, then out for 6 counts to calm your breathing.',
    'Rest a hand on your chest and focus on keeping your breaths steady.',
  ],
  'Vocal Repetition': [
    'Repeat the word or phrase quietly in your mind instead of out loud.',
    'Slow down how you speak to reduce the urge to echo.',
  ],
  'Vocal Blocking': [
    'Sip some water to help restart your speech flow.',
    'Exhale gently to relax your vocal cords.',
  ],
  'Vocal Palilalia': [
    'Pause between words by counting to 3 in your head.',
    'Say the repeated word quietly in your mind to redirect the tic.',
  ],
  'Vocal Animal Sounds': [
    'Replace the sound with a soft hum to manage the urge.',
    'Lightly clench your teeth to keep the sound from forming.',
  ],
  'Motor Breathing': [
    'Practice slow, steady breathing to help keep it regular.',
    'Hold something soft, like a stress ball, to shift your focus.',
  ],
  'Motor Face (Eyes)': [
    'Blink slowly and deliberately to calm repetitive blinking.',
    'Gently massage around your eyes to relax the muscles.',
  ],
  'Motor Face (Jaw)': [
    'Open and close your mouth slowly to stretch your jaw.',
    'Chew gum to give your jaw something to do.',
  ],
  'Motor Face (Mouth)': [
    'Press your tongue against the roof of your mouth to keep it still.',
    'Keep your lips gently closed to avoid biting your cheek.',
  ],
  'Motor Neck': [
    'Try gentle neck stretches to ease the urge.',
    'Place your hand on your chin to hold it steady when the tic starts.',
  ],
  'Motor Shoulder': [
    'Shrug your shoulders up, hold for a moment, then relax.',
    'Rest your hands in your lap to keep your shoulders still.',
  ],
  'Motor Chest': [
    'Take a deep breath in and out to release tension in your chest.',
    'Tap lightly on your chest to redirect the tic.',
  ],
  'Motor Stomach': [
    'Tighten your stomach muscles for a few seconds, then relax.',
    'Rub your stomach in circles to ease the tension.',
  ],
  'Motor Arm': [
    'Keep your hands in your pockets or hold them together.',
    'Hold a small object, like a stress ball, to focus your movements.',
  ],
  'Motor Hand/Finger': [
    'Tap your fingers on a table purposefully to control the movement.',
    'Squeeze your fist tightly for a few seconds, then release.',
  ],
  'Motor Foot/Toe': [
    'Press your feet firmly on the ground to stabilize them.',
    'Curl your toes tightly, hold for a moment, then release.',
  ],
  'Motor Pelvis': [
    'Sit down and gently tilt your pelvis forward and back to calm the movement.',
    'Tighten your glutes for a few seconds, then relax.',
  ],
  'Motor Leg': [
    'Cross your legs or place your feet flat on the ground.',
    'Slowly lift your leg and lower it to regain control.',
  ],
  'Motor Back': [
    'Sit against a chair and press your back into it for support.',
    'Stretch your spine gently by leaning forward, then backward.',
  ],
  'Motor Combined Movements': [
    'Focus on controlling one part of the movement at a time.',
    'Try a relaxation exercise, like tensing all your muscles, then releasing.',
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
        <Brain className="w-8 h-8 text-bg-primary" />
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
                        ? 'bg-primary text-white '
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
