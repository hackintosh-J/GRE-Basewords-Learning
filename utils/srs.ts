import { WordStats } from '../types';

// Spaced Repetition System Intervals (in days)
export const defaultSrsIntervals: { [key: number]: number } = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
  6: 60,
  7: 120,
  8: 240,
};
export const MAX_SRS_LEVEL = Object.keys(defaultSrsIntervals).length;

export const getNextReviewDate = (srsLevel: number, srsIntervals: { [key: number]: number }): string => {
  const now = new Date();
  const intervalDays = srsIntervals[srsLevel] || 1; // Default to 1 day if level not in map
  now.setDate(now.getDate() + intervalDays);
  return now.toISOString().split('T')[0]; // Return only YYYY-MM-DD
};

export const handleCorrectAnswer = (currentLevel: number = 0, srsIntervals: { [key: number]: number }) => {
  const maxLevel = Object.keys(srsIntervals).length;
  const newLevel = Math.min(maxLevel, currentLevel + 1);
  return {
    srsLevel: newLevel,
    nextReview: getNextReviewDate(newLevel, srsIntervals),
    lastReviewed: new Date().toISOString().split('T')[0],
  };
};

export const handleIncorrectAnswer = (currentLevel: number = 0, srsIntervals: { [key: number]: number }) => {
  // Reset progress, but not completely. Demote by half, but at least to level 1.
  const newLevel = Math.max(1, Math.floor(currentLevel / 2));
  return {
    srsLevel: newLevel,
    nextReview: getNextReviewDate(1, srsIntervals), // Always review again tomorrow after a mistake
    lastReviewed: new Date().toISOString().split('T')[0],
  };
};

// New function for dynamic difficulty scoring
export const calculateDifficulty = (stats: WordStats): number => {
    if (!stats) return 0;
    
    const today = new Date();
    // Use today if lastReviewed is null, so daysSinceLastReview is 0 for new words
    const lastReviewedDate = stats.lastReviewed ? new Date(stats.lastReviewed) : today;
    const daysSinceLastReview = Math.floor((today.getTime() - lastReviewedDate.getTime()) / (1000 * 3600 * 24));

    // The algorithm: incorrect answers have high weight, correct answers reduce weight, and time increases it.
    const incorrectWeight = 5;
    const correctWeight = -2;
    const timeFactor = 0.1; // Per day

    const score = (stats.incorrectCount * incorrectWeight) 
                + (stats.correctCount * correctWeight) 
                + (daysSinceLastReview * timeFactor);

    return score;
}
