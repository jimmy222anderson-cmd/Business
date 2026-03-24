/**
 * Component rendering tests for key satellite imagery explorer components
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';

// ---------------------------------------------------------------------------
// EmptyState component
// ---------------------------------------------------------------------------

describe('EmptyState', () => {
  it('renders title and message', () => {
    render(
      <EmptyState
        icon={FileText}
        title="No requests found"
        message="You have not submitted any imagery requests yet."
      />
    );

    expect(screen.getByText('No requests found')).toBeInTheDocument();
    expect(screen.getByText('You have not submitted any imagery requests yet.')).toBeInTheDocument();
  });

  it('renders action button when action prop is provided', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        icon={FileText}
        title="Empty"
        message="Nothing here."
        action={{ label: 'Create Request', onClick: handleClick }}
      />
    );

    const button = screen.getByRole('button', { name: 'Create Request' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not render action button when action prop is omitted', () => {
    render(
      <EmptyState icon={FileText} title="Empty" message="Nothing here." />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState
        icon={FileText}
        title="Empty"
        message="Nothing here."
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

// ---------------------------------------------------------------------------
// ErrorState component
// ---------------------------------------------------------------------------

describe('ErrorState', () => {
  it('renders default title and provided message', () => {
    render(<ErrorState message="Something went wrong with the request." />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong with the request.')).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<ErrorState title="Load Failed" message="Could not load data." />);

    expect(screen.getByText('Load Failed')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const handleRetry = vi.fn();
    render(<ErrorState message="Error occurred." onRetry={handleRetry} />);

    const button = screen.getByRole('button', { name: 'Try Again' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it('renders custom retry label', () => {
    render(
      <ErrorState
        message="Error occurred."
        onRetry={() => {}}
        retryLabel="Reload"
      />
    );

    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is omitted', () => {
    render(<ErrorState message="Error occurred." />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ErrorState message="Error." className="error-wrapper" />
    );

    expect(container.firstChild).toHaveClass('error-wrapper');
  });
});

// ---------------------------------------------------------------------------
// ProductCard component
// ---------------------------------------------------------------------------

const mockProduct: Product = {
  id: 'prod-1',
  name: 'WorldView-3',
  slug: 'worldview-3',
  description: 'High-resolution commercial satellite imagery from Maxar.',
  longDescription: 'WorldView-3 provides 31cm panchromatic resolution.',
  image: '/images/worldview-3.jpg',
  pricingBadge: 'Contact for pricing',
  features: [],
  useCases: [],
  specifications: [],
  category: 'imagery',
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    expect(screen.getByText('WorldView-3')).toBeInTheDocument();
  });

  it('renders product description', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    expect(screen.getByText(/High-resolution commercial satellite imagery/)).toBeInTheDocument();
  });

  it('renders pricing badge when provided', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    expect(screen.getByText('Contact for pricing')).toBeInTheDocument();
  });

  it('does not render pricing badge when not provided', () => {
    const productWithoutBadge = { ...mockProduct, pricingBadge: undefined };
    render(
      <MemoryRouter>
        <ProductCard product={productWithoutBadge} />
      </MemoryRouter>
    );
    expect(screen.queryByText('Contact for pricing')).not.toBeInTheDocument();
  });

  it('renders "Learn More" link pointing to product slug', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /learn more/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/products/worldview-3');
  });

  it('renders product image with alt text', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );
    const img = screen.getByRole('img', { name: 'WorldView-3' });
    expect(img).toBeInTheDocument();
  });

  it('renders in grid variant without carousel min-width class', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard product={mockProduct} variant="grid" />
      </MemoryRouter>
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain('min-w-');
  });
});
