import {
  Atom,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Code2,
  FlaskConical,
  Globe2,
  Landmark,
  Laptop,
  Mail,
  MousePointer2,
  Palette,
  ShieldCheck,
  Smartphone,
  Sprout,
  Video,
  Wifi,
} from 'lucide-react'

export const languages = [
  { id: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { id: 'es', label: 'Español', short: 'ES', dir: 'ltr' },
  { id: 'hi', label: 'हिन्दी', short: 'HI', dir: 'ltr' },
  { id: 'ar', label: 'العربية', short: 'AR', dir: 'rtl' },
  { id: 'fr', label: 'Français', short: 'FR', dir: 'ltr' },
]

export const courses = [
  {
    id: 'algebra',
    subject: 'Math',
    title: 'Algebra basics',
    description: 'Build confidence with expressions, equations, and real-world problems.',
    plainDescription: 'Learn how letters and numbers work together in math.',
    progress: 60,
    lessonsDone: 2,
    lessonsTotal: 3,
    size: '18 MB',
    color: 'blue',
    icon: Calculator,
  },
  {
    id: 'science',
    subject: 'Science',
    title: 'Living systems',
    description: 'Explore ecosystems, food webs, cells, and how organisms adapt.',
    plainDescription: 'Learn how living things survive and depend on each other.',
    progress: 38,
    lessonsDone: 1,
    lessonsTotal: 3,
    size: '22 MB',
    color: 'green',
    icon: FlaskConical,
  },
  {
    id: 'reading',
    subject: 'English',
    title: 'Reading for meaning',
    description: 'Practice finding evidence and understanding an author’s point of view.',
    plainDescription: 'Find the main idea and proof in a text.',
    progress: 25,
    lessonsDone: 1,
    lessonsTotal: 3,
    size: '12 MB',
    color: 'purple',
    icon: BookOpen,
  },
  {
    id: 'history',
    subject: 'History',
    title: 'Communities and government',
    description: 'See how local government, civic choices, and primary sources connect.',
    plainDescription: 'Learn how communities make rules and decisions.',
    progress: 0,
    lessonsDone: 0,
    lessonsTotal: 3,
    size: '16 MB',
    color: 'coral',
    icon: Landmark,
  },
  {
    id: 'computing',
    subject: 'Computer science',
    title: 'Code and algorithms',
    description: 'Learn sequences, conditions, and the logic behind everyday software.',
    plainDescription: 'Learn how to give a computer clear steps.',
    progress: 0,
    lessonsDone: 0,
    lessonsTotal: 3,
    size: '14 MB',
    color: 'sky',
    icon: Code2,
  },
  {
    id: 'money',
    subject: 'Financial literacy',
    title: 'Money choices',
    description: 'Practice budgeting, comparing prices, and understanding savings.',
    plainDescription: 'Learn simple ways to plan, spend, and save money.',
    progress: 0,
    lessonsDone: 0,
    lessonsTotal: 3,
    size: '10 MB',
    color: 'yellow',
    icon: BriefcaseBusiness,
  },
]

export const courseContent = {
  algebra: {
    videoTitle: 'How equations stay balanced',
    videoSlides: [
      ['An equation is like a balanced scale.', 'Both sides must have the same value.'],
      ['Undo one operation at a time.', 'Do the same thing to both sides.'],
      ['Check your answer.', 'Put the number back into the original equation.'],
    ],
    questions: [
      {
        title: 'One-step equations',
        prompt: 'Solve: x + 6 = 14',
        options: ['x = 6', 'x = 8', 'x = 20'],
        correct: 1,
        explanation: 'Subtract 6 from both sides. 14 − 6 = 8.',
      },
      {
        title: 'Two-step equations',
        prompt: 'Solve: 3x − 5 = 16',
        options: ['x = 5', 'x = 7', 'x = 11'],
        correct: 1,
        explanation: 'Add 5 to get 21, then divide by 3. x = 7.',
      },
      {
        title: 'Equations in context',
        prompt: 'Three equal notebooks cost $12 total. What is the cost of one notebook?',
        options: ['$3', '$4', '$9'],
        correct: 1,
        explanation: 'Divide the total by 3. $12 ÷ 3 = $4.',
      },
    ],
  },
  science: {
    videoTitle: 'Energy moves through ecosystems',
    videoSlides: [
      ['Plants capture energy from sunlight.', 'They are producers in a food web.'],
      ['Animals get energy by eating.', 'Consumers depend on plants or other animals.'],
      ['Decomposers recycle matter.', 'They return nutrients to the environment.'],
    ],
    questions: [
      {
        title: 'Producers',
        prompt: 'Which organism is a producer?',
        options: ['A mushroom', 'A grass plant', 'A hawk'],
        correct: 1,
        explanation: 'Grass uses sunlight to make its own food, so it is a producer.',
      },
      {
        title: 'Food webs',
        prompt: 'If fewer plants grow, what will most likely happen first?',
        options: ['Plant-eaters have less food', 'The Sun gets brighter', 'Rocks begin to grow'],
        correct: 0,
        explanation: 'Plant-eaters depend directly on plants for energy.',
      },
      {
        title: 'Adaptations',
        prompt: 'Which trait helps a cactus survive in a dry environment?',
        options: ['Wide, thin leaves', 'A thick water-storing stem', 'Soft roots above the soil'],
        correct: 1,
        explanation: 'A thick stem stores water for long dry periods.',
      },
    ],
  },
  reading: {
    videoTitle: 'Find the main idea and evidence',
    videoSlides: [
      ['Ask what the text is mostly about.', 'That points you toward the main idea.'],
      ['Look for details that repeat or connect.', 'Strong evidence directly supports the idea.'],
      ['Explain the connection in your own words.', 'Do not just copy the sentence.'],
    ],
    questions: [
      {
        title: 'Main idea',
        prompt: 'A paragraph explains three ways trees cool a city. What is its main idea?',
        options: ['Cities have roads', 'Trees help keep cities cooler', 'Some trees are tall'],
        correct: 1,
        explanation: 'The repeated details all explain how trees reduce heat.',
      },
      {
        title: 'Best evidence',
        prompt: 'Which detail best supports the idea that exercise can improve focus?',
        options: ['The gym has blue walls', 'Students focused longer after a short walk', 'Walking shoes come in many colors'],
        correct: 1,
        explanation: 'That detail directly connects movement with improved focus.',
      },
      {
        title: 'Point of view',
        prompt: 'A narrator says “I packed my bag and hurried outside.” Which point of view is used?',
        options: ['First person', 'Second person', 'Third person'],
        correct: 0,
        explanation: 'The word “I” shows that the narrator is telling their own experience.',
      },
    ],
  },
  history: {
    videoTitle: 'How local decisions get made',
    videoSlides: [
      ['Communities identify a shared need.', 'Residents can speak, write, organize, and vote.'],
      ['Local leaders review evidence and options.', 'Budgets and laws shape what is possible.'],
      ['The public can track the result.', 'Civic participation continues after a decision.'],
    ],
    questions: [
      {
        title: 'Local government',
        prompt: 'Which issue is most likely handled by a city council?',
        options: ['A neighborhood bus route', 'A treaty between countries', 'The value of national currency'],
        correct: 0,
        explanation: 'Local transportation routes are commonly planned by city or county government.',
      },
      {
        title: 'Primary sources',
        prompt: 'Which item is a primary source about a town meeting?',
        options: ['A diary written by someone who attended', 'A modern textbook summary', 'A fictional story set in the town'],
        correct: 0,
        explanation: 'The diary was created by a person who directly experienced the event.',
      },
      {
        title: 'Civic participation',
        prompt: 'What is one responsible way to share a concern with local leaders?',
        options: ['Spread an unverified rumor', 'Speak during public comment', 'Damage public property'],
        correct: 1,
        explanation: 'Public comment is a direct, peaceful way to take part in local government.',
      },
    ],
  },
  computing: {
    videoTitle: 'Algorithms are clear steps',
    videoSlides: [
      ['An algorithm is a sequence of instructions.', 'The order of the steps matters.'],
      ['Conditions help a program choose.', 'For example: if it rains, open an umbrella.'],
      ['Testing finds mistakes.', 'Try normal, unusual, and boundary cases.'],
    ],
    questions: [
      {
        title: 'Sequences',
        prompt: 'Which instruction should come first when signing in?',
        options: ['Open the website', 'Click submit', 'Read the welcome page'],
        correct: 0,
        explanation: 'The website must be open before you can enter and submit information.',
      },
      {
        title: 'Conditions',
        prompt: 'Which statement uses a condition?',
        options: ['Repeat five times', 'If the password is correct, open the account', 'Add two numbers'],
        correct: 1,
        explanation: '“If” checks whether something is true before choosing the next action.',
      },
      {
        title: 'Debugging',
        prompt: 'What should you do first when code gives the wrong result?',
        options: ['Delete the whole program', 'Test one small part and inspect its values', 'Change random lines'],
        correct: 1,
        explanation: 'Small, focused tests help you find the exact step causing the problem.',
      },
    ],
  },
  money: {
    videoTitle: 'A budget gives every dollar a job',
    videoSlides: [
      ['Start with money coming in.', 'Use actual amounts instead of guesses when possible.'],
      ['List needs before wants.', 'Food, housing, and transportation come first.'],
      ['Save a small amount consistently.', 'A simple habit grows over time.'],
    ],
    questions: [
      {
        title: 'Budgeting',
        prompt: 'You have $25 and need a $15 bus pass. What is left after buying it?',
        options: ['$5', '$10', '$40'],
        correct: 1,
        explanation: '$25 − $15 = $10.',
      },
      {
        title: 'Unit prices',
        prompt: 'Four notebooks cost $8. What is the price per notebook?',
        options: ['$2', '$4', '$12'],
        correct: 0,
        explanation: '$8 ÷ 4 = $2 per notebook.',
      },
      {
        title: 'Saving',
        prompt: 'Saving $5 each week for 6 weeks gives you how much?',
        options: ['$11', '$25', '$30'],
        correct: 2,
        explanation: '$5 × 6 = $30.',
      },
    ],
  },
}

export const assignmentsSeed = [
  { id: 1, courseId: 'algebra', course: 'Math', title: 'Practice: equations', instructions: 'Answer the three equation questions and explain one step in your own words.', dueOffsetDays: 0, dueHour: 23, closeOffsetDays: 1, status: 'due', icon: Calculator },
  { id: 2, courseId: 'science', course: 'Science', title: 'Ecosystem worksheet', instructions: 'Complete the producer, consumer, and adaptation questions.', dueOffsetDays: 1, dueHour: 17, closeOffsetDays: 3, status: 'todo', icon: FlaskConical },
  { id: 3, courseId: 'reading', course: 'English', title: 'Reading response', instructions: 'Choose the best evidence and write one sentence explaining why it supports the main idea.', dueOffsetDays: 3, dueHour: 17, closeOffsetDays: 5, status: 'todo', icon: BookOpen },
]

export const skills = [
  { id: 'scams', title: 'Spot online scams', description: 'Learn the warning signs and protect your personal information.', plainDescription: 'Learn how to notice fake messages and stay safe.', duration: '12 min', level: 'Beginner', audience: 'Everyone', category: 'Online safety', icon: ShieldCheck, color: 'blue', featured: true },
  { id: 'email', title: 'Email with confidence', description: 'Write, send, reply, and recognize important school messages.', plainDescription: 'Practice sending and replying to school email.', duration: '15 min', level: 'Beginner', audience: 'Students', category: 'Everyday basics', icon: Mail, color: 'coral' },
  { id: 'browser', title: 'Find your way online', description: 'Use tabs, links, downloads, and search more confidently.', plainDescription: 'Learn what tabs, links, downloads, and search do.', duration: '18 min', level: 'Beginner', audience: 'Everyone', category: 'Everyday basics', icon: Globe2, color: 'green' },
  { id: 'video', title: 'Join a school video call', description: 'Learn the controls for class meetings and parent conferences.', plainDescription: 'Practice joining, muting, and leaving a video call.', duration: '10 min', level: 'Beginner', audience: 'Families', category: 'School tools', icon: Video, color: 'purple' },
  { id: 'device', title: 'Know your device', description: 'Manage storage, updates, accessibility, and battery life.', plainDescription: 'Learn the main settings on your phone, tablet, or computer.', duration: '14 min', level: 'Beginner', audience: 'Families', category: 'Device basics', icon: Smartphone, color: 'sky' },
  { id: 'mouse', title: 'Click, type, and navigate', description: 'A simple guide to trackpads, keyboards, and common controls.', plainDescription: 'Practice using a keyboard, mouse, or trackpad.', duration: '16 min', level: 'Beginner', audience: 'Families', category: 'Device basics', icon: MousePointer2, color: 'yellow' },
]

export const hubs = [
  { id: 1, name: 'Riverside Community Center', type: 'Community center', distance: 0.6, walk: '8 min walk', address: '1400 Riverside Dr', city: 'Detroit', zip: '48216', hours: 'Open until 6:00 PM', services: ['Wi-Fi & sync', 'Device support', 'Learning space'], x: 46, y: 40 },
  { id: 2, name: 'Eastside Public Library', type: 'Library', distance: 1.2, walk: '16 min walk', address: '225 Oak Street', city: 'Detroit', zip: '48207', hours: 'Open until 8:00 PM', services: ['Wi-Fi & sync', 'Device loans', 'Printing'], x: 66, y: 64 },
  { id: 3, name: 'Jefferson Middle School', type: 'School', distance: 1.8, walk: '8 min by bus', address: '880 Jefferson Ave', city: 'Detroit', zip: '48214', hours: 'Hub open 3:00–7:00 PM', services: ['Wi-Fi & sync', 'Teacher help', 'Device repair'], x: 27, y: 70 },
  { id: 4, name: 'North Park Recreation Center', type: 'Recreation center', distance: 2.4, walk: '12 min by bus', address: '92 North Park Rd', city: 'Detroit', zip: '48203', hours: 'Open until 9:00 PM', services: ['Wi-Fi & sync', 'Family workshops'], x: 76, y: 24 },
]

export const devicePrograms = [
  { id: 'tablet', title: 'SyncED refurbished device', partner: 'School and community partners', description: 'A tested device with SyncED installed, a protective case, and a charging cable.', availability: 'Applications open', icon: Smartphone },
  { id: 'loan', title: 'Library laptop loan', partner: 'Eastside Public Library', description: 'Borrow a Chromebook for up to eight weeks with free pickup at a community hub.', availability: '6 available nearby', icon: Laptop },
  { id: 'hotspot', title: 'School hotspot program', partner: 'District technology office', description: 'A limited-data mobile hotspot for households referred by a participating school.', availability: 'Join the waitlist', icon: Wifi },
]

export const achievements = [
  { id: 'first', title: 'First step', description: 'Complete your first lesson', threshold: 10, icon: Sprout },
  { id: 'offline', title: 'Offline explorer', description: 'Finish three downloaded lessons', threshold: 75, icon: Globe2 },
  { id: 'streak', title: 'Steady learner', description: 'Reach a four-day learning streak', threshold: 125, icon: Atom },
  { id: 'helper', title: 'Family helper', description: 'Complete a family activity', threshold: 175, icon: ShieldCheck },
  { id: 'scholar', title: 'Community scholar', description: 'Earn 300 learning points', threshold: 300, icon: Palette },
]

export const leaderboard = [
  { rank: 1, name: 'A. Rivera', points: 530, city: 'Phoenix' },
  { rank: 2, name: 'J. Kim', points: 485, city: 'Detroit' },
  { rank: 3, name: 'S. Patel', points: 450, city: 'Cary' },
  { rank: 4, name: 'Maya J.', points: 240, city: 'Detroit', current: true },
  { rank: 5, name: 'L. Brown', points: 225, city: 'Atlanta' },
]

export const evidence = [
  {
    stat: '1.3B',
    label: 'school-age children lacked internet access at home worldwide',
    detail: 'UNICEF and ITU reported that two-thirds of school-age children were unconnected at home in their global 2020 analysis.',
    source: 'UNICEF + ITU',
    url: 'https://www.unicef.org/press-releases/two-thirds-worlds-school-age-children-have-no-internet-access-home-new-unicef-itu',
  },
  {
    stat: '12%',
    label: 'of people in the U.S. lived in households with no internet connection in 2023',
    detail: 'NTIA also found that lower-income households were less likely to have both fixed and mobile connections.',
    source: 'U.S. NTIA',
    url: 'https://www.ntia.gov/blog/2024/new-ntia-data-show-13-million-more-internet-users-us-2023-2021',
  },
  {
    stat: '69%',
    label: 'of students in remote rural U.S. areas had fixed broadband at home',
    detail: 'NCES found lower fixed-broadband access for remote rural students than most other locations in its 2019 data.',
    source: 'NCES',
    url: 'https://nces.ed.gov/programs/coe/indicator/lfc',
  },
]
