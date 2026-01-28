import type { ContributionDay } from '../../-utils/github-stats-utils';

// Generate sample contribution data for 52 weeks (364 days)
const LEVELS: ContributionDay['level'][] = [0, 1, 2, 3, 4];
const pickLevel = (index: number): ContributionDay['level'] => LEVELS[index] ?? 0;

const generateContributionData = (): ContributionDay[] => {
  const days: ContributionDay[] = [];
  const today = new Date();

  for (let i = 363; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate random contribution level with some patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const random = Math.random();

    let level: 0 | 1 | 2 | 3 | 4;
    let count: number;

    if (isWeekend) {
      // Less activity on weekends
      if (random < 0.5) {
        level = 0;
        count = 0;
      } else if (random < 0.7) {
        level = 1;
        count = Math.floor(Math.random() * 3) + 1;
      } else {
        level = 2;
        count = Math.floor(Math.random() * 5) + 4;
      }
    } else if (random < 0.1) {
      // More activity on weekdays - rare no-activity days
      level = 0;
      count = 0;
    } else if (random < 0.3) {
      level = 1;
      count = Math.floor(Math.random() * 3) + 1;
    } else if (random < 0.6) {
      level = 2;
      count = Math.floor(Math.random() * 5) + 4;
    } else if (random < 0.85) {
      level = 3;
      count = Math.floor(Math.random() * 10) + 9;
    } else {
      level = 4;
      count = Math.floor(Math.random() * 15) + 20;
    }

    days.push({
      date: date.toISOString().split('T')[0] ?? '',
      count,
      level,
    });
  }

  return days;
};

export const sampleContributions = generateContributionData();

export const emptyContributions: ContributionDay[] = Array.from({ length: 364 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (363 - i));
  return {
    date: date.toISOString().split('T')[0] ?? '',
    count: 0,
    level: 0,
  };
});

export const sparseContributions: ContributionDay[] = Array.from({ length: 364 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (363 - i));
  const hasActivity = Math.random() < 0.15;
  return {
    date: date.toISOString().split('T')[0] ?? '',
    count: hasActivity ? Math.floor(Math.random() * 5) + 1 : 0,
    level: hasActivity ? pickLevel(Math.floor(Math.random() * 2) + 1) : 0,
  };
});

export const highActivityContributions: ContributionDay[] = Array.from({ length: 364 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (363 - i));
  const levels: (0 | 1 | 2 | 3 | 4)[] = [2, 3, 3, 4, 4];
  const level = levels[Math.floor(Math.random() * levels.length)] ?? 3;
  return {
    date: date.toISOString().split('T')[0] ?? '',
    count: level * 5,
    level,
  };
});
