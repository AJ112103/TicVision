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

/**
 * Updated mapLocationToCategory function.
 * It now checks for specific tic keywords (based on tic name/location)
 * and returns category strings that exactly match the keys in suggestionsMap.
 */
function mapLocationToCategory(location: string): string | undefined {
  const loc = location.toLowerCase();

  // Specific Vocal Tics
  if (loc.includes('coprolalia')) {
    return 'Coprolalia (Involuntary Swearing or Socially Inappropriate Words)';
  }
  if (loc.includes('echolalia')) {
    return 'Echolalia (Repeating Others’ Words)';
  }
  if (loc.includes('palilalia')) {
    return 'Palilalia (Repeating One’s Own Words)';
  }
  if (loc.includes('animal')) {
    return 'Animal Sounds Tics (e.g., barking, meowing, chirping)';
  }

  // General Vocal Tics
  if (loc.includes('simple vocal') || loc.includes('grunt') || loc.includes('cough') ||
      loc.includes('throat clear') || loc.includes('sniff')) {
    return 'Vocal Simple';
  }
  if ((loc.includes('word') || loc.includes('phrase')) && !loc.includes('echolalia') && !loc.includes('palilalia')) {
    return 'Vocal Word / Phrase';
  }
  if (loc.includes('breathing') && loc.includes('vocal')) {
    return 'Vocal Breathing Sounds';
  }
  if (loc.includes('echo') || loc.includes('repeat after')) {
    return 'Vocal Repetition';
  }
  if (loc.includes('block') || loc.includes('stuck')) {
    return 'Vocal Blocking';
  }

  // Motor Tics
  if (loc.includes('head')) {
    return 'Motor Head';
  }
  if (loc.includes('mouth') && !loc.includes('vocal')) {
    return 'Motor Mouth (e.g., tongue/cheek biting, teeth clenching)';
  }
  if (loc.includes('jaw')) {
    return 'Motor Jaw';
  }
  if (loc.includes('breathing') && !loc.includes('vocal')) {
    return 'Motor Breathing (e.g., gasping, forceful exhaling)';
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
    return 'Motor Stomach (e.g., tensing, contracting)';
  }
  if (loc.includes('arm')) {
    return 'Motor Arm (e.g., arm flapping, flexing)';
  }
  if (loc.includes('hand') || loc.includes('finger')) {
    return 'Motor Hand (e.g., finger snapping, wrist flicking)';
  }
  if (loc.includes('eyes') || loc.includes('blink')) {
    return 'Motor Eye (e.g., blinking, squinting, rolling)';
  }
  if (loc.includes('foot') || loc.includes('toe')) {
    return 'Motor Foot/Toe (e.g., tapping, stomping)';
  }
  if (loc.includes('pelvis') || loc.includes('hip')) {
    return 'Motor Pelvis (e.g., thrusting, clenching)';
  }
  if (loc.includes('leg')) {
    return 'Motor Leg (e.g., kicking, tensing)';
  }
  if (loc.includes('back')) {
    return 'Motor Back (e.g., arching, twisting)';
  }
  if (loc.includes('combined') || loc.includes('multiple') ||
      (loc.match(/\band\b/) && !loc.includes('vocal'))) {
    return 'Motor Combined Movements';
  }

  // Default for unspecified vocal tics that include the word "vocal"
  if (loc.includes('vocal')) {
    return 'Vocal Simple';
  }

  return undefined;
}

/**
 * Updated suggestionsMap:
 * The keys now exactly match the categories returned by mapLocationToCategory,
 * ensuring that every suggestion is linked to the specific tic type.
 */
