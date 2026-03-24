export const itLessons = {
  frontend: [
    {
      id: 'html',
      title: 'HTML Basics',
      description: 'Learn page structure and semantic tags.',
      content: '<p>HTML defines structure of web pages.</p>',
      example: '<h1>Title</h1>',
      task: {
        type: 'input',
        question: 'Tag for a level 1 heading?',
        answer: 'h1'
      }
    },
    {
      id: 'css',
      title: 'CSS Basics',
      description: 'Style elements with selectors and properties.',
      content: '<p>CSS controls colors and layout.</p>',
      example: 'p { color: red; }',
      task: {
        type: 'input',
        question: 'Property to set text color?',
        answer: 'color'
      }
    },
    {
      id: 'boxmodel',
      title: 'Box Model',
      description: 'Understand margin, border, padding.',
      content: '<p>Every element has a box model.</p>',
      example: 'div { margin: 10px; padding: 5px; border: 1px solid #000; }',
      task: {
        type: 'multiple',
        question: 'Which are box model parts?',
        options: [
          'margin, border, padding',
          'display, position, z-index',
          'flex, grid'
        ],
        answer: 'margin, border, padding'
      }
    }
  ]
};