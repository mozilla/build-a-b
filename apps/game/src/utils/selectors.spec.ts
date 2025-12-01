import { describe, expect, it } from 'vitest';
import {
  getBackgroundById,
  getBackgroundImage,
  getBillionaireById,
  getBillionaireImage,
} from './selectors';

describe('selectors', () => {
  describe('getBillionaireById', () => {
    it('should return billionaire object when valid ID is provided', () => {
      const billionaire = getBillionaireById('chaz');
      expect(billionaire).toBeDefined();
      expect(billionaire?.id).toBe('chaz');
      expect(billionaire?.imageSrc).toBeDefined();
    });

    it('should return null when billionaire ID is not found', () => {
      const billionaire = getBillionaireById('nonexistent');
      expect(billionaire).toBeNull();
    });

    it('should return null when ID is null', () => {
      const billionaire = getBillionaireById(null);
      expect(billionaire).toBeNull();
    });

    it('should return null when ID is undefined', () => {
      const billionaire = getBillionaireById(undefined);
      expect(billionaire).toBeNull();
    });
  });

  describe('getBackgroundById', () => {
    it('should return background object when valid ID is provided', () => {
      const background = getBackgroundById('chaz');
      expect(background).toBeDefined();
      expect(background?.id).toBe('chaz');
      expect(background?.imageSrc).toBeDefined();
    });

    it('should return null when background ID is not found', () => {
      const background = getBackgroundById('nonexistent');
      expect(background).toBeNull();
    });

    it('should return null when ID is null', () => {
      const background = getBackgroundById(null);
      expect(background).toBeNull();
    });

    it('should return null when ID is undefined', () => {
      const background = getBackgroundById(undefined);
      expect(background).toBeNull();
    });
  });

  describe('getBillionaireImage', () => {
    it('should return image source when valid ID is provided', () => {
      const imageSrc = getBillionaireImage('chaz');
      expect(imageSrc).toBeDefined();
      expect(imageSrc).not.toBeNull();
      // imageSrc is imported from Vite, so it's a string path
      expect(typeof imageSrc).toBe('string');
    });

    it('should return null when billionaire ID is not found', () => {
      const imageSrc = getBillionaireImage('nonexistent');
      expect(imageSrc).toBeNull();
    });

    it('should return null when ID is null', () => {
      const imageSrc = getBillionaireImage(null);
      expect(imageSrc).toBeNull();
    });

    it('should return null when ID is undefined', () => {
      const imageSrc = getBillionaireImage(undefined);
      expect(imageSrc).toBeNull();
    });
  });

  describe('getBackgroundImage', () => {
    it('should return image source when valid ID is provided', () => {
      const imageSrc = getBackgroundImage('chaz');
      expect(imageSrc).toBeDefined();
      expect(imageSrc).not.toBeNull();
      // imageSrc is imported from Vite, so it's a string path
      expect(typeof imageSrc).toBe('string');
    });

    it('should return null when background ID is not found', () => {
      const imageSrc = getBackgroundImage('nonexistent');
      expect(imageSrc).toBeNull();
    });

    it('should return null when ID is null', () => {
      const imageSrc = getBackgroundImage(null);
      expect(imageSrc).toBeNull();
    });

    it('should return null when ID is undefined', () => {
      const imageSrc = getBackgroundImage(undefined);
      expect(imageSrc).toBeNull();
    });
  });
});
