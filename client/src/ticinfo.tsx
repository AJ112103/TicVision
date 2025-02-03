import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  AlertCircle,
  ChevronRight,
  Volume2,
  Activity,
  Layers,
} from 'lucide-react';

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

const TicInfo: React.FC = () => {
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
        <h1 className="text-3xl font-bold">Tic Definitions</h1>
      </motion.div>

      {/* Overview Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            What are Tics?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg text-text-secondary">
            Tics are sudden, repetitive movements or sounds that are involuntary. They
            can be classified into motor or vocal tics and further into simple or
            complex types based on their characteristics.
          </p>
        </CardContent>
      </Card>

      {/* Tics Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Types of Tics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4" />
              <span>
                <strong>Motor Tic:</strong> Uncontrolled, repetitive movements involving one or more muscle groups, often sudden and unpredictable.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4" />
              <span>
                <strong>Vocal Tic:</strong> Involuntary vocalizations, ranging from simple sounds to more complex utterances, often experienced as uncontrollable.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4" />
              <span>
                <strong>Simple Tic:</strong> Quick, short movements or sounds involving a single muscle group or sound pattern, often without conscious awareness.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4" />
              <span>
                <strong>Complex Tic:</strong> More elaborate, patterned movements or vocalizations that may appear intentional but are involuntary.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vocal Tics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Vocal Tics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Vocal Simple:</strong> Short, repetitive sounds such as grunting, throat clearing, sniffing, or clicking noises that occur involuntarily.</p>
            <p><strong>Vocal Word:</strong> Sudden utterance of individual words, often abrupt and unrelated to the current context or conversation.</p>
            <p><strong>Vocal Phrase:</strong> Involuntary production of short phrases or sentences, which may feel uncontrollable and occur unexpectedly.</p>
            <p><strong>Vocal Breathing Sounds:</strong> Involves noises like gasping, sighing, or forceful inhaling.</p>
            <p><strong>Vocal Complex:</strong> Speech-like utterances. They often include words, phrases, or even complete sentences that may appear purposeful but are involuntary. Common types include: Echolalia, Palilalia and Coprolalia.</p>
            <p><strong>Vocal Repetition (Echolalia):</strong> Repeating words or phrases spoken by others.</p>
            <p><strong>Vocal Palilalia:</strong> Repeating one’s own words or phrases.</p>
            <p><strong>Vocal Coprolalia:</strong> Involuntary outbursts of socially inappropriate or obscene words or phrases.</p>
            <p><strong>Vocal Animal Sounds:</strong> Involves sounds like barking, meowing, or chirping.</p>
            
          </div>
        </CardContent>
      </Card>

      {/* Motor Tics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Motor Tics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Motor Breathing:</strong> Forceful inhalations, exhalations, or irregular breathing patterns.</p>
            <p><strong>Motor Face (Eyes):</strong> Involves bulging of the eyes, repetitive blinking, or squinting. These movements may feel rapid and difficult to control.</p>
            <p><strong>Motor Face (Jaw):</strong> Front-to-back, up-and-down, or side-to-side jaw movements, often repetitive and occurring without conscious initiation.</p>
            <p><strong>Motor Face (Mouth):</strong> Involves involuntary movements of the tongue, intense clenching of teeth, or biting of the cheek or tongue, often repetitive.</p>
            <p><strong>Motor Neck:</strong> Sudden, involuntary twitching or jerking movements of the neck, which may happen repeatedly and unpredictably.</p>
            <p><strong>Motor Shoulder:</strong> Unnatural or repetitive jerking movements of the shoulder joint, sometimes involving a shrugging or circular motion.</p>
            <p><strong>Motor Chest:</strong> Clenching or sudden tensing of the chest muscles, often felt as a repetitive contraction.</p>
            <p><strong>Motor Stomach:</strong> Involves sudden, involuntary movements or tensing of the abdominal muscles, sometimes resembling a cramping sensation.</p>
            <p><strong>Motor Arm:</strong> Jerking, tensing, or slapping motions of the arm, which can include hitting other parts of the body.</p>
            <p><strong>Motor Hand/Finger:</strong> Movements like repetitive tapping, snapping, flicking, or clenched fists.</p>
            <p><strong>Motor Foot/Toe:</strong> Involves toe tapping, curling, or foot stomping.</p>
            <p><strong>Motor Pelvis:</strong> Thrusting or jerking movements involving the pelvic area.</p>
            <p><strong>Motor Leg:</strong> Involuntary movements such as kicking, jerking, tensing, or twisting, often involving the ankle or lower leg.</p>
            <p><strong>Motor Back:</strong> Sudden forward or backward jerking or twisting motions, along with tensing of the back muscles.</p>
            <p><strong>Motor Combined Movements:</strong> Coordinated movements involving multiple body parts simultaneously.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TicInfo;
