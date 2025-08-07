// client/constants/quizzes.js
export const quizzes = [
    {
      id: 'q1',
      question: 'In the 50/30/20 rule, what percentage of your income goes to “wants”?',
      options: [
        { text: '20%', correct: false },
        { text: '30%', correct: true },
        { text: '50%', correct: false },
        { text: '0%',  correct: false },
      ],
    },
    {
      id: 'q2',
      question: 'Which of these is a “need” rather than a “want”?',
      options: [
        { text: 'Streaming subscription', correct: false },
        { text: 'Groceries',          correct: true  },
        { text: 'Dining out',         correct: false },
        { text: 'Concert tickets',    correct: false },
      ],
    },
    {
      id: 'q3',
      question: 'What should you build first before investing?',
      options: [
        { text: 'Emergency fund',      correct: true  },
        { text: 'Stock portfolio',     correct: false },
        { text: 'Luxury purchases',    correct: false },
        { text: 'A new car',           correct: false },
      ],
    },
    // …add 3–5 more questions
  ];
  