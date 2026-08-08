const lessonSpecs = [
  { id: 'geometry', subject: 'Math', title: 'Geometry and shapes', keyIdea: 'Shapes are classified by their sides, angles, and other properties.', example: 'A triangle has three sides, while a rectangle has four right angles.' },
  { id: 'fractions', subject: 'Math', title: 'Fractions and decimals', keyIdea: 'Fractions and decimals are two ways to represent parts of a whole.', example: 'One half, 1/2, and 0.5 all represent the same amount.' },
  { id: 'ratios', subject: 'Math', title: 'Ratios and percentages', keyIdea: 'Ratios compare quantities, and percentages compare an amount with 100.', example: 'Three out of four is the same as 3/4 or 75%.' },
  { id: 'data-graphs', subject: 'Math', title: 'Data and graphs', keyIdea: 'Graphs organize data so patterns and comparisons are easier to see.', example: 'A bar graph can compare how many books four classes read.' },
  { id: 'measurement', subject: 'Math', title: 'Measurement', keyIdea: 'Choose a unit that matches what you are measuring, then convert carefully.', example: 'One meter equals 100 centimeters.' },

  { id: 'matter', subject: 'Science', title: 'Matter and materials', keyIdea: 'Matter has properties and can change between solid, liquid, and gas.', example: 'Ice melts into liquid water when it gains heat.' },
  { id: 'forces', subject: 'Science', title: 'Forces and motion', keyIdea: 'A force is a push or pull that can change an object’s motion.', example: 'Pushing a cart harder can make it speed up faster.' },
  { id: 'earth-weather', subject: 'Science', title: 'Earth and weather', keyIdea: 'Weather changes as water and energy move through Earth’s systems.', example: 'Water vapor cools and condenses to form clouds.' },
  { id: 'space', subject: 'Science', title: 'Space science', keyIdea: 'Gravity shapes the motion of planets, moons, and other objects in space.', example: 'Earth travels around the Sun while the Moon travels around Earth.' },
  { id: 'energy', subject: 'Science', title: 'Energy and electricity', keyIdea: 'Energy can move and change form, including in a closed electric circuit.', example: 'A bulb lights when a complete circuit lets electric current flow.' },

  { id: 'grammar', subject: 'English', title: 'Grammar foundations', keyIdea: 'A complete sentence expresses a full thought with a subject and a predicate.', example: 'The students finished their project is a complete sentence.' },
  { id: 'vocabulary', subject: 'English', title: 'Vocabulary builder', keyIdea: 'Context, roots, prefixes, and suffixes can reveal a word’s meaning.', example: 'The prefix re- in reread means to read again.' },
  { id: 'paragraph-writing', subject: 'English', title: 'Writing clear paragraphs', keyIdea: 'A strong paragraph has one main idea supported by connected details.', example: 'A topic sentence introduces the point, and detail sentences explain it.' },
  { id: 'poetry', subject: 'English', title: 'Poetry and figurative language', keyIdea: 'Poets use sound, imagery, and comparisons to create meaning and feeling.', example: 'Her smile was sunshine is a metaphor comparing a smile with sunshine.' },
  { id: 'research', subject: 'English', title: 'Research and sources', keyIdea: 'Reliable research uses trustworthy sources and clearly credits their ideas.', example: 'A student can cite a museum article and name its author and date.' },

  { id: 'ancient', subject: 'History', title: 'Ancient civilizations', keyIdea: 'Early civilizations grew where people could farm, trade, and organize communities.', example: 'Many early cities developed near rivers that supported farming and travel.' },
  { id: 'geography', subject: 'History', title: 'World geography', keyIdea: 'Geography studies places and how people interact with environments.', example: 'A map can show how mountains affect travel and settlement.' },
  { id: 'us-history', subject: 'History', title: 'U.S. history foundations', keyIdea: 'Founding documents created a government with shared powers and protected rights.', example: 'The Constitution divides power among three branches of government.' },
  { id: 'civil-rights', subject: 'History', title: 'Civil rights and change', keyIdea: 'People have organized, spoken out, and changed laws to expand equal rights.', example: 'Peaceful marches helped draw attention to unfair laws and practices.' },
  { id: 'global-connections', subject: 'History', title: 'Global connections', keyIdea: 'Trade, migration, and communication connect people and places across the world.', example: 'A product may be designed in one country and assembled in another.' },

  { id: 'block-coding', subject: 'Computer science', title: 'Programming with blocks', keyIdea: 'Block programs combine events, sequences, loops, and conditions.', example: 'A when-clicked block can start a character’s movement sequence.' },
  { id: 'web-basics', subject: 'Computer science', title: 'Web basics', keyIdea: 'HTML gives a web page structure, while CSS controls its appearance.', example: 'An HTML heading names a section, and CSS can change its color.' },
  { id: 'databases', subject: 'Computer science', title: 'Data and databases', keyIdea: 'Databases organize related information into records and fields.', example: 'A library record can store a book’s title, author, and checkout status.' },
  { id: 'cybersecurity', subject: 'Computer science', title: 'Cybersecurity basics', keyIdea: 'Strong security uses unique passwords, updates, and careful checks before sharing.', example: 'Two-step verification adds a second check after a password.' },
  { id: 'ai-literacy', subject: 'Computer science', title: 'AI and responsible technology', keyIdea: 'AI finds patterns in data, but people must check its accuracy and fairness.', example: 'A person should verify an AI answer with a reliable source before using it.' },

  { id: 'income', subject: 'Financial literacy', title: 'Earning and income', keyIdea: 'Income is money received from work or other sources before planning expenses.', example: 'Net pay is the amount left after taxes and other deductions.' },
  { id: 'banking', subject: 'Financial literacy', title: 'Banking basics', keyIdea: 'Checking accounts support spending, while savings accounts help money grow safely.', example: 'A bank statement lists deposits, purchases, fees, and the current balance.' },
  { id: 'credit', subject: 'Financial literacy', title: 'Credit and borrowing', keyIdea: 'Borrowed money must be repaid, often with interest and on a schedule.', example: 'Paying a credit balance on time can avoid late fees.' },
  { id: 'smart-shopping', subject: 'Financial literacy', title: 'Smart shopping', keyIdea: 'Compare unit prices, quality, and total cost before choosing what to buy.', example: 'Dividing price by quantity shows which package has the lower unit price.' },
  { id: 'future-planning', subject: 'Financial literacy', title: 'Planning for the future', keyIdea: 'Clear goals and regular saving turn future plans into manageable steps.', example: 'Saving a set amount each month can build an education or emergency fund.' },
]

