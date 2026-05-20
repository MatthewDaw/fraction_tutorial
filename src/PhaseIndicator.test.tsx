import { render, screen } from '@testing-library/react';
import PhaseIndicator from './PhaseIndicator';

describe('<PhaseIndicator />', () => {
  it('renders all three phase chips with their labels and numbers', () => {
    render(<PhaseIndicator activePhase={0} />);
    expect(screen.getByText('Equate')).toBeInTheDocument();
    expect(screen.getByText('Combine')).toBeInTheDocument();
    expect(screen.getByText('Simplify')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it.each([
    [0, 'Equate'],
    [1, 'Combine'],
    [2, 'Simplify'],
  ] as const)('marks chip %i (%s) active', (active, label) => {
    const { container } = render(<PhaseIndicator activePhase={active} />);
    const activeEls = container.querySelectorAll('.phase-chip--active');
    expect(activeEls).toHaveLength(1);
    expect(activeEls[0]).toHaveTextContent(label);
  });

  it('uses role="status" with the Capstone phase aria-label', () => {
    render(<PhaseIndicator activePhase={1} />);
    expect(screen.getByRole('status', { name: /capstone phase/i })).toBeInTheDocument();
  });
});
