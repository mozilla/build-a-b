import { describe, it, expect } from 'vitest';
import { capitalize } from '../capitalize';

describe('capitalize', () => {
  it('should convert snake_case to capitalized words', () => {
    expect(capitalize('hello_world')).toBe('Hello World');
    expect(capitalize('snake_case_string')).toBe('Snake Case String');
  });

  it('should handle single words', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('should handle ALL_CAPS snake_case', () => {
    expect(capitalize('HELLO_WORLD')).toBe('Hello World');
    expect(capitalize('TEST_VALUE')).toBe('Test Value');
    expect(capitalize('SOME_CONSTANT_NAME')).toBe('Some Constant Name');
  });

  it('should handle mixed case', () => {
    expect(capitalize('HeLLo_WoRLd')).toBe('Hello World');
    expect(capitalize('MiXeD_CaSe')).toBe('Mixed Case');
  });

  it('should handle lowercase strings', () => {
    expect(capitalize('lowercase_string')).toBe('Lowercase String');
    expect(capitalize('test_value')).toBe('Test Value');
  });

  it('should handle single character words', () => {
    expect(capitalize('a_b_c')).toBe('A B C');
    expect(capitalize('x_y_z')).toBe('X Y Z');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle strings with numbers', () => {
    expect(capitalize('test_123')).toBe('Test 123');
    expect(capitalize('value_1_test')).toBe('Value 1 Test');
  });

  it('should handle strings without underscores', () => {
    expect(capitalize('singleword')).toBe('Singleword');
    expect(capitalize('UPPERCASE')).toBe('Uppercase');
  });

  it('should handle multiple consecutive underscores', () => {
    expect(capitalize('hello__world')).toBe('Hello  World');
    expect(capitalize('test___value')).toBe('Test   Value');
  });

  it('should handle leading and trailing underscores', () => {
    expect(capitalize('_hello_world')).toBe(' Hello World');
    expect(capitalize('hello_world_')).toBe('Hello World ');
    expect(capitalize('_hello_world_')).toBe(' Hello World ');
  });

  it('should handle special characters', () => {
    expect(capitalize('test_value_123')).toBe('Test Value 123');
    expect(capitalize('hello_world_v2')).toBe('Hello World V2');
  });
});