const suggestionsMap: { [key: string]: string[] } = {
  'Vocal Simple': [
    'Competing Response: Try slow, controlled breathing (inhale for 4 seconds, exhale for 6) when you feel the urge to tic. This engages incompatible muscle movements, reducing tic frequency.',
    'Awareness Training: Record when and where the tic occurs most often to identify triggers (e.g., stress, boredom). Once identified, practice relaxation techniques in those situations.',
  ],
  'Coprolalia (Involuntary Swearing or Socially Inappropriate Words)': [
    'Delayed Response Strategy: When you feel the tic urge, practice pausing and replacing it with a neutral sound (e.g., humming). Over time, this can help weaken the automatic urge.',
    'Distraction Technique: Engage in repetitive fine motor tasks (e.g., squeezing a stress ball, tapping fingers in a pattern) when coprolalia urges arise to redirect motor energy.'
  ],
  'Echolalia (Repeating Others’ Words)': [
    'Response Interruption: When you catch yourself about to repeat a word, try mentally substituting a different word or phrase instead. This helps disrupt the automatic repetition loop.',
    'CBT Reframing: Identify situations where echolalia increases and practice self-talk strategies (e.g., internally saying, I don’t need to repeat this before responding).'
  ],
  'Palilalia (Repeating One’s Own Words)': [
    'Slow-Paced Speech: Speak deliberately slower to reduce the automatic urge to repeat. Practicing a rhythmic speech pattern (e.g., pausing between words) can help regulate repetitions.',
    'Tension Awareness: Recognize body tension before the tic and try progressive muscle relaxation techniques (tighten and release jaw, hands, etc.) before speaking.'
  ],
  'Animal Sounds Tics (e.g., barking, meowing, chirping)': [
    'Alternative Response Training: Replace the tic with a quiet breath or controlled whisper. Practicing a "soft exhale" can help break the tic cycle.',
    'Pattern Disruption: If certain sounds trigger the tic, try changing your environment or engaging in cognitive distractions (e.g., counting backward).'
  ],
  'Vocal Word / Phrase': [
    'Mindfulness and Delay Strategy: When you feel the urge, try delaying the tic by a few seconds and gradually increasing the delay over time.',
    'Silent Repetition: Instead of saying the phrase aloud, practice mouthing the words without sound. This can help phase out the vocal component.',
  ],
  'Motor Head': [
    'Competing Response: Practice holding your head still while engaging in a different controlled movement (e.g., pressing your tongue against the roof of your mouth).',
    'Postural Awareness: Pay attention to posture and balance; standing or sitting with proper alignment can sometimes reduce involuntary head movements.'
  ],
  'Motor Mouth (e.g., tongue/cheek biting, teeth clenching)': [
    'Incompatible Response: Keep a small object like sugar-free gum or a rubber chewable in your mouth to prevent excessive biting.',
    'Oral Relaxation Technique: Try progressive jaw relaxation—open your mouth slightly, hold for 5 seconds, then gently close. Repeat to release built-up tension.',
  ],
  'Motor Jaw': [
    'Counterpressure Exercise: Apply gentle resistance by pressing your tongue against the roof of your mouth when you feel the urge to tic.',
    'Stretching Routine: Slow, circular jaw movements before speaking or eating can help reduce muscle tension and tic frequency.',
  ],
  'Motor Breathing (e.g., gasping, forceful exhaling)': [
    'Paced Breathing: Practice a 4-7-8 breathing technique (inhale for 4 seconds, hold for 7, exhale for 8) to regulate involuntary breathing patterns.',
    'Biofeedback Awareness: Use a hand on your stomach to feel and control the rhythm of your breath, reinforcing steady, controlled inhalations and exhalations.',
  ],
  'Motor Neck': [
    'Gentle Counter-Movement: When you feel the tic coming, hold your neck straight and engage a different muscle group (e.g., lightly shrug your shoulders).',
    'Neck Stretching: Slowly tilt your head from side to side and hold for a few seconds to release tension and prevent reinforcement of the tic movement.',
  ],
  'Motor Eye (e.g., blinking, squinting, rolling)': [
    'Fixed Focus Strategy: When you feel an urge, focus on an object and blink deliberately every few seconds instead of spontaneously.',
    'Hydration & Eye Exercises: If excessive blinking worsens with screen time, take breaks and do controlled slow-blink exercises.',
  ],
  'Motor Hand (e.g., finger snapping, wrist flicking)': [
    'Object Substitution: Hold a small stress ball, fidget toy, or textured fabric to redirect the need for movement into a controlled alternative.',
    'Fine Motor Engagement: Try light finger tapping or controlled writing exercises to engage the hand differently and reduce tic repetition.',
  ],
  'Motor Shoulder': [
    'Shrug your shoulders up, hold for a moment, then relax.',
    'Rest your hands in your lap to keep your shoulders still.',
  ],
  'Motor Chest': [
    'Take a deep breath in and out to release tension in your chest.',
    'Tap lightly on your chest to redirect the tic.',
  ],
  'Motor Arm (e.g., arm flapping, flexing)': [
    'Isometric Holding: Gently press your hands together or against a stable surface when you feel the tic urge—this provides resistance to movement.',
    'Progressive Muscle Relaxation: Clench and release your arm muscles to consciously relieve excess energy.',
  ],
  'Motor Stomach (e.g., tensing, contracting)': [
    'Breath Awareness Training: Place a hand on your stomach and practice slow abdominal breathing to counteract unconscious clenching.',
    'Postural Adjustments: Ensure your seating position is comfortable, as poor posture can reinforce unnecessary stomach tensing.',
  ],
  'Motor Back (e.g., arching, twisting)': [
    'Controlled Stretching: Perform slow back stretches to reduce tension and promote relaxation, preventing automatic tic reinforcement.',
    'Stability Exercises: Strengthening core muscles can help stabilize involuntary back movements over time.',
  ],
  'Motor Foot/Toe (e.g., tapping, stomping)': [
    'Alternative Movement: Replace tic-related foot movements with deliberate, slow ankle rotations to retrain muscle control.',
    'Weighted Sensory Feedback: Wearing slightly heavier shoes or compression socks may help provide grounding and reduce tic frequency.',
  ],
  'Motor Pelvis (e.g., thrusting, clenching)': [
    'Isometric Core Engagement: Squeeze and release different core muscles (e.g., glutes or lower abs) in a controlled manner to prevent involuntary tics.',
    'Discreet Grounding Techniques: When sitting, try lightly pressing your feet into the floor to redirect motor energy away from the pelvic region.',
  ],
  'Motor Leg (e.g., kicking, tensing)': [
    'Controlled Resistance: When you feel the tic urge, press your feet firmly into the ground and hold for a few seconds.',
    'Seated Counter-Tension: If sitting, gently press your legs together or engage a different muscle (e.g., curling toes) to shift focus away from the tic',
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

  // Extract categories from the filtered data using our updated mapping function
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
                Log your tics to receive personalized suggestions based on your tic types and patterns.
              </CardContent>
            </Card>
          ) : (
            // Render suggestions based on categories from filtered data
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
                        {category}
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
