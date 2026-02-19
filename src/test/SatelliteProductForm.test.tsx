import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SatelliteProductForm from '@/components/admin/SatelliteProductForm';

describe('SatelliteProductForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false,
    mode: 'create' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form fields', () => {
    render(<SatelliteProductForm {...defaultProps} />);

    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/provider/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sensor type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/availability/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/coverage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/resolution \(meters\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/resolution category/i)).toBeInTheDocument();
  });

  it('displays validation errors when submitting empty form', async () => {
    render(<SatelliteProductForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /create product/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/provider is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/coverage is required/i)).toBeInTheDocument();
      expect(screen.getByText(/at least one band must be selected/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('populates form with initial data in update mode', () => {
    const initialData = {
      name: 'Test Satellite',
      provider: 'Test Provider',
      sensor_type: 'optical' as const,
      resolution: 0.5,
      resolution_category: 'vhr' as const,
      bands: ['RGB', 'NIR'],
      coverage: 'Global',
      availability: 'both' as const,
      description: 'Test description',
      sample_image_url: '/test.jpg',
      specifications: {
        swath_width: 10,
        revisit_time: 1
      },
      pricing_info: 'Contact for pricing',
      status: 'active' as const,
      order: 0
    };

    render(
      <SatelliteProductForm 
        {...defaultProps} 
        initialData={initialData}
        mode="update"
      />
    );

    expect(screen.getByDisplayValue('Test Satellite')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Provider')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Global')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
  });

  it('allows selecting multiple bands', () => {
    render(<SatelliteProductForm {...defaultProps} />);

    const rgbCheckbox = screen.getByLabelText('RGB');
    const nirCheckbox = screen.getByLabelText('NIR');

    fireEvent.click(rgbCheckbox);
    fireEvent.click(nirCheckbox);

    expect(rgbCheckbox).toBeChecked();
    expect(nirCheckbox).toBeChecked();
  });

  it('calls onSubmit with form data when valid', async () => {
    render(<SatelliteProductForm {...defaultProps} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: 'Test Satellite' }
    });
    fireEvent.change(screen.getByLabelText(/provider/i), {
      target: { value: 'Test Provider' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' }
    });
    fireEvent.change(screen.getByLabelText(/coverage/i), {
      target: { value: 'Global' }
    });
    fireEvent.change(screen.getByLabelText(/resolution \(meters\)/i), {
      target: { value: '0.5' }
    });

    // Select at least one band
    const rgbCheckbox = screen.getByLabelText('RGB');
    fireEvent.click(rgbCheckbox);

    const submitButton = screen.getByRole('button', { name: /create product/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Satellite',
          provider: 'Test Provider',
          description: 'Test description',
          coverage: 'Global',
          resolution: 0.5,
          bands: ['RGB']
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<SatelliteProductForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when loading', () => {
    render(<SatelliteProductForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /saving/i });
    expect(submitButton).toBeDisabled();
  });

  it('validates resolution must be greater than 0', async () => {
    render(<SatelliteProductForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/resolution \(meters\)/i), {
      target: { value: '0' }
    });

    const submitButton = screen.getByRole('button', { name: /create product/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/resolution must be greater than 0/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows toggling bands on and off', () => {
    render(<SatelliteProductForm {...defaultProps} />);

    const rgbCheckbox = screen.getByLabelText('RGB');

    // Check
    fireEvent.click(rgbCheckbox);
    expect(rgbCheckbox).toBeChecked();

    // Uncheck
    fireEvent.click(rgbCheckbox);
    expect(rgbCheckbox).not.toBeChecked();
  });

  it('updates specifications fields correctly', () => {
    render(<SatelliteProductForm {...defaultProps} />);

    const swathWidthInput = screen.getByLabelText(/swath width/i);
    const revisitTimeInput = screen.getByLabelText(/revisit time/i);

    fireEvent.change(swathWidthInput, { target: { value: '10.5' } });
    fireEvent.change(revisitTimeInput, { target: { value: '2' } });

    expect(swathWidthInput).toHaveValue(10.5);
    expect(revisitTimeInput).toHaveValue(2);
  });
});
