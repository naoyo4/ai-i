import { describe, it, expect } from 'vitest';
import { INTERVIEW_TOPICS } from '@/lib/types';

describe('INTERVIEW_TOPICS', () => {
  it('has at least one topic', () => {
    expect(INTERVIEW_TOPICS.length).toBeGreaterThan(0);
  });

  it('each topic has required fields', () => {
    for (const topic of INTERVIEW_TOPICS) {
      expect(topic.id).toBeTruthy();
      expect(topic.title).toBeTruthy();
      expect(topic.description).toBeTruthy();
      expect(topic.questionsCount).toBeGreaterThan(0);
      expect(topic.durationMinutes).toBeGreaterThan(0);
      expect(topic.icon).toBeTruthy();
      expect(topic.color).toBeTruthy();
    }
  });

  it('each topic has a unique id', () => {
    const ids = INTERVIEW_TOPICS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
