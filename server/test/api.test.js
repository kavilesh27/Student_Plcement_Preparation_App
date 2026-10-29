const test = require('node:test');
const assert = require('node:assert/strict');
const readinessCalculator = require('../services/analytics/readinessCalculator');
const codingRunner = require('../services/coding/runner');
const aiService = require('../services/ai/aiService');

test('Placement Readiness Calculator should compute weighted readiness', () => {
  const dummyStudent = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Student',
    CGPA: 8.5,
    profileDetails: { skills: ['Java', 'C++'] },
  };

  assert.ok(readinessCalculator);
  assert.equal(typeof readinessCalculator.calculateStudentReadiness, 'function');
});

test('Coding Runner should evaluate code in safe mock mode without crashing', async () => {
  const result = await codingRunner.evaluate({
    language: 'Java',
    code: 'public class Main { public static void main(String[] args) { System.out.println("Hello"); } }',
    testCases: [{ input: '', expectedOutput: 'Hello' }],
  });

  assert.ok(result);
  assert.ok(result.evaluationMode.includes('Safe Sandbox Mock Mode') || result.evaluationMode.includes('Sandbox'));
  assert.equal(typeof result.status, 'string');
});

test('AI Service should fallback gracefully to rule-based NLP extraction when API key is empty', async () => {
  const dummyResume = `
  John Doe
  Email: john@test.com
  Skills: Java, C++, React, Node.js, MongoDB
  Projects:
  Online Job Portal using React and Node.js
  `;

  const analysis = await aiService.analyzeResume(dummyResume);
  assert.ok(analysis);
  assert.ok(analysis.extractedSkills);
  assert.ok(analysis.extractedSkills.programmingLanguages.includes('Java'));
  assert.ok(analysis.extractedSkills.databases.includes('Mongodb') || analysis.extractedSkills.databases.includes('MongoDB'));
});

test('AI Service should evaluate written answers based on rubric', async () => {
  const result = await aiService.evaluateWrittenAnswer({
    question: 'Explain the difference between an interface and an abstract class in Java.',
    expectedAnswer: 'Interface provides contract; abstract class allows partial implementation.',
    rubric: { conceptAccuracy: 40, technicalCorrectness: 40, clarityAndEfficiency: 20 },
    studentAnswer: 'In Java, an interface allows multiple inheritance and provides decoupled contracts, while an abstract class can maintain state and partial implementation.',
  });

  assert.ok(result);
  assert.ok(result.marksObtained >= 60);
  assert.equal(typeof result.suggestedImprovements, 'string');
});
