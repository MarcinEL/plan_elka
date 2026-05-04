import { describe, it, expect } from 'vitest';
import { timeToRow, rowToTime, calculateSpan } from './ScheduleGrid';

describe('ScheduleGrid pure functions', () => {
  describe('timeToRow', () => {
    it('converts standard time to correct row', () => {
      expect(timeToRow('08:00')).toBe(1);
      expect(timeToRow('08:15')).toBe(2);
      expect(timeToRow('09:00')).toBe(5);
      expect(timeToRow('20:00')).toBe(49);
    });

    it('returns fallback 1 for invalid inputs', () => {
      expect(timeToRow(null)).toBe(1);
      expect(timeToRow(undefined)).toBe(1);
      expect(timeToRow('')).toBe(1);
      expect(timeToRow('invalid')).toBe(1);
    });
  });

  describe('rowToTime', () => {
    it('converts row to correct time', () => {
      expect(rowToTime(1)).toBe('08:00');
      expect(rowToTime(2)).toBe('08:15');
      expect(rowToTime(5)).toBe('09:00');
      expect(rowToTime(49)).toBe('20:00');
    });

    it('returns fallback 08:00 for invalid inputs', () => {
      expect(rowToTime(null)).toBe('08:00');
      expect(rowToTime(0)).toBe('08:00');
      expect(rowToTime(-5)).toBe('08:00');
      expect(rowToTime('abc')).toBe('08:00');
    });
  });

  describe('calculateSpan', () => {
    it('calculates span correctly based on 45min blocks and 15min breaks', () => {
      expect(calculateSpan(45)).toBe(3);
      expect(calculateSpan(90)).toBe(7);
      expect(calculateSpan(135)).toBe(11);
    });

    it('returns fallback 1 for invalid or zero inputs', () => {
      expect(calculateSpan(0)).toBe(1);
      expect(calculateSpan(-10)).toBe(1);
      expect(calculateSpan(null)).toBe(1);
      expect(calculateSpan('abc')).toBe(1);
    });
  });
});
