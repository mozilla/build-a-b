import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LDProviderWrapper from '@/components/LDProviderWrapper';

describe('LDProviderWrapper', () => {
  test('renders children when no clientSideID is provided', () => {
    // Ensure environment variable is undefined
    // @ts-expect-error - Deleting process.env property for test isolation
    delete process.env.NEXT_PUBLIC_LD_CLIENT_ID;
    render(
      <LDProviderWrapper>
        <div>Test Content</div>
      </LDProviderWrapper>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders children when clientSideID is provided', () => {
    process.env.NEXT_PUBLIC_LD_CLIENT_ID = 'dummy-key';
    render(
      <LDProviderWrapper>
        <span>Flag Content</span>
      </LDProviderWrapper>,
    );
    expect(screen.getByText('Flag Content')).toBeInTheDocument();
  });
});
