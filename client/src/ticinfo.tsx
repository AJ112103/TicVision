import React from 'react';
import { motion } from 'framer-motion';

const TicInfo: React.FC = () => {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-4">
        {/* Page Heading */}
        <section className="py-6 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mb-4 text-3xl sm:text-5xl font-bold leading-tight">
              Tic Definitions
            </h1>
            <p className="text-base sm:text-lg text-text-secondary">
              An overview of different types of tics, including motor, vocal, simple, and complex examples.
            </p>
          </motion.div>
        </section>

        {/* Tics Overview */}
        <section className="py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="mb-4 text-2xl sm:text-3xl font-semibold">
              Tics
            </h2>
            <p className="mb-6 text-base sm:text-lg text-text-secondary">
              <strong>Tic:</strong> A sudden, involuntary, and repetitive movement or sound caused by muscle contractions or vocalizations. Tics can vary in intensity and frequency.
            </p>

            <p className="mb-4 text-base sm:text-lg text-text-secondary">
              <strong>Motor Tic:</strong> Uncontrolled, repetitive movements involving one or more muscle groups, often sudden and unpredictable.
            </p>

            <p className="mb-4 text-base sm:text-lg text-text-secondary">
              <strong>Vocal Tic:</strong> Involuntary vocalizations, ranging from simple sounds to more complex utterances, often experienced as uncontrollable.
            </p>

            <p className="mb-4 text-base sm:text-lg text-text-secondary">
              <strong>Simple Tic:</strong> Quick, short movements or sounds involving a single muscle group or sound pattern, often without conscious awareness.
            </p>

            <p className="mb-4 text-base sm:text-lg text-text-secondary">
              <strong>Complex Tic:</strong> More elaborate, patterned movements or vocalizations that may appear intentional but are involuntary.
            </p>
          </motion.div>
        </section>

        {/* Vocal Tics */}
        <section className="py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="mb-4 text-2xl sm:text-3xl font-semibold">
              Vocal Tics
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-text-secondary">
              <p>
                <strong>Vocal Simple:</strong> Short, repetitive sounds such as grunting, throat clearing, sniffing, or clicking noises that occur involuntarily.
              </p>
              <p>
                <strong>Vocal Complex:</strong> Involves multi-syllabic sounds or patterned vocalizations, like repeating certain words, humming, or making rhythmic noises.
              </p>
              <p>
                <strong>Vocal Word:</strong> Sudden utterance of individual words, often abrupt and unrelated to the current context or conversation.
              </p>
              <p>
                <strong>Vocal Phrase:</strong> Involuntary production of short phrases or sentences, which may feel uncontrollable and occur unexpectedly.
              </p>
              <p>
                <strong>Vocal Breathing Sounds:</strong> Involves noises like gasping, sighing, or forceful inhaling.
              </p>
              <p>
                <strong>Vocal Repetition (Echolalia):</strong> Repeating words or phrases spoken by others.
              </p>
              <p>
                <strong>Vocal Blocking:</strong> Sudden pauses or breaks while speaking.
              </p>
              <p>
                <strong>Vocal Palilalia:</strong> Repeating one’s own words or phrases.
              </p>
              <p>
                <strong>Vocal Animal Sounds:</strong> Involves sounds like barking, meowing, or chirping.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Motor Tics */}
        <section className="py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="mb-4 text-2xl sm:text-3xl font-semibold">
              Motor Tics
            </h2>

            <div className="space-y-4 text-base sm:text-lg text-text-secondary">
              <p>
                <strong>Motor Breathing:</strong> Forceful inhalations, exhalations, or irregular breathing patterns.
              </p>
              <p>
                <strong>Motor Face (Eyes):</strong> Involves bulging of the eyes, repetitive blinking, or squinting. These movements may feel rapid and difficult to control.
              </p>
              <p>
                <strong>Motor Face (Jaw):</strong> Front-to-back, up-and-down, or side-to-side jaw movements, often repetitive and occurring without conscious initiation.
              </p>
              <p>
                <strong>Motor Face (Mouth):</strong> Involves involuntary movements of the tongue, intense clenching of teeth, or biting of the cheek or tongue, often repetitive.
              </p>
              <p>
                <strong>Motor Neck:</strong> Sudden, involuntary twitching or jerking movements of the neck, which may happen repeatedly and unpredictably.
              </p>
              <p>
                <strong>Motor Shoulder:</strong> Unnatural or repetitive jerking movements of the shoulder joint, sometimes involving a shrugging or circular motion.
              </p>
              <p>
                <strong>Motor Chest:</strong> Clenching or sudden tensing of the chest muscles, often felt as a repetitive contraction.
              </p>
              <p>
                <strong>Motor Stomach:</strong> Involves sudden, involuntary movements or tensing of the abdominal muscles, sometimes resembling a cramping sensation.
              </p>
              <p>
                <strong>Motor Arm:</strong> Jerking, tensing, or slapping motions of the arm, which can include hitting other parts of the body.
              </p>
              <p>
                <strong>Motor Hand/Finger:</strong> Movements like repetitive tapping, snapping, flicking, or clenched fists.
              </p>
              <p>
                <strong>Motor Foot/Toe:</strong> Involves toe tapping, curling, or foot stomping.
              </p>
              <p>
                <strong>Motor Pelvis:</strong> Thrusting or jerking movements involving the pelvic area.
              </p>
              <p>
                <strong>Motor Leg:</strong> Involuntary movements such as kicking, jerking, tensing, or twisting, often involving the ankle or lower leg.
              </p>
              <p>
                <strong>Motor Back:</strong> Sudden forward or backward jerking or twisting motions, along with tensing of the back muscles.
              </p>
              <p>
                <strong>Motor Combined Movements:</strong> Coordinated movements involving multiple body parts simultaneously.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Other */}
        <section className="py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="mb-4 text-2xl sm:text-3xl font-semibold">
              Other
            </h2>
            <p className="mb-4 text-base sm:text-lg text-text-secondary">
              <strong>Other:</strong> Users can name their tic and describe it in up to 20 words to detail how it feels.
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default TicInfo;