const subjectStyle = {
  Math: { color: 'blue', size: '12 MB' },
  Science: { color: 'green', size: '14 MB' },
  English: { color: 'purple', size: '10 MB' },
  History: { color: 'coral', size: '12 MB' },
  'Computer science': { color: 'sky', size: '11 MB' },
  'Financial literacy': { color: 'yellow', size: '9 MB' },
}

const generic = {
  wrongIdeaOne: 'It means guessing without checking the information.',
  wrongIdeaTwo: 'It only works when no facts or examples are available.',
  wrongExampleOne: 'Skipping every step and choosing an answer at random.',
  wrongExampleTwo: 'Ignoring the lesson and leaving the work unfinished.',
  strategy: 'Use the key idea, study the example, and check your work.',
}

export const expandedLessonStrings = [
  ...lessonSpecs.flatMap(({ title, keyIdea, example }) => [title, keyIdea, example]),
  ...Object.values(generic),
  'Key idea',
  'Example',
  'Smart strategy',
  'Use the skill',
  'Which statement best explains {lesson}?',
  'Which example matches this lesson?',
  'Which lesson are you practicing right now?',
]

export function buildExpandedLessons(subjectIcons) {
  const bySubject = lessonSpecs.reduce((groups, lesson) => {
    groups[lesson.subject] ||= []
    groups[lesson.subject].push(lesson)
    return groups
  }, {})
  const courses = []
  const content = {}

  lessonSpecs.forEach((lesson) => {
    const style = subjectStyle[lesson.subject]
    const peers = bySubject[lesson.subject]
    const peerIndex = peers.findIndex((item) => item.id === lesson.id)
    const previous = peers[(peerIndex + peers.length - 1) % peers.length]
    const next = peers[(peerIndex + 1) % peers.length]

    courses.push({
      ...lesson,
      description: lesson.keyIdea,
      plainDescription: lesson.keyIdea,
      questionsTotal: 3,
      size: style.size,
      version: 1,
      updatedAt: '2026-08-07T00:00:00.000Z',
      color: style.color,
      icon: subjectIcons[lesson.subject],
    })

    content[lesson.id] = {
      videoTitle: lesson.title,
      videoSlides: [
        ['Key idea', lesson.keyIdea],
        ['Example', lesson.example],
        ['Smart strategy', generic.strategy],
      ],
      questions: [
        {
          title: 'Key idea',
          prompt: 'Which statement best explains {lesson}?',
          options: [lesson.keyIdea, generic.wrongIdeaOne, generic.wrongIdeaTwo],
          correct: 0,
          explanation: lesson.keyIdea,
        },
        {
          title: 'Example',
          prompt: 'Which example matches this lesson?',
          options: [generic.wrongExampleOne, lesson.example, generic.wrongExampleTwo],
          correct: 1,
          explanation: lesson.example,
        },
        {
          title: 'Use the skill',
          prompt: 'Which lesson are you practicing right now?',
          options: [previous.title, lesson.title, next.title],
          correct: 1,
          explanation: generic.strategy,
        },
      ],
    }
  })

  return { courses, content }
}
