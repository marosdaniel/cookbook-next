import { describe, expect, it } from 'vitest';
import {
  EMAIL_COLORS,
  EMAIL_FONTS,
  EMAIL_RADIUS,
  EMAIL_SPACING,
} from './index';

describe('email template shared index', () => {
  it('re-exports the shared email style constants', () => {
    expect(EMAIL_COLORS).toBeDefined();
    expect(EMAIL_FONTS).toBeDefined();
    expect(EMAIL_RADIUS).toBeDefined();
    expect(EMAIL_SPACING).toBeDefined();
  });
});
