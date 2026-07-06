import { describe, expect, it } from 'vitest';
import {
  CHANGE_PASSWORD,
  CREATE_USER,
  DELETE_RATING,
  EDIT_RECIPE,
  RESET_PASSWORD,
  SET_NEW_PASSWORD,
} from './mutations';

describe('GraphQL mutation documents', () => {
  it('exports the expected mutation documents', () => {
    expect(CHANGE_PASSWORD).toBeDefined();
    expect(CREATE_USER).toBeDefined();
    expect(DELETE_RATING).toBeDefined();
    expect(EDIT_RECIPE).toBeDefined();
    expect(RESET_PASSWORD).toBeDefined();
    expect(SET_NEW_PASSWORD).toBeDefined();
  });
});
