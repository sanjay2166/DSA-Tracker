import React, { useEffect, useState } from 'react';

const DEFAULT_TOPICS = [
  'Array',
  'Strings',
  'Linked List',
  'Hashing',
  'Sorting',
  'Binary Search',
  'Trees',
  'Graphs',
  'Backtracking',
  'DP',
  'Recursion',
];

const STORAGE_KEYS = {
  QUESTIONS: 'qc_questions_v4',
  SOLVED: 'qc_solved_v4',
  THEME: 'qc_theme_v4',
};

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function normalizeLink(link) {
  if (!link) return '';
  let formatted = link.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = 'https://' + formatted;
  }
  return formatted;
}

export default function NeetStyleTracker() {
  const [questions, setQuestions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (raw) return JSON.parse(raw);
    } catch {}
    const base = {};
    DEFAULT_TOPICS.forEach((t) => (base[t] = []));
    return base;
  });

  const [solved, setSolved] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SOLVED);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [selectedTopic, setSelectedTopic] = useState(DEFAULT_TOPICS[0]);
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'light');

  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newDifficulty, setNewDifficulty] = useState(DIFFICULTIES[0]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOLVED, JSON.stringify(solved));
  }, [solved]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  function addQuestion() {
    if (!newTitle.trim()) return;
    const link = normalizeLink(newLink);
    const q = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      link,
      difficulty: newDifficulty,
      dateAdded: new Date().toISOString(),
    };
    setQuestions((prev) => {
      const copy = { ...prev };
      if (!copy[selectedTopic]) copy[selectedTopic] = [];
      copy[selectedTopic] = [q, ...copy[selectedTopic]];
      return copy;
    });
    setNewTitle('');
    setNewLink('');
    setNewDifficulty(DIFFICULTIES[0]);
  }

  function toggleSolved(qId) {
    setSolved((prev) => ({ ...prev, [qId]: !prev[qId] }));
  }

  function removeQuestion(qId) {
    setQuestions((prev) => {
      const copy = { ...prev };
      copy[selectedTopic] = copy[selectedTopic].filter((q) => q.id !== qId);
      return copy;
    });
    setSolved((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  }

  const currentList = questions[selectedTopic] || [];
  const totalForTopic = currentList.length;
  const solvedForTopic = currentList.filter((q) => solved[q.id]).length;
  const progressPercent = totalForTopic === 0 ? 0 : Math.round((solvedForTopic / totalForTopic) * 100);

  function difficultyBadge(diff) {
    switch (diff) {
      case 'Easy':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Hard':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-slate-900'} p-6 transition-colors`}>
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className={`col-span-12 md:col-span-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Topics</h3>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-3 py-1 text-sm rounded-md border border-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>

          <ul className="space-y-1">
            {DEFAULT_TOPICS.map((t) => (
              <li key={t}>
                <button
                  onClick={() => setSelectedTopic(t)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${t === selectedTopic ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-gray-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{t}</span>
                    <span className="text-sm text-slate-400">{questions[t]?.length || 0}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <h4 className="text-sm text-slate-500 mb-1">Progress</h4>
            <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="h-3 rounded-full bg-green-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{solvedForTopic} / {totalForTopic} solved • {progressPercent}%</div>
          </div>
        </aside>

        {/* Main */}
        <main className={`col-span-12 md:col-span-9 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{selectedTopic}</h2>
              <p className="text-sm text-slate-500">Add, mark, and manage your {selectedTopic} questions</p>
            </div>
          </div>

          {/* Add question form */}
          <div className="mt-4 border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Question title (e.g. Two Sum)"
                className="flex-1 px-3 py-2 border rounded-md bg-transparent"
              />
              <input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Link (leetcode.com/...)"
                className="flex-1 px-3 py-2 border rounded-md bg-transparent"
              />
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                className="px-3 py-2 border rounded-md bg-transparent"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button onClick={addQuestion} className="px-4 py-2 bg-blue-600 text-white rounded-md">Add</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {currentList.map((q) => (
              <article key={q.id} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-slate-100'} rounded-md shadow p-4 flex flex-col justify-between hover:shadow-md transition-all`}>
                <div>
                  <a
                    href={normalizeLink(q.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium block ${q.link ? 'text-blue-600 hover:underline' : 'text-slate-500'}`}
                  >
                    {q.title}
                  </a>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 border rounded-full ${difficultyBadge(q.difficulty)}`}>{q.difficulty || 'N/A'}</span>
                    <span>Added: {new Date(q.dateAdded).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => toggleSolved(q.id)}
                    className={`px-3 py-1 rounded-md text-sm ${solved[q.id] ? 'bg-green-100 text-green-700' : 'bg-slate-200 dark:bg-gray-600 dark:text-slate-200'}`}
                  >
                    {solved[q.id] ? 'Solved ✓' : 'Mark Solved'}
                  </button>
                  <button onClick={() => removeQuestion(q.id)} className="text-xs text-red-500">Remove</button>
                </div>
              </article>
            ))}

            {currentList.length === 0 && (
              <div className="col-span-full text-center text-slate-500">No questions yet — add one using the form above.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
