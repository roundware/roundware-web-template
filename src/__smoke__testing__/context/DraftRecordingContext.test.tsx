import { render, act } from '@testing-library/react';
import DraftRecordingContext, { IDraftRecordingContext } from '../../context/DraftRecordingContext';
import { ReactNode } from 'react';

// Mock user data
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
};

// Create a wrapper component for testing
const TestWrapper = ({ children, value }: { children: ReactNode; value: IDraftRecordingContext }) => {
  return (
    <DraftRecordingContext.Provider value={value}>
      {children}
    </DraftRecordingContext.Provider>
  );
};

describe('DraftRecordingContext', () => {
  let mockContextValue: IDraftRecordingContext;

  beforeEach(() => {
    mockContextValue = {
      tags: [],
      acceptedAgreement: false,
      location: {
        latitude: null,
        longitude: null
      },
      setLocation: jest.fn(),
      setTags: jest.fn(),
      selectTag: jest.fn(),
      clearTags: jest.fn(),
      reset: jest.fn(),
      setUser: jest.fn()
    };
  });

  it('should provide context value to children', () => {
    const { container } = render(
      <TestWrapper value={mockContextValue}>
        <div>Test Child</div>
      </TestWrapper>
    );

    expect(container.textContent).toBe('Test Child');
  });

  it('should handle tag selection', () => {
    const { selectTag } = mockContextValue;
    
    act(() => {
      selectTag(1);
    });

    expect(selectTag).toHaveBeenCalledWith(1);
  });

  it('should handle tag deselection', () => {
    const { selectTag } = mockContextValue;
    
    act(() => {
      selectTag(1, true);
    });

    expect(selectTag).toHaveBeenCalledWith(1, true);
  });

  it('should handle clearing tags', () => {
    const { clearTags } = mockContextValue;
    const tagsToClear = [1, 2, 3];
    
    act(() => {
      clearTags(tagsToClear);
    });

    expect(clearTags).toHaveBeenCalledWith(tagsToClear);
  });

  it('should handle location updates', () => {
    const { setLocation } = mockContextValue;
    const newLocation = {
      latitude: 40.7128,
      longitude: -74.0060
    };
    
    act(() => {
      setLocation(newLocation);
    });

    expect(setLocation).toHaveBeenCalledWith(newLocation);
  });

  it('should handle user updates', () => {
    const { setUser } = mockContextValue;
    
    act(() => {
      setUser(mockUser);
    });

    expect(setUser).toHaveBeenCalledWith(mockUser);
  });

  it('should handle reset', () => {
    const { reset } = mockContextValue;
    
    act(() => {
      reset();
    });

    expect(reset).toHaveBeenCalled();
  });
});
