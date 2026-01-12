import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RSVPForm from './RSVPForm';
import { createRSVP } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

jest.mock('@/lib/api');
jest.mock('@/contexts/ToastContext');

const mockCreateRSVP = createRSVP as jest.MockedFunction<typeof createRSVP>;
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};

(useToast as jest.Mock).mockReturnValue(mockToast);

describe('RSVPForm Component', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (localStorage.setItem as jest.Mock).mockClear();
  });

  it('should sanitize XSS attacks and submit clean data', async () => {
    render(<RSVPForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit rsvp/i });

    const xssAttack = "<script>alert('XSS')</script>John";
    const validEmail = 'test@example.com';

    fireEvent.change(nameInput, { target: { value: xssAttack } });
    fireEvent.blur(nameInput);
    fireEvent.change(emailInput, { target: { value: validEmail } });
    fireEvent.blur(emailInput);

    mockCreateRSVP.mockResolvedValueOnce({
      rsvp: { id: 1, name: 'John', email: validEmail, created_at: new Date().toISOString() },
      token: 'test_token',
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateRSVP).toHaveBeenCalled();
    });

    const callArgs = mockCreateRSVP.mock.calls[0];
    expect(callArgs[0]).not.toContain('<script>');
    expect(callArgs[0]).not.toContain('alert');
    expect(callArgs[0]).not.toContain('<');
    expect(callArgs[0]).not.toContain('>');
    expect(callArgs[1]).toBe(validEmail);
  });

  it('should validate inputs, show errors, and prevent invalid submission', async () => {
    render(<RSVPForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit rsvp/i });

    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.blur(nameInput);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(mockCreateRSVP).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});

