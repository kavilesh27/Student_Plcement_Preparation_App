require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Department = require('../models/Department');
const Company = require('../models/Company');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const Resume = require('../models/Resume');
const AIQuestionSet = require('../models/AIQuestionSet');
const CompanyEligibility = require('../models/CompanyEligibility');
const TrainingCourse = require('../models/TrainingCourse');
const TrainingProgress = require('../models/TrainingProgress');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const CodingSubmission = require('../models/CodingSubmission');
const StudyPlan = require('../models/StudyPlan');
const eligibilityEvaluator = require('../services/analytics/eligibilityEvaluator');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Company.deleteMany(),
      Assessment.deleteMany(),
      Question.deleteMany(),
      TestAttempt.deleteMany(),
      Resume.deleteMany(),
      AIQuestionSet.deleteMany(),
      CompanyEligibility.deleteMany(),
      TrainingCourse.deleteMany(),
      TrainingProgress.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
      CodingSubmission.deleteMany(),
      StudyPlan.deleteMany(),
    ]);

    const defaultPassword = 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    console.log('[Seed] Seeding Academic Departments...');
    const depts = await Department.insertMany([
      { name: 'Computer Science and Engineering', code: 'CSE', description: 'Department of Computer Science & Engineering', hodName: 'Dr. Ramesh Kumar', status: 'active' },
      { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology', hodName: 'Dr. Priya Sharma', status: 'active' },
      { name: 'Electronics and Communication Engineering', code: 'ECE', description: 'Department of Electronics & Communication', hodName: 'Dr. S. Venkataraman', status: 'active' },
      { name: 'Artificial Intelligence and Data Science', code: 'AIDS', description: 'Department of AI & Data Science', hodName: 'Dr. Ananya Roy', status: 'active' },
      { name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering', hodName: 'Dr. Rajesh Patel', status: 'active' },
    ]);

    console.log('[Seed] Seeding Admin and Staff accounts...');
    const adminUser = await User.create({
      name: 'Dr. V. Rajagopalan',
      email: 'admin@college.edu',
      passwordHash,
      role: 'admin',
      department: 'Computer Science and Engineering',
      phoneNumber: '+91 98765 43210',
      accountStatus: 'active',
      profileDetails: { bio: 'Director of University Placements & Academic Industry Relations' },
    });

    const staffAccounts = await User.insertMany([
      {
        name: 'Prof. Arvind Subramanian',
        email: 'placement.coordinator@college.edu',
        passwordHash,
        role: 'staff',
        department: 'Computer Science and Engineering',
        phoneNumber: '+91 98765 11111',
        accountStatus: 'active',
        profileDetails: { bio: 'Head Training & Placement Coordinator for Engineering Campus Drives' },
      },
      {
        name: 'Dr. Meera Nambiar',
        email: 'trainer.coding@college.edu',
        passwordHash,
        role: 'staff',
        department: 'Information Technology',
        phoneNumber: '+91 98765 22222',
        accountStatus: 'active',
        profileDetails: { bio: 'Lead Technical Interviewer & DSA Programming Coach' },
      },
      {
        name: 'Prof. Suresh Nair',
        email: 'faculty.advisor@college.edu',
        passwordHash,
        role: 'staff',
        department: 'Electronics and Communication Engineering',
        phoneNumber: '+91 98765 33333',
        accountStatus: 'active',
        profileDetails: { bio: 'Senior Faculty Advisor & Student Mentoring Lead' },
      },
    ]);

    console.log('[Seed] Seeding 20 diverse Student accounts...');
    const studentDataConfig = [
      { name: 'Aditya Verma', id: 'STU2026CS001', dept: 'Computer Science and Engineering', cgpa: 8.9, backlogs: 'No Backlogs', count: 0, streak: 12 },
      { name: 'Sneha Patel', id: 'STU2026CS002', dept: 'Computer Science and Engineering', cgpa: 9.2, backlogs: 'No Backlogs', count: 0, streak: 15 },
      { name: 'Rohan Gupta', id: 'STU2026IT003', dept: 'Information Technology', cgpa: 7.4, backlogs: 'No Backlogs', count: 0, streak: 8 },
      { name: 'Pooja Iyer', id: 'STU2026CS004', dept: 'Computer Science and Engineering', cgpa: 8.1, backlogs: 'No Backlogs', count: 0, streak: 6 },
      { name: 'Karthik Raja', id: 'STU2026EC005', dept: 'Electronics and Communication Engineering', cgpa: 6.8, backlogs: 'Active Backlogs', count: 1, streak: 3 },
      { name: 'Ananya Deshmukh', id: 'STU2026AI006', dept: 'Artificial Intelligence and Data Science', cgpa: 8.7, backlogs: 'No Backlogs', count: 0, streak: 10 },
      { name: 'Siddharth Sen', id: 'STU2026CS007', dept: 'Computer Science and Engineering', cgpa: 7.8, backlogs: 'No Backlogs', count: 0, streak: 7 },
      { name: 'Divya Nair', id: 'STU2026IT008', dept: 'Information Technology', cgpa: 8.4, backlogs: 'No Backlogs', count: 0, streak: 9 },
      { name: 'Manoj Kumar', id: 'STU2026ME009', dept: 'Mechanical Engineering', cgpa: 6.2, backlogs: 'Active Backlogs', count: 2, streak: 2 },
      { name: 'Ritu Bhattacharya', id: 'STU2026CS010', dept: 'Computer Science and Engineering', cgpa: 9.5, backlogs: 'No Backlogs', count: 0, streak: 20 },
      { name: 'Vikram Joshi', id: 'STU2026EC011', dept: 'Electronics and Communication Engineering', cgpa: 7.1, backlogs: 'Cleared Backlogs', count: 0, streak: 4 },
      { name: 'Deepika Menon', id: 'STU2026AI012', dept: 'Artificial Intelligence and Data Science', cgpa: 8.3, backlogs: 'No Backlogs', count: 0, streak: 11 },
      { name: 'Rahul Sharma', id: 'STU2026CS013', dept: 'Computer Science and Engineering', cgpa: 5.9, backlogs: 'Active Backlogs', count: 2, streak: 1 },
      { name: 'Swati Reddy', id: 'STU2026IT014', dept: 'Information Technology', cgpa: 7.9, backlogs: 'No Backlogs', count: 0, streak: 5 },
      { name: 'Nikhil Agarwal', id: 'STU2026CS015', dept: 'Computer Science and Engineering', cgpa: 8.6, backlogs: 'No Backlogs', count: 0, streak: 14 },
      { name: 'Harish Chandra', id: 'STU2026EC016', dept: 'Electronics and Communication Engineering', cgpa: 6.4, backlogs: 'Pending Verification', count: 0, streak: 2 },
      { name: 'Kavita Pillai', id: 'STU2026CS017', dept: 'Computer Science and Engineering', cgpa: 8.0, backlogs: 'No Backlogs', count: 0, streak: 6 },
      { name: 'Arjun Nambeesan', id: 'STU2026AI018', dept: 'Artificial Intelligence and Data Science', cgpa: 7.6, backlogs: 'No Backlogs', count: 0, streak: 4 },
      { name: 'Varun Chawla', id: 'STU2026CS019', dept: 'Computer Science and Engineering', cgpa: 8.8, backlogs: 'No Backlogs', count: 0, streak: 13 },
      { name: 'Bhavna Kulkarni', id: 'STU2026IT020', dept: 'Information Technology', cgpa: 7.2, backlogs: 'No Backlogs', count: 0, streak: 5 },
    ];

    const studentDocs = [];
    for (const s of studentDataConfig) {
      const email = `${s.name.toLowerCase().replace(' ', '.')}@student.college.edu`;
      studentDocs.push({
        name: s.name,
        email,
        passwordHash,
        role: 'student',
        studentId: s.id,
        department: s.dept,
        academicYear: '4th Year',
        semester: 7,
        graduationYear: 2026,
        CGPA: s.cgpa,
        backlogStatus: s.backlogs,
        activeBacklogsCount: s.count,
        phoneNumber: '+91 9' + Math.floor(100000000 + Math.random() * 900000000),
        profileDetails: {
          bio: `Final-year ${s.dept} undergraduate passionate about software engineering, data structures, and algorithms.`,
          github: `https://github.com/${s.name.toLowerCase().replace(' ', '')}`,
          linkedin: `https://linkedin.com/in/${s.name.toLowerCase().replace(' ', '-')}`,
          skills: ['Java', 'C++', 'Data Structures', 'SQL', 'React', 'Problem Solving'],
          targetCompanies: ['TCS', 'Zoho', 'Infosys', 'Accenture'],
        },
        accountStatus: 'active',
        currentStreak: s.streak,
        longestStreak: s.streak + 2,
        badges: [
          { id: 'early_starter', title: 'Early Achiever', icon: 'Sparkles', description: 'Consistently logged in for practice.', earnedAt: new Date() },
          { id: 'streak_master', title: 'Streak Champion', icon: 'Flame', description: 'Maintained consecutive daily practice.', earnedAt: new Date() }
        ],
      });
    }

    const createdStudents = await User.insertMany(studentDocs);

    console.log('[Seed] Seeding Comprehensive Question Bank (C, C++, Java, Aptitude, Coding)...');
    const questions = await Question.insertMany([
      // C Programming Questions
      {
        questionText: 'What is the output of the following C code segment?\n\nint a = 10, *p = &a;\n*p = *p + 5;\nprintf("%d %d", a, *p);',
        questionType: 'output_prediction',
        language: 'C',
        topic: 'Pointers',
        difficulty: 'Beginner',
        options: [
          { id: 'A', text: '10 10' },
          { id: 'B', text: '15 15' },
          { id: 'C', text: '10 15' },
          { id: 'D', text: 'Compilation Error' }
        ],
        correctAnswer: 'B',
        explanation: 'The pointer `p` points to the address of `a`. Dereferencing `*p` modifies the underlying memory of `a` directly. Therefore both `a` and `*p` evaluate to 15.',
        marks: 5,
        tags: ['Pointers', 'C', 'Memory'],
      },
      {
        questionText: 'Which of the following dynamic memory allocation functions in C initializes allocated memory bytes to zero?',
        questionType: 'mcq',
        language: 'C',
        topic: 'Dynamic Memory',
        difficulty: 'Beginner',
        options: [
          { id: 'A', text: 'malloc()' },
          { id: 'B', text: 'calloc()' },
          { id: 'C', text: 'realloc()' },
          { id: 'D', text: 'free()' }
        ],
        correctAnswer: 'B',
        explanation: 'calloc(n, size) allocates contiguous blocks of memory and automatically clears all allocated bytes to zero.',
        marks: 5,
        tags: ['Memory Allocation', 'C'],
      },
      {
        questionText: 'In C, what does the "free()" function do when called on a dynamically allocated pointer?',
        questionType: 'mcq',
        language: 'C',
        topic: 'Dynamic Memory',
        difficulty: 'Intermediate',
        options: [
          { id: 'A', text: 'Sets the pointer variable to NULL automatically' },
          { id: 'B', text: 'Releases the allocated heap memory back to the OS without altering the pointer variable' },
          { id: 'C', text: 'Deletes the pointer variable from the stack' },
          { id: 'D', text: 'Zeroes out the memory contents' }
        ],
        correctAnswer: 'B',
        explanation: 'free(ptr) marks heap memory as reusable, but leaves ptr holding the same memory address (creating a dangling pointer unless explicitly set to NULL).',
        marks: 5,
        tags: ['Memory Management', 'Pointers'],
      },

      // C++ Questions
      {
        questionText: 'In C++, what is the primary purpose of declaring a destructor as "virtual" in a base class?',
        questionType: 'mcq',
        language: 'C++',
        topic: 'Polymorphism & OOP',
        difficulty: 'Intermediate',
        options: [
          { id: 'A', text: 'To allow the base class to be instantiated as an abstract class' },
          { id: 'B', text: 'To ensure derived class destructors are properly invoked when deleting via a base pointer' },
          { id: 'C', text: 'To improve runtime memory allocation speed' },
          { id: 'D', text: 'To make the constructor virtual' }
        ],
        correctAnswer: 'B',
        explanation: 'Without a virtual destructor, `delete basePtr` where `basePtr` points to a derived object leads to undefined behavior because only the base destructor would be invoked.',
        marks: 5,
        tags: ['C++', 'Virtual Functions', 'OOP'],
      },
      {
        questionText: 'Which C++ STL container provides O(1) average time complexity for element search and insertion?',
        questionType: 'mcq',
        language: 'C++',
        topic: 'STL Containers',
        difficulty: 'Intermediate',
        options: [
          { id: 'A', text: 'std::vector' },
          { id: 'B', text: 'std::map' },
          { id: 'C', text: 'std::unordered_map' },
          { id: 'D', text: 'std::deque' }
        ],
        correctAnswer: 'C',
        explanation: 'std::unordered_map is implemented using a hash table, providing amortized O(1) average lookups and insertions.',
        marks: 5,
        tags: ['STL', 'Data Structures', 'C++'],
      },

      // Java Questions
      {
        questionText: 'In Java, what is the key difference between HashMap and ConcurrentHashMap?',
        questionType: 'mcq',
        language: 'Java',
        topic: 'Collections Framework',
        difficulty: 'Advanced',
        options: [
          { id: 'A', text: 'HashMap is thread-safe whereas ConcurrentHashMap is not' },
          { id: 'B', text: 'ConcurrentHashMap allows thread-safe concurrent reads and segmented bucket-level locking' },
          { id: 'C', text: 'HashMap permits null keys and null values, ConcurrentHashMap does not allow null keys or values' },
          { id: 'D', text: 'Both B and C are correct' }
        ],
        correctAnswer: 'D',
        explanation: 'ConcurrentHashMap provides thread-safe operations via fine-grained lock striping and disallows null keys or values.',
        marks: 5,
        tags: ['Java', 'Multithreading', 'Collections'],
      },
      {
        questionText: 'Can an interface in Java 8 and later contain method implementations?',
        questionType: 'mcq',
        language: 'Java',
        topic: 'Interfaces & OOP',
        difficulty: 'Intermediate',
        options: [
          { id: 'A', text: 'No, interfaces can only have abstract method declarations' },
          { id: 'B', text: 'Yes, via default and static methods' },
          { id: 'C', text: 'Yes, but only private methods' },
          { id: 'D', text: 'No, only abstract classes can have implementations' }
        ],
        correctAnswer: 'B',
        explanation: 'Java 8 introduced default and static interface methods to allow API evolution without breaking existing implementing classes.',
        marks: 5,
        tags: ['Java', 'OOP', 'Interfaces'],
      },

      // Aptitude Questions
      {
        questionText: 'A and B together can complete a project in 12 days. B alone can finish it in 30 days. In how many days can A alone complete the project?',
        questionType: 'mcq',
        language: 'Aptitude',
        topic: 'Time and Work',
        difficulty: 'Beginner',
        options: [
          { id: 'A', text: '18 days' },
          { id: 'B', text: '20 days' },
          { id: 'C', text: '24 days' },
          { id: 'D', text: '15 days' }
        ],
        correctAnswer: 'B',
        explanation: "1/A = 1/12 - 1/30 = (5 - 2)/60 = 3/60 = 1/20. Thus A alone takes 20 days.",
        marks: 5,
        tags: ['Quantitative Aptitude', 'Time and Work'],
      },
      {
        questionText: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
        questionType: 'mcq',
        language: 'Aptitude',
        topic: 'Logical Reasoning',
        difficulty: 'Beginner',
        options: [
          { id: 'A', text: '127' },
          { id: 'B', text: '125' },
          { id: 'C', text: '95' },
          { id: 'D', text: '126' }
        ],
        correctAnswer: 'A',
        explanation: 'The pattern is (2n + 1): 3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63, 63*2+1 = 127.',
        marks: 5,
        tags: ['Series', 'Logical Reasoning'],
      },

      // Coding Problem 1: Two Sum / Array Search
      {
        questionText: 'Write a program in C, C++, or Java that takes an array of integers and a target sum, and determines whether any two distinct elements add up to the target.\n\nInput format:\nFirst line: integer N and target T\nSecond line: N space-separated integers\nOutput: "YES" or "NO"',
        questionType: 'coding',
        language: 'Java',
        topic: 'Arrays and Hashing',
        difficulty: 'Intermediate',
        starterCode: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int target = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n        \n        // Write your solution below\n        boolean found = false;\n        Set<Integer> set = new HashSet<>();\n        for(int num : arr) {\n            if(set.contains(target - num)) {\n                found = true;\n                break;\n            }\n            set.add(num);\n        }\n        System.out.println(found ? "YES" : "NO");\n    }\n}`,
        solutionCode: `import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int target = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        Set<Integer> set = new HashSet<>();\n        boolean found = false;\n        for(int num : arr) {\n            if(set.contains(target - num)) { found = true; break; }\n            set.add(num);\n        }\n        System.out.println(found ? "YES" : "NO");\n    }\n}`,
        testCases: [
          { input: '5 9\n2 7 11 15 3', expectedOutput: 'YES', isHidden: false, explanation: '2 + 7 = 9' },
          { input: '4 10\n1 2 3 4', expectedOutput: 'NO', isHidden: false, explanation: 'No two elements sum to 10' },
          { input: '3 6\n3 3 1', expectedOutput: 'YES', isHidden: true, explanation: '3 + 3 = 6' }
        ],
        marks: 10,
        tags: ['Arrays', 'Two Pointers', 'Hashing'],
      },

      // Coding Problem 2: Reverse String in C
      {
        questionText: 'Implement a function in C to reverse a string in-place without using extra memory allocation.\n\nInput: Single word or line\nOutput: Reversed string',
        questionType: 'coding',
        language: 'C',
        topic: 'Strings and Pointers',
        difficulty: 'Beginner',
        starterCode: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char str[100];\n    if (scanf("%s", str) == 1) {\n        int i = 0, j = strlen(str) - 1;\n        while (i < j) {\n            char temp = str[i];\n            str[i] = str[j];\n            str[j] = temp;\n            i++;\n            j--;\n        }\n        printf("%s", str);\n    }\n    return 0;\n}`,
        solutionCode: `#include <stdio.h>\n#include <string.h>\nint main() {\n    char str[100];\n    if(scanf("%s", str) == 1) {\n        int i = 0, j = strlen(str) - 1;\n        while (i < j) {\n            char t = str[i]; str[i] = str[j]; str[j] = t;\n            i++; j--;\n        }\n        printf("%s", str);\n    }\n    return 0;\n}`,
        testCases: [
          { input: 'placement', expectedOutput: 'tnemecalp', isHidden: false },
          { input: 'campus', expectedOutput: 'supmac', isHidden: false },
          { input: 'antigravity', expectedOutput: 'ytivargitna', isHidden: true }
        ],
        marks: 10,
        tags: ['Strings', 'Pointers', 'C'],
      }
    ]);

    console.log('[Seed] Seeding Sample Company Drives with Full Configurable Rounds...');
    const companies = await Company.insertMany([
      {
        name: 'Tata Consultancy Services (TCS)',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60',
        jobRoles: [
          { title: 'TCS Ninja - Systems Engineer', packageLPA: '3.6 - 4.5 LPA', location: 'Pan India', jobType: 'Full-time' },
          { title: 'TCS Digital - Cadre Developer', packageLPA: '7.5 - 9.0 LPA', location: 'Pan India / Hybrid', jobType: 'Full-time' }
        ],
        description: 'TCS National Qualifier Test (NQT) recruitment drive for engineering graduates. Multi-stage evaluation covering aptitude, programming logic, and technical interview.',
        driveDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        eligibilityCriteria: {
          minCGPA: 6.5,
          allowedDepartments: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Artificial Intelligence and Data Science'],
          graduationYears: [2026],
          maxActiveBacklogs: 0,
          maxHistoryBacklogs: 2,
          requiredSkills: ['C', 'Java', 'Python', 'Aptitude', 'Data Structures'],
          additionalCriteriaNotes: 'Consistent 60%+ in 10th & 12th standards; no active backlogs at time of drive.',
        },
        recruitmentRounds: [
          {
            roundNumber: 1,
            name: 'Numerical and Logical Aptitude',
            type: 'Aptitude',
            description: 'Foundation section testing quantitative problem solving, logical reasoning, and data interpretation.',
            topics: ['Time and Work', 'Speed and Distance', 'Percentages', 'Data Sufficiency', 'Coding Decoding'],
            timeLimitMinutes: 45,
            materials: [
              { title: 'TCS Aptitude Formula Sheet & Cheatsheet', url: 'https://example.com/materials/tcs-aptitude.pdf', type: 'cheatsheet' },
              { title: 'Top 50 Repeated TCS Quantitative Problems', url: 'https://example.com/materials/tcs-quant-50.pdf', type: 'document' }
            ],
            prepPlanSummary: 'Practice speed math techniques and solve 30 numerical aptitude problems daily.',
          },
          {
            roundNumber: 2,
            name: 'Verbal Ability Assessment',
            type: 'Assessment',
            description: 'Grammar, vocabulary, reading comprehension, sentence completion, and error detection.',
            topics: ['Sentence Correction', 'Paragraph Jumbles', 'Reading Comprehension', 'Idioms'],
            timeLimitMinutes: 25,
            materials: [
              { title: 'Verbal Grammar Rules for Campus Drives', url: 'https://example.com/materials/verbal.pdf', type: 'document' }
            ],
            prepPlanSummary: 'Review standard English grammar rules and practice 2 reading comprehension passages daily.',
          },
          {
            roundNumber: 3,
            name: 'Programming and Technical Coding Assessment',
            type: 'Coding',
            description: 'Programming logic, pseudo-code analysis, and hands-on coding problems in C/C++/Java.',
            topics: ['Arrays', 'Strings', 'Recursion', 'Functions', 'Dynamic Memory', 'Time Complexity'],
            timeLimitMinutes: 45,
            materials: [
              { title: 'TCS Digital Coding Previous Year Problem Set', url: 'https://example.com/materials/tcs-coding.pdf', type: 'document' }
            ],
            prepPlanSummary: 'Implement two medium-difficulty string and array problems without IDE hints.',
          },
          {
            roundNumber: 4,
            name: 'Technical Interview',
            type: 'Technical Interview',
            description: 'In-depth review of academic projects, OOP fundamentals, database queries, and system concepts.',
            topics: ['Academic Projects', 'OOP Concepts', 'DBMS & SQL Queries', 'Data Structures'],
            timeLimitMinutes: 40,
            materials: [
              { title: 'TCS Technical Interview FAQ Guide', url: 'https://example.com/materials/tcs-tech-interview.pdf', type: 'document' }
            ],
            prepPlanSummary: 'Be prepared to draw your project architectural diagram and explain trade-offs clearly.',
          },
          {
            roundNumber: 5,
            name: 'HR & Management Interview',
            type: 'HR Interview',
            description: 'Behavioral assessment, willingness to relocate, communication clarity, and cultural fit.',
            topics: ['Self Introduction', 'Team Conflict Scenarios', 'Relocation & Shifts', 'Future Aspirations'],
            timeLimitMinutes: 20,
            materials: [
              { title: 'Top 25 Behavioral HR Questions with STAR Framework', url: 'https://example.com/materials/hr-star.pdf', type: 'document' }
            ],
            prepPlanSummary: 'Prepare structured answers using the STAR method for teamwork and adversity stories.',
          }
        ],
        requiredSkills: ['C', 'Java', 'Data Structures', 'SQL', 'Quantitative Aptitude'],
        preparationMaterials: [
          { title: 'TCS Comprehensive Placement Guide 2026', url: 'https://example.com/tcs-complete-prep', category: 'Comprehensive' },
          { title: 'TCS Digital Advanced Coding Challenges', url: 'https://example.com/tcs-digital-coding', category: 'Coding' }
        ],
        applicationUrl: 'https://nextstep.tcs.com',
        status: 'published',
        isDemoData: true,
        createdBy: staffAccounts[0]._id,
      },
      {
        name: 'Zoho Corporation',
        logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=60',
        jobRoles: [
          { title: 'Software Developer (SDE 1)', packageLPA: '7.0 - 10.5 LPA', location: 'Chennai / Tenkasi / Salem', jobType: 'Full-time' },
          { title: 'Quality Assurance & Testing Engineer', packageLPA: '5.5 - 7.0 LPA', location: 'Chennai', jobType: 'Full-time' }
        ],
        description: 'Zoho engineering recruitment drive known for rigorous algorithmic problem-solving and clean code architectural interviews without framework bias.',
        driveDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days
        registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        eligibilityCriteria: {
          minCGPA: 7.0,
          allowedDepartments: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Artificial Intelligence and Data Science', 'Mechanical Engineering'],
          graduationYears: [2026],
          maxActiveBacklogs: 0,
          maxHistoryBacklogs: 1,
          requiredSkills: ['C', 'C++', 'Java', 'Problem Solving', 'Data Structures'],
          additionalCriteriaNotes: 'No academic percentage restriction if problem-solving ability in C/Java is exceptional.',
        },
        recruitmentRounds: [
          {
            roundNumber: 1,
            name: 'Basic Programming Fundamentals & Aptitude',
            type: 'Assessment',
            description: 'Output prediction in C/C++, dry-running nested loops, recursion tracing, and basic analytical aptitude.',
            topics: ['Loop Tracing', 'Pointers in C', 'Bitwise Operators', 'Recursion', 'Output Prediction'],
            timeLimitMinutes: 60,
            materials: [{ title: 'Zoho Round 1 Output Prediction Bank', url: 'https://example.com/zoho-round1.pdf', type: 'cheatsheet' }],
            prepPlanSummary: 'Dry run 20 tricky pointer and bitwise code snippets without running them on an IDE.',
          },
          {
            roundNumber: 2,
            name: 'Problem Solving and Hands-on Coding (Round 2)',
            type: 'Coding',
            description: '5 algorithmic coding challenges requiring efficient in-place array manipulation, matrix traversal, and string operations.',
            topics: ['2D Arrays & Matrices', 'String Parsing', 'Two Pointers', 'Pattern Printing', 'Custom Sorting'],
            timeLimitMinutes: 90,
            materials: [{ title: 'Top 30 Zoho Level-2 Coding Questions', url: 'https://example.com/zoho-coding.pdf', type: 'document' }],
            prepPlanSummary: 'Practice implementing spiral matrix traversal, string anagrams, and balanced parentheses from scratch.',
          },
          {
            roundNumber: 3,
            name: 'Advanced Technical Assessment & Mini Application Design (Round 3)',
            type: 'Coding',
            description: 'Console application design (e.g., Railway Reservation System, Invoice Generator, Parking Lot System) using pure OOP.',
            topics: ['System Design Basics', 'Object Oriented Design', 'Modular Code Structure', 'Data Flow'],
            timeLimitMinutes: 120,
            materials: [{ title: 'Zoho Mini Application Design Architecture Guide', url: 'https://example.com/zoho-design.pdf', type: 'document' }],
            prepPlanSummary: 'Design and code a console-based Railway Reservation System with booking, cancellation, and chart display.',
          },
          {
            roundNumber: 4,
            name: 'Technical Interview',
            type: 'Technical Interview',
            description: 'Live whiteboard coding, memory optimization, data structure trade-offs, and deep dive into project design.',
            topics: ['Linked Lists', 'Trees', 'Time vs Space Tradeoffs', 'Clean Coding Practices'],
            timeLimitMinutes: 45,
            materials: [{ title: 'Zoho Technical Interview Experience Transcripts', url: 'https://example.com/zoho-tech.pdf', type: 'document' }],
            prepPlanSummary: 'Be prepared to explain why you picked a particular data structure over another.',
          },
          {
            roundNumber: 5,
            name: 'HR & Culture Discussion',
            type: 'HR Interview',
            description: 'Alignment with Zoho craftsmanship culture, product mindset, and long-term career outlook.',
            topics: ['Company Culture', 'Self Learning Habits', 'Curiosity & Passion for Tech'],
            timeLimitMinutes: 25,
            materials: [{ title: 'Understanding Zoho Culture and Work Ethics', url: 'https://example.com/zoho-culture.pdf', type: 'document' }],
            prepPlanSummary: 'Research Zoho products (CRM, Desk, Books) and articulate why product development excites you.',
          }
        ],
        requiredSkills: ['C', 'Java', 'Problem Solving', 'Data Structures', 'OOP Concepts'],
        preparationMaterials: [
          { title: 'Zoho Placement Preparation Blueprint', url: 'https://example.com/zoho-blueprint', category: 'Blueprint' }
        ],
        applicationUrl: 'https://careers.zohocorp.com',
        status: 'published',
        isDemoData: true,
        createdBy: staffAccounts[1]._id,
      },
      {
        name: 'Infosys Limited',
        logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=60',
        jobRoles: [
          { title: 'Systems Engineer', packageLPA: '3.6 - 4.2 LPA', location: 'Mysore / Bangalore / Pune', jobType: 'Full-time' },
          { title: 'Specialist Programmer (SP)', packageLPA: '9.5 - 11.0 LPA', location: 'Bangalore / Hyderabad', jobType: 'Full-time' }
        ],
        description: 'Infosys campus recruitment offering dual entry tracks (Systems Engineer & Specialist Programmer) through online assessments and technical interviews.',
        driveDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        eligibilityCriteria: {
          minCGPA: 6.5,
          allowedDepartments: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Artificial Intelligence and Data Science'],
          graduationYears: [2026],
          maxActiveBacklogs: 0,
          maxHistoryBacklogs: 2,
          requiredSkills: ['Java', 'Python', 'Aptitude', 'Data Structures', 'DBMS'],
          additionalCriteriaNotes: '60% throughout 10th, 12th, and Diploma/Graduation.',
        },
        recruitmentRounds: [
          { roundNumber: 1, name: 'Reasoning and Mathematical Ability', type: 'Aptitude', timeLimitMinutes: 40, topics: ['Data Interpretation', 'Algebra', 'Logical Deductions'] },
          { roundNumber: 2, name: 'Verbal Ability and Critical Reasoning', type: 'Assessment', timeLimitMinutes: 35, topics: ['Reading Comprehension', 'Error Spotting'] },
          { roundNumber: 3, name: 'Pseudocode and Hands-on Coding', type: 'Coding', timeLimitMinutes: 50, topics: ['Pseudocode Tracing', 'Array Algorithms', 'Dynamic Programming'] },
          { roundNumber: 4, name: 'Comprehensive Technical & HR Interview', type: 'Technical Interview', timeLimitMinutes: 35, topics: ['OOP Concepts', 'Project Explanation', 'Behavioral Scenarios'] }
        ],
        requiredSkills: ['Java', 'Data Structures', 'DBMS', 'Quantitative Aptitude'],
        applicationUrl: 'https://career.infosys.com',
        status: 'published',
        isDemoData: true,
        createdBy: staffAccounts[0]._id,
      },
      {
        name: 'Accenture India',
        logo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=100&auto=format&fit=crop&q=60',
        jobRoles: [
          { title: 'Associate Software Engineer (ASE)', packageLPA: '4.5 - 5.0 LPA', location: 'Pan India', jobType: 'Full-time' },
          { title: 'Advanced ASE (AASE)', packageLPA: '6.5 - 7.5 LPA', location: 'Pan India', jobType: 'Full-time' }
        ],
        description: 'Accenture nationwide talent hunt assessing cognitive ability, technical knowledge (Cloud, Security, Networking), coding skills, and communication round.',
        driveDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        eligibilityCriteria: {
          minCGPA: 6.5,
          allowedDepartments: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Artificial Intelligence and Data Science', 'Mechanical Engineering'],
          graduationYears: [2026],
          maxActiveBacklogs: 0,
          maxHistoryBacklogs: 1,
          requiredSkills: ['C++', 'Java', 'Cloud Fundamentals', 'Computer Networks', 'Aptitude'],
        },
        recruitmentRounds: [
          { roundNumber: 1, name: 'Cognitive and Technical Assessment', type: 'Assessment', timeLimitMinutes: 90, topics: ['Analytical Reasoning', 'Common Applications & MS Office', 'Pseudocode', 'Cloud Basics'] },
          { roundNumber: 2, name: 'Coding Assessment', type: 'Coding', timeLimitMinutes: 45, topics: ['Strings', 'Arrays', 'Basic Math Operations'] },
          { roundNumber: 3, name: 'Communication Assessment (Automated Voice Test)', type: 'Assessment', timeLimitMinutes: 20, topics: ['Pronunciation', 'Fluency', 'Listening Comprehension'] },
          { roundNumber: 4, name: 'Final Technical & Behavioral Interview', type: 'Technical Interview', timeLimitMinutes: 30, topics: ['Resume Projects', 'Situation Questions', 'Adaptability'] }
        ],
        requiredSkills: ['Java', 'Cloud Fundamentals', 'Aptitude', 'Communication'],
        applicationUrl: 'https://www.accenture.com/in-en/careers',
        status: 'published',
        isDemoData: true,
        createdBy: staffAccounts[0]._id,
      },
      {
        name: 'Wipro Limited',
        logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=60',
        jobRoles: [
          { title: 'Project Engineer (Elite National Talent Hunt)', packageLPA: '3.5 - 4.0 LPA', location: 'Pan India', jobType: 'Full-time' },
          { title: 'Turbo Specialist Trainee', packageLPA: '6.5 - 7.5 LPA', location: 'Bangalore / Hyderabad', jobType: 'Full-time' }
        ],
        description: 'Wipro Elite National Talent Hunt recruitment drive for B.E./B.Tech graduates across engineering disciplines.',
        driveDate: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        eligibilityCriteria: {
          minCGPA: 6.0,
          allowedDepartments: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Artificial Intelligence and Data Science', 'Mechanical Engineering'],
          graduationYears: [2026],
          maxActiveBacklogs: 0,
          maxHistoryBacklogs: 3,
          requiredSkills: ['C', 'Java', 'Aptitude', 'Data Structures'],
        },
        recruitmentRounds: [
          { roundNumber: 1, name: 'Aptitude & Written Communication Test', type: 'Assessment', timeLimitMinutes: 68, topics: ['Quantitative', 'Logical', 'Essay Writing'] },
          { roundNumber: 2, name: 'Online Coding Test', type: 'Coding', timeLimitMinutes: 60, topics: ['2 Coding Problems in Java/C++/C'] },
          { roundNumber: 3, name: 'Combined Technical and HR Interview', type: 'Technical Interview', timeLimitMinutes: 30, topics: ['Technical Basics', 'Academic Project Review', 'HR Discussion'] }
        ],
        requiredSkills: ['C', 'Java', 'Problem Solving', 'Aptitude'],
        applicationUrl: 'https://careers.wipro.com',
        status: 'published',
        isDemoData: true,
        createdBy: staffAccounts[0]._id,
      }
    ]);

    console.log('[Seed] Seeding Sample Assessments (Daily Tests & Mock Drives)...');
    const qIds = questions.map(q => q._id);
    const assessments = await Assessment.insertMany([
      {
        title: 'Daily Diagnostic Assessment: C Programming & Pointers',
        description: 'Comprehensive 15-minute diagnostic test evaluating pointer arithmetic, memory management, and array manipulations in C.',
        type: 'daily_test',
        programmingLanguage: 'C',
        topics: ['Pointers', 'Dynamic Memory', 'Arrays'],
        difficulty: 'Intermediate',
        questions: [qIds[0], qIds[1], qIds[2]],
        durationMinutes: 15,
        passingPercentage: 60,
        assignedBy: staffAccounts[1]._id,
        status: 'published',
        isDailyTest: true,
      },
      {
        title: 'Daily Challenge: C++ OOP & STL Performance',
        description: 'Test your understanding of virtual destructors, polymorphism, and STL hash map complexities.',
        type: 'daily_test',
        programmingLanguage: 'C++',
        topics: ['Polymorphism & OOP', 'STL Containers'],
        difficulty: 'Intermediate',
        questions: [qIds[3], qIds[4]],
        durationMinutes: 15,
        passingPercentage: 60,
        assignedBy: staffAccounts[1]._id,
        status: 'published',
        isDailyTest: true,
      },
      {
        title: 'Daily Challenge: Java Collections & Multi-threading',
        description: 'In-depth assessment of HashMap internals, thread safety, and modern Java interfaces.',
        type: 'daily_test',
        programmingLanguage: 'Java',
        topics: ['Collections Framework', 'Interfaces & OOP'],
        difficulty: 'Advanced',
        questions: [qIds[5], qIds[6]],
        durationMinutes: 20,
        passingPercentage: 65,
        assignedBy: staffAccounts[1]._id,
        status: 'published',
        isDailyTest: true,
      },
      {
        title: 'TCS National Qualifier Aptitude & Logic Mock Drive',
        description: 'Full simulation of TCS NQT Round 1: Numerical ability, series analysis, and logical deductions.',
        type: 'company_prep',
        programmingLanguage: 'Aptitude',
        topics: ['Time and Work', 'Logical Reasoning', 'Percentages'],
        difficulty: 'Intermediate',
        companyId: companies[0]._id,
        questions: [qIds[7], qIds[8]],
        durationMinutes: 30,
        passingPercentage: 60,
        assignedBy: staffAccounts[0]._id,
        status: 'published',
        isDailyTest: false,
      },
      {
        title: 'Zoho Level-2 Coding Practice Simulation',
        description: 'Hands-on programming assessment testing array searching and in-place string manipulation.',
        type: 'company_prep',
        programmingLanguage: 'Java',
        topics: ['Arrays and Hashing', 'Strings and Pointers'],
        difficulty: 'Intermediate',
        companyId: companies[1]._id,
        questions: [qIds[9], qIds[10]],
        durationMinutes: 45,
        passingPercentage: 70,
        assignedBy: staffAccounts[1]._id,
        status: 'published',
        isDailyTest: false,
      }
    ]);

    console.log('[Seed] Seeding Realistic Test Attempts & Historical Activity for Students...');
    const attempts = [];
    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];
      // Generate 2 to 4 test attempts for each student
      const attemptCount = Math.floor(Math.random() * 3) + 2;

      for (let j = 0; j < attemptCount; j++) {
        const assessment = assessments[j % assessments.length];
        const baseScore = Math.min(100, Math.max(35, Math.round((student.CGPA / 10) * 85 + (Math.random() * 20 - 10))));
        const passed = baseScore >= (assessment.passingPercentage || 60);

        const submittedDate = new Date();
        submittedDate.setDate(submittedDate.getDate() - (j * 2 + Math.floor(Math.random() * 2)));

        attempts.push({
          studentId: student._id,
          assessmentId: assessment._id,
          answers: [
            {
              questionId: questions[0]._id,
              questionType: 'mcq',
              studentAnswer: passed ? questions[0].correctAnswer : 'A',
              isCorrect: passed,
              marksAwarded: passed ? 5 : 0,
              maxMarks: 5,
              evaluationFeedback: { explanation: questions[0].explanation },
            }
          ],
          score: baseScore,
          maximumScore: 100,
          percentage: baseScore,
          passed,
          topicPerformance: [
            { topic: assessment.topics[0] || 'Programming', correct: passed ? 4 : 2, total: 5, percentage: baseScore }
          ],
          durationSeconds: Math.floor(Math.random() * 600) + 400,
          status: 'completed',
          submittedAt: submittedDate,
          feedback: passed ? 'Strong conceptual understanding demonstrated.' : 'Needs revision in core mechanisms.',
        });
      }
    }
    await TestAttempt.insertMany(attempts);

    console.log('[Seed] Seeding Training Courses with Modules & Lessons...');
    const courses = await TrainingCourse.insertMany([
      {
        title: 'Complete C Programming Masterclass for Campus Placements',
        category: 'C Programming',
        description: 'From variables and pointers to dynamic memory allocation and recursive data structures. Master C programming questions commonly asked in TCS, Zoho, and Cognizant.',
        difficulty: 'Beginner',
        estimatedDurationHours: 12,
        learningObjectives: [
          'Master pointer arithmetic and dereferencing',
          'Avoid memory leaks using malloc, calloc, and free safely',
          'Implement recursive algorithms for searching and sorting',
        ],
        modules: [
          {
            moduleNumber: 1,
            title: 'Pointers & Dynamic Memory Management',
            description: 'Understanding heap vs stack, pointer arithmetic, double pointers, and memory layout.',
            lessons: [
              {
                title: 'Introduction to Memory Addresses & Dereferencing',
                content: 'In C, every variable resides at a specific memory location accessed using the address-of operator (&) and dereferencing operator (*).',
                durationMinutes: 20,
                keyTakeaways: ['& gives address of variable', '* retrieves value from address', 'Pointers must be initialized before dereferencing'],
              },
              {
                title: 'Dynamic Allocation: malloc vs calloc vs realloc',
                content: 'malloc allocates uninitialized bytes while calloc zeroes out the allocated memory.',
                durationMinutes: 25,
                keyTakeaways: ['Always check if pointer is NULL after allocation', 'Every malloc/calloc call must have a corresponding free()'],
              }
            ],
          },
          {
            moduleNumber: 2,
            title: 'Arrays, Strings, and Pointer Arithmetic',
            description: 'Array decay into pointers, 2D arrays, string manipulation functions, and buffer safety.',
            lessons: [
              {
                title: 'Strings in C: Null Terminator & Common Pitfalls',
                content: 'Strings in C are character arrays terminated with the null byte "\\0". Failing to reserve space for the null byte causes undefined buffer overflow.',
                durationMinutes: 25,
                keyTakeaways: ['Always allocate n + 1 bytes for strings', 'Use safe string operations like strncpy'],
              }
            ],
          }
        ],
        isMandatory: true,
        targetWeaknessTopics: ['Pointers', 'Dynamic Memory'],
        status: 'active',
        createdBy: staffAccounts[1]._id,
      },
      {
        title: 'Data Structures and Algorithms Placement Bootcamp',
        category: 'Data Structures & Algorithms',
        description: 'Comprehensive problem-solving training covering Arrays, Linked Lists, Stacks, Queues, Binary Trees, and Dynamic Programming.',
        difficulty: 'Intermediate',
        estimatedDurationHours: 24,
        learningObjectives: [
          'Implement classic linear and non-linear data structures from scratch',
          'Calculate Big-O time and space complexities accurately',
          'Solve medium and hard campus placement coding problems with confidence',
        ],
        modules: [
          {
            moduleNumber: 1,
            title: 'Arrays & Two-Pointer Techniques',
            description: 'Sliding window, two pointers, prefix sums, and fast cycle detection.',
            lessons: [
              {
                title: 'Two-Pointer Technique for Sorted Arrays',
                content: 'When arrays are sorted, two pointers moving inwards reduce O(N^2) brute force searches down to optimal O(N) linear time.',
                durationMinutes: 30,
                keyTakeaways: ['Reduces quadratic time to linear time', 'Applicable to two-sum, palindrome verification, and partition algorithms'],
              }
            ],
          }
        ],
        isMandatory: true,
        targetWeaknessTopics: ['Arrays', 'Two Pointers'],
        status: 'active',
        createdBy: staffAccounts[1]._id,
      },
      {
        title: 'Quantitative & Logical Aptitude Accelerator',
        category: 'Quantitative Aptitude',
        description: 'Fast-paced mental math, formulas, and shortcut techniques for TCS NQT, Infosys, and Accenture cognitive tests.',
        difficulty: 'Beginner',
        estimatedDurationHours: 15,
        learningObjectives: [
          'Solve time and work equations in under 60 seconds',
          'Master speed, distance, relative velocity, and train problems',
          'Solve syllogisms, blood relations, and seating arrangement puzzles',
        ],
        modules: [
          {
            moduleNumber: 1,
            title: 'Time, Speed, Distance & Work Equations',
            description: 'Shortcut fraction methods and unitary systems.',
            lessons: [
              {
                title: 'Unitary Method & LCM Technique for Time and Work',
                content: 'Instead of adding fractions, compute the LCM of individual days to represent total units of work.',
                durationMinutes: 25,
                keyTakeaways: ['LCM represents total work units', 'Efficiency = Total Units / Days'],
              }
            ],
          }
        ],
        isMandatory: false,
        status: 'active',
        createdBy: staffAccounts[0]._id,
      },
      {
        title: 'Technical & HR Interview Preparation Masterclass',
        category: 'Technical Interview',
        description: 'Cracking whiteboard interviews, STAR behavioral answers, salary discussions, and live coding etiquette.',
        difficulty: 'Intermediate',
        estimatedDurationHours: 10,
        learningObjectives: [
          'Articulate academic project architectures using clear diagrams',
          'Structure behavioral responses using the STAR method',
          'Handle tricky questions regarding academic gaps or low semester scores',
        ],
        modules: [
          {
            moduleNumber: 1,
            title: 'STAR Method for Behavioral Interviewing',
            description: 'Situation, Task, Action, Result framework for answering behavioral and situational questions.',
            lessons: [
              {
                title: 'Structuring Compelling Engineering Stories',
                content: 'Interviewers look for ownership, problem-solving under pressure, and quantified impact.',
                durationMinutes: 20,
                keyTakeaways: ['Spend 70% of answer on Action & Result', 'Quantify outcome with percentage or numbers'],
              }
            ],
          }
        ],
        isMandatory: false,
        status: 'active',
        createdBy: staffAccounts[0]._id,
      }
    ]);

    console.log('[Seed] Seeding Training Progress Records for Students...');
    const progressDocs = [];
    for (const student of createdStudents) {
      for (const course of courses) {
        const pct = Math.floor(Math.random() * 70) + 25;
        progressDocs.push({
          studentId: student._id,
          courseId: course._id,
          completionPercentage: pct,
          isCompleted: pct === 100,
          lastAccessedAt: new Date(),
        });
      }
    }
    await TrainingProgress.insertMany(progressDocs);

    console.log('[Seed] Seeding Sample Student Resume & AI Assessment for Aditya Verma...');
    const primaryStudent = createdStudents[0];
    const resume = await Resume.create({
      studentId: primaryStudent._id,
      fileMetadata: {
        filename: 'resume-aditya-sample.pdf',
        originalName: 'Aditya_Verma_Resume_2026.pdf',
        mimeType: 'application/pdf',
        size: 145000,
        path: 'uploads/resume-aditya-sample.pdf',
      },
      extractedText: `ADITYA VERMA
Email: aditya.verma@student.college.edu | Phone: +91 9876543210
GitHub: github.com/aditya-verma | LinkedIn: linkedin.com/in/aditya-verma

EDUCATION
B.Tech in Computer Science and Engineering (2022 - 2026)
College of Engineering & Technology — CGPA: 8.9 / 10

TECHNICAL SKILLS
Languages: Java, C++, C, Python, JavaScript, SQL
Frameworks & Libraries: React, Node.js, Express.js, Spring Boot, Tailwind CSS
Databases & Cloud: MongoDB, PostgreSQL, Redis, Docker, Git, Linux
Core CS: Data Structures & Algorithms, Object-Oriented Programming, DBMS, Operating Systems

PROJECTS
1. Helpdesk Support Web Application (MERN Stack)
- Designed and built a real-time ticketing support system with role-based access for technicians and end-users.
- Implemented JWT authentication, encrypted credentials, and automated SLA ticket escalation timers.
- Reduced customer query response lag by 35% using WebSocket live notifications.

2. Distributed File Storage Node (Java, Multi-threading)
- Developed a high-concurrency file replication server using socket programming and thread pools.
- Handled concurrent chunk verification with SHA-256 hash checks and segment locking.

INTERNSHIP
Software Engineering Intern — TechNova Labs (Summer 2025)
- Optimized MongoDB aggregation queries for user analytics, reducing latency from 450ms to 120ms.
- Built reusable React dashboard widgets used by over 5,000 active users.`,
      extractedSkills: {
        programmingLanguages: ['Java', 'C++', 'C', 'Python', 'JavaScript', 'SQL'],
        frameworks: ['React', 'Node.js', 'Express.js', 'Spring Boot', 'Tailwind CSS'],
        databases: ['MongoDB', 'PostgreSQL', 'Redis'],
        cloudAndTools: ['Docker', 'Git', 'Linux'],
        coreCS: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'DBMS', 'Operating Systems'],
        softSkills: ['Problem Solving', 'Team Collaboration', 'Communication'],
      },
      projects: [
        {
          title: 'Helpdesk Support Web Application',
          techStack: ['React', 'Node.js', 'MongoDB', 'Express'],
          description: 'Real-time ticketing system with role-based access and automated SLA timers.',
          highlights: ['Reduced query response lag by 35%', 'Integrated JWT authentication & WebSocket alerts'],
        },
        {
          title: 'Distributed File Storage Node',
          techStack: ['Java', 'Multi-threading', 'Sockets'],
          description: 'High-concurrency file replication server with segment locking and hash validation.',
          highlights: ['Implemented SHA-256 chunk checks and worker thread pool'],
        }
      ],
      internships: [
        {
          company: 'TechNova Labs',
          role: 'Software Engineering Intern',
          duration: 'May 2025 - July 2025',
          description: 'Optimized MongoDB aggregation pipelines and developed React analytics dashboards.',
        }
      ],
      certifications: ['Oracle Certified Associate: Java SE 8 Programmer', 'AWS Certified Cloud Practitioner'],
      education: [
        {
          institution: 'College of Engineering & Technology',
          degree: 'B.Tech in Computer Science and Engineering',
          year: '2022 - 2026',
          score: '8.9 CGPA',
        }
      ],
      analysisResults: {
        resumeCompletenessScore: 88,
        strengths: [
          'Excellent alignment with full-stack and SDE campus hiring requirements',
          'Demonstrated knowledge of both Java enterprise and modern web stacks (MERN)',
          'Clear quantified internship achievements and project metrics',
        ],
        weaknesses: [
          'Consider mentioning automated CI/CD pipeline deployments (e.g., GitHub Actions)',
          'Highlight unit testing frameworks like JUnit or Jest in project sections',
        ],
        atsSuggestions: [
          'Maintain single-column ATS readable formatting',
          'Include keywords: RESTful APIs, Concurrency, Microservices',
        ],
        missingKeywords: ['CI/CD Pipelines', 'JUnit / Test-Driven Development', 'System Architecture'],
      },
      version: 1,
      isActive: true,
      uploadedAt: new Date(),
    });

    // Generate personalized AI question set for this student
    await AIQuestionSet.create({
      studentId: primaryStudent._id,
      resumeId: resume._id,
      difficulty: 'Intermediate',
      questions: [
        {
          category: 'Resume-based questions',
          questionText: 'In your resume, you listed both Java and C++. How do virtual functions in C++ differ from standard method overriding in Java?',
          difficulty: 'Intermediate',
          expectedAnswer: 'In Java, all non-static methods are virtual by default and use late binding unless marked final. In C++, virtual behavior requires explicit `virtual` keyword, and object dispatch uses a vtable pointer.',
          evaluationRubric: { conceptAccuracy: 40, technicalCorrectness: 40, clarityAndEfficiency: 20 },
          maxMarks: 10,
          studentAnswer: 'In Java, methods are virtual by default unless declared final. In C++, we have to explicitly add the virtual keyword to achieve dynamic polymorphism via vtables.',
          evaluation: {
            marksObtained: 9,
            conceptAccuracy: 36,
            technicalCorrectness: 37,
            missingPoints: ['Could briefly mention object slicing in C++'],
            suggestedImprovements: 'Good explanation. Mentioning how the compiler constructs the vtable adds extra marks.',
            sampleStrongAnswer: 'In Java, dynamic binding is the default for instance methods unless private, static, or final. In C++, static binding is default unless explicitly declared `virtual`, which establishes a vtable pointer (vptr) in the object layout.',
          },
        },
        {
          category: 'Project explanation',
          questionText: 'Explain the architecture of your "Helpdesk Support Web Application" and how you prevented unauthorized users from modifying tickets assigned to other technicians.',
          difficulty: 'Intermediate',
          expectedAnswer: 'Client-server REST architecture using Express and MongoDB. Route-level authorization middleware inspecting JWT claims for technician ID and verifying ticket ownership before executing update queries.',
          evaluationRubric: { conceptAccuracy: 40, technicalCorrectness: 40, clarityAndEfficiency: 20 },
          maxMarks: 10,
          studentAnswer: 'We used JWT tokens stored securely. In our Express backend, middleware checks the user role. If the user is a technician, it also queries the database to confirm the ticket is assigned to their technician ID before allowing any status update.',
          evaluation: {
            marksObtained: 9,
            conceptAccuracy: 38,
            technicalCorrectness: 36,
            missingPoints: ['Could mention rate limiting or audit logging'],
            suggestedImprovements: 'Solid security explanation that directly reflects practical production standards.',
            sampleStrongAnswer: 'We utilized role-based access control (RBAC) middleware in Express. On receiving a ticket update request, the token is verified and the handler performs an atomic query checking `{ _id: ticketId, assignedTo: req.user._id }`, preventing horizontal privilege escalation.',
          },
        },
        {
          category: 'Programming fundamentals',
          questionText: 'What is the internal mechanism of a Java HashMap when hash collisions occur? How did Java 8 improve this behavior?',
          difficulty: 'Intermediate',
          expectedAnswer: 'Hash collisions are resolved via chaining in buckets. Prior to Java 8, buckets used singly-linked lists (O(N) search). Java 8 transforms linked lists into balanced Red-Black trees (TREEIFY_THRESHOLD = 8) improving worst-case search to O(log N).',
          evaluationRubric: { conceptAccuracy: 40, technicalCorrectness: 40, clarityAndEfficiency: 20 },
          maxMarks: 10,
          studentAnswer: 'HashMap uses buckets. When two keys produce the same hash, they are stored in a linked list. In Java 8, if the bucket has more than 8 elements, it converts the list into a Red-Black self-balancing tree for O(log N) search.',
          evaluation: {
            marksObtained: 10,
            conceptAccuracy: 40,
            technicalCorrectness: 40,
            missingPoints: [],
            suggestedImprovements: 'Accurate and comprehensive response.',
            sampleStrongAnswer: 'Java HashMap resolves collisions using separate chaining. When the collision count in a single bucket reaches TREEIFY_THRESHOLD (8) and table capacity >= 64, the linked list converts to a Red-Black tree, reducing worst-case lookup from O(N) to O(log N).',
          },
        }
      ],
      totalScore: 28,
      maxScore: 30,
      status: 'evaluated',
      adaptiveRecommendations: {
        recommendedTopics: ['Concurrency & Thread Safety in Java', 'Distributed System Patterns', 'SQL Query Optimization'],
        practiceAdvice: 'Excellent technical answers! To excel in Tier-1 product interviews (e.g. Zoho, Amazon), practice explaining database deadlock scenarios and memory profiler tools.',
        recommendedCourses: ['Data Structures and Algorithms Placement Bootcamp', 'Technical & HR Interview Preparation Masterclass'],
        suggestedCompanies: ['Zoho Corporation', 'TCS Digital', 'Infosys Specialist Programmer'],
      },
    });

    console.log('[Seed] Evaluating Company Eligibility for all sample students...');
    for (const student of createdStudents) {
      await eligibilityEvaluator.evaluateAllForStudent(student);
    }

    console.log('[Seed] Seeding Notifications & Audit Logs...');
    await Notification.insertMany([
      {
        recipientId: primaryStudent._id,
        title: 'New Campus Drive Announced: TCS National Qualifier',
        message: 'TCS has announced the 2026 campus recruitment drive. Check your eligibility and start preparation now.',
        notificationType: 'company_drive',
        link: `/student/companies/${companies[0]._id}`,
        isRead: true,
        readAt: new Date(),
      },
      {
        recipientId: primaryStudent._id,
        title: 'Daily Programming Test Ready: Java Collections & OOP',
        message: 'Your daily placement programming test has been assigned. Keep your 12-day learning streak active!',
        notificationType: 'daily_test',
        link: '/student/daily-tests',
        isRead: false,
      },
      {
        recipientId: primaryStudent._id,
        title: 'Resume Assessment Evaluation Complete',
        message: 'Your AI resume-based mock interview assessment has been scored. You achieved 28/30 marks (93%).',
        notificationType: 'test_result',
        link: '/student/resume-assessment',
        isRead: false,
      }
    ]);

    await AuditLog.insertMany([
      {
        actorId: adminUser._id,
        actorName: adminUser.name,
        actorRole: 'admin',
        action: 'Initial System Placement Database Setup',
        targetType: 'System',
        targetId: 'INIT-2026',
        metadata: { status: 'Success', initializedEntities: ['Users', 'Companies', 'Assessments', 'Questions'] },
        ipAddress: '127.0.0.1',
      },
      {
        actorId: staffAccounts[0]._id,
        actorName: staffAccounts[0].name,
        actorRole: 'staff',
        action: 'Published TCS 2026 Campus Drive',
        targetType: 'Company',
        targetId: String(companies[0]._id),
        metadata: { company: 'Tata Consultancy Services', roles: 'Ninja & Digital' },
        ipAddress: '127.0.0.1',
      }
    ]);

    console.log('========================================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================================================');
    console.log('Demo Credentials for Testing:');
    console.log('------------------------------------------------------------------------');
    console.log('1. Admin Account:');
    console.log('   Email:    admin@college.edu');
    console.log('   Password: Password@123');
    console.log('------------------------------------------------------------------------');
    console.log('2. Staff / Placement Coordinator Accounts:');
    console.log('   Email:    placement.coordinator@college.edu');
    console.log('   Email:    trainer.coding@college.edu');
    console.log('   Password: Password@123');
    console.log('------------------------------------------------------------------------');
    console.log('3. Student Accounts (20 students generated):');
    console.log('   Email:    aditya.verma@student.college.edu (CGPA 8.9 - High Performer)');
    console.log('   Email:    rohan.gupta@student.college.edu  (CGPA 7.4 - Intermediate)');
    console.log('   Email:    rahul.sharma@student.college.edu (CGPA 5.9 - Needs Support)');
    console.log('   Password: Password@123');
    console.log('========================================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seedData();
