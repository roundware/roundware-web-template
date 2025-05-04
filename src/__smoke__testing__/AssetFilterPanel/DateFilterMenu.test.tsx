import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DateFilterMenu from '../../components/AssetFilterPanel/DateFilterMenu';
import RoundwareContext from '../../context/RoundwareContext';
import { subDays } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Mock the useRoundware hook
jest.mock('../../hooks', () => ({
  useRoundware: () => ({
    roundware: {
      events: {
        logEvent: jest.fn(),
      },
      mixer: {
        updateParams: jest.fn(),
        playlist: {
          trackIdMap: {
            '1': true,
            '2': true,
          },
        },
        skipTrack: jest.fn(),
      },
    },
    afterDateFilter: null,
    setAfterDateFilter: jest.fn(),
    beforeDateFilter: null,
    setBeforeDateFilter: jest.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <RoundwareContext.Provider value={{} as any}>
        {component}
      </RoundwareContext.Provider>
    </LocalizationProvider>
  );
};

describe('DateFilterMenu', () => {
  it('renders without crashing', () => {
    renderWithProviders(<DateFilterMenu />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays date range options', () => {
    renderWithProviders(<DateFilterMenu />);

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Last Year')).toBeInTheDocument();
    expect(screen.getByText('Custom Range')).toBeInTheDocument();
    expect(screen.getByText('All Dates')).toBeInTheDocument();
  });

  it('shows custom date pickers when custom range is selected', async () => {
    renderWithProviders(<DateFilterMenu />);

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('Custom Range'));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /start date/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /end date/i })).toBeInTheDocument();
    });
  });

  it('shows success message when filters are updated', async () => {
    renderWithProviders(<DateFilterMenu />);

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('Last 7 days'));

    await waitFor(() => {
      expect(screen.getByText('Success! Filters updated.')).toBeInTheDocument();
    });
  });

  it('clears date filters when "All Dates" is selected', async () => {
    const setAfterDateFilter = jest.fn();
    const setBeforeDateFilter = jest.fn();

    jest.spyOn(require('../../hooks'), 'useRoundware').mockImplementation(() => ({
      roundware: {
        events: {
          logEvent: jest.fn(),
        },
        mixer: {
          updateParams: jest.fn(),
          playlist: {
            trackIdMap: {
              '1': true,
              '2': true,
            },
          },
          skipTrack: jest.fn(),
        },
      },
      afterDateFilter: new Date(),
      setAfterDateFilter,
      beforeDateFilter: new Date(),
      setBeforeDateFilter,
    }));

    renderWithProviders(<DateFilterMenu />);

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('All Dates'));

    await waitFor(() => {
      expect(setAfterDateFilter).toHaveBeenCalledWith(null);
      expect(setBeforeDateFilter).toHaveBeenCalledWith(null);
    });
  });

  it('updates date filters when a predefined range is selected', async () => {
    const setAfterDateFilter = jest.fn();
    const setBeforeDateFilter = jest.fn();
    const logEvent = jest.fn();
    const updateParams = jest.fn();
    const skipTrack = jest.fn();

    jest.spyOn(require('../../hooks'), 'useRoundware').mockImplementation(() => ({
      roundware: {
        events: {
          logEvent,
        },
        mixer: {
          updateParams,
          playlist: {
            trackIdMap: {
              '1': true,
              '2': true,
            },
          },
          skipTrack,
        },
      },
      afterDateFilter: null,
      setAfterDateFilter,
      beforeDateFilter: null,
      setBeforeDateFilter,
    }));

    renderWithProviders(<DateFilterMenu />);

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('Last 7 days'));

    await waitFor(() => {
      expect(setAfterDateFilter).toHaveBeenCalled();
      expect(setBeforeDateFilter).toHaveBeenCalled();
      expect(logEvent).toHaveBeenCalledWith('filter_stream', expect.any(Object));
      expect(updateParams).toHaveBeenCalled();
      expect(skipTrack).toHaveBeenCalledTimes(4); // Called twice for each track (start and end date updates)
    });
  });

  it('handles custom date selection', async () => {
    const setAfterDateFilter = jest.fn();
    const setBeforeDateFilter = jest.fn();
    const logEvent = jest.fn();
    const updateParams = jest.fn();
    const skipTrack = jest.fn();

    jest.spyOn(require('../../hooks'), 'useRoundware').mockImplementation(() => ({
      roundware: {
        events: {
          logEvent,
        },
        mixer: {
          updateParams,
          playlist: {
            trackIdMap: {
              '1': true,
              '2': true,
            },
          },
          skipTrack,
        },
      },
      afterDateFilter: null,
      setAfterDateFilter,
      beforeDateFilter: null,
      setBeforeDateFilter,
    }));

    renderWithProviders(<DateFilterMenu />);

    // Select custom range
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('Custom Range'));

    // Wait for date pickers to appear
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /start date/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /end date/i })).toBeInTheDocument();
    });

    // Select dates
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');

    const startDateInput = screen.getByRole('textbox', { name: /start date/i });
    const endDateInput = screen.getByRole('textbox', { name: /end date/i });

    fireEvent.change(startDateInput, { target: { value: '01/01/2023' } });
    fireEvent.change(endDateInput, { target: { value: '01/31/2023' } });

    await waitFor(() => {
      expect(setAfterDateFilter).toHaveBeenCalled();
      expect(setBeforeDateFilter).toHaveBeenCalled();
      expect(logEvent).toHaveBeenCalledWith('filter_stream', expect.any(Object));
      expect(updateParams).toHaveBeenCalled();
      expect(skipTrack).toHaveBeenCalledTimes(4); // Called twice for each track (start and end date updates)
    });
  });

  
}); 