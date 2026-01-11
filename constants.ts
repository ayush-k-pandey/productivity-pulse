
import { Activity } from './types';

export const ACTIVITIES: Activity[] = [
  // Physical Activity Section
  { id: 'run', name: 'Running', category: 'Physical', icon: '🏃‍♂️' },
  { id: 'walk', name: 'Walking', category: 'Physical', icon: '🚶‍♂️' },
  { id: 'swim', name: 'Swimming', category: 'Physical', icon: '🏊‍♂️' },
  { id: 'cycle', name: 'Cycling', category: 'Physical', icon: '🚴‍♂️' },
  { id: 'gym', name: 'Gym Workout', category: 'Physical', icon: '🏋️‍♂️' },
  { id: 'yoga', name: 'Yoga & Flexibility', category: 'Physical', icon: '🧘‍♂️' },
  { id: 'sports', name: 'Team Sports', category: 'Physical', icon: '⚽' },
  { id: 'hiking', name: 'Hiking / Nature Walk', category: 'Physical', icon: '🥾' },
  { id: 'stretch', name: 'Daily Stretching', category: 'Physical', icon: '🙆‍♂️' },
  
  // Study Section
  { id: 'classes', name: 'Classes', category: 'Study', icon: '🏫' },
  { id: 'classwork', name: 'Classwork', category: 'Study', icon: '📝' },
  { id: 'assignments', name: 'Assignments', category: 'Study', icon: '📚' },
  { id: 'exam_prep', name: 'Exam Preparation', category: 'Study', icon: '🎯' },
  { id: 'reading', name: 'Academic Reading', category: 'Study', icon: '📖' },
  { id: 'research', name: 'Deep Research', category: 'Study', icon: '🔍' },
  { id: 'language', name: 'Language Practice', category: 'Study', icon: '🗣️' },
  { id: 'online_course', name: 'Online Certifications', category: 'Study', icon: '🖥️' },

  // Skills Development Section
  { id: 'dsa', name: 'Data Structures & Algorithms', category: 'Skills', icon: '💻' },
  { id: 'ml', name: 'Machine Learning', category: 'Skills', icon: '🤖' },
  { id: 'ds', name: 'Data Science', category: 'Skills', icon: '📊' },
  { id: 'ai', name: 'Artificial Intelligence', category: 'Skills', icon: '🧠' },
  { id: 'webdev', name: 'Web Development', category: 'Skills', icon: '🌐' },
  { id: 'design', name: 'UI/UX Design', category: 'Skills', icon: '🎨' },
  { id: 'public_speaking', name: 'Communication Skills', category: 'Skills', icon: '🎤' },
  { id: 'finance', name: 'Financial Literacy', category: 'Skills', icon: '💰' },
  { id: 'writing', name: 'Technical Writing', category: 'Skills', icon: '✍️' },

  // Health & Lifestyle Section
  { id: 'water', name: 'Water Intake', category: 'Health', icon: '💧' },
  { id: 'breakfast', name: 'Healthy Breakfast', category: 'Health', icon: '🍳' },
  { id: 'lunch', name: 'Healthy Lunch', category: 'Health', icon: '🥗' },
  { id: 'dinner', name: 'Healthy Dinner', category: 'Health', icon: '🍲' },
  { id: 'sleep', name: '7-8 Hours Sleep', category: 'Health', icon: '😴' },
  { id: 'meditation', name: 'Mindfulness/Meditation', category: 'Health', icon: '🕯️' },
  { id: 'nojunk', name: 'No Junk Food', category: 'Health', icon: '🍎' },
  { id: 'vitamins', name: 'Vitamins / Supplements', category: 'Health', icon: '💊' },
  { id: 'journal', name: 'Daily Journaling', category: 'Health', icon: '📓' },
  { id: 'skincare', name: 'Skincare Routine', category: 'Health', icon: '✨' },

  // Fun & Recreation Section
  { id: 'gaming', name: 'Video Games', category: 'Fun', icon: '🎮' },
  { id: 'movies', name: 'Movie / Series Night', category: 'Fun', icon: '🍿' },
  { id: 'leisure_reading', name: 'Leisure Reading', category: 'Fun', icon: '📚' },
  { id: 'music', name: 'Music / Instruments', category: 'Fun', icon: '🎸' },
  { id: 'socializing', name: 'Hangout with Friends', category: 'Fun', icon: '👥' },
  { id: 'hobby', name: 'Creative Hobbies', category: 'Fun', icon: '🎨' },
  { id: 'boardgames', name: 'Board Games', category: 'Fun', icon: '🎲' },
  { id: 'outdoor_fun', name: 'Outdoor Exploration', category: 'Fun', icon: '🗺️' },
];

export const CATEGORIES = [
  { id: 'Physical', label: 'Physical Activity', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 dark:bg-emerald-950/20', textColor: 'text-emerald-700 dark:text-emerald-400' },
  { id: 'Study', label: 'Academic Study', color: 'bg-indigo-500', lightColor: 'bg-indigo-50 dark:bg-indigo-950/20', textColor: 'text-indigo-700 dark:text-indigo-400' },
  { id: 'Skills', label: 'Skills & Tech', color: 'bg-amber-500', lightColor: 'bg-amber-50 dark:bg-amber-950/20', textColor: 'text-amber-700 dark:text-amber-400' },
  { id: 'Health', label: 'Health & Lifestyle', color: 'bg-rose-500', lightColor: 'bg-rose-50 dark:bg-rose-950/20', textColor: 'text-rose-700 dark:text-rose-400' },
  { id: 'Fun', label: 'Fun & Recreation', color: 'bg-purple-500', lightColor: 'bg-purple-50 dark:bg-purple-950/20', textColor: 'text-purple-700 dark:text-purple-400' },
];
