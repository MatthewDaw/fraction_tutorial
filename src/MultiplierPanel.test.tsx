import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiplierPanel, { MUSHROOM_PRIMES, MushroomPrime, primeFromScaleOp } from './MultiplierPanel';

describe('<MultiplierPanel />', () => {
  it('renders one mushroom button per prime in MUSHROOM_PRIMES (full palette = 5)', () => {
    render(<MultiplierPanel activePrime={null} onSelect={() => {}} />);
    for (const p of MUSHROOM_PRIMES) {
      expect(screen.getByRole('button', { name: `Multiplier: multiply by ${p}` })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button')).toHaveLength(MUSHROOM_PRIMES.length);
  });

  it('filters the rendered set by the `available` prop', () => {
    render(
      <MultiplierPanel activePrime={null} available={[2, 5] as readonly MushroomPrime[]} onSelect={() => {}} />,
    );
    expect(screen.getByRole('button', { name: /multiply by 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /multiply by 5/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /multiply by 3/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /multiply by 7/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /multiply by 11/i })).toBeNull();
  });

  it('returns null (renders nothing) when `available` is empty', () => {
    const { container } = render(
      <MultiplierPanel activePrime={null} available={[] as readonly MushroomPrime[]} onSelect={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('marks only the active prime with the --active class', () => {
    const { container } = render(<MultiplierPanel activePrime={3} onSelect={() => {}} />);
    const actives = container.querySelectorAll('.tool-btn--active');
    expect(actives).toHaveLength(1);
    expect(actives[0]).toHaveTextContent('×3');
  });

  it('fires onSelect with the prime on click when no prime is active', async () => {
    const onSelect = vi.fn();
    render(<MultiplierPanel activePrime={null} onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /multiply by 7/i }));
    expect(onSelect).toHaveBeenCalledWith(7);
  });

  it('fires onSelect with null when clicking the already-active prime (toggle off)', async () => {
    const onSelect = vi.fn();
    render(<MultiplierPanel activePrime={5} onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /multiply by 5/i }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('renders prime-count spots — one ellipse per prime value in each mushroom', () => {
    const { container } = render(<MultiplierPanel activePrime={null} onSelect={() => {}} />);
    for (const p of MUSHROOM_PRIMES) {
      const btn = screen.getByRole('button', { name: `Multiplier: multiply by ${p}` });
      const spots = btn.querySelectorAll('ellipse.mushroom-icon__spot');
      expect(spots.length).toBe(p);
    }
    // Sanity: each mushroom is its own SVG.
    expect(container.querySelectorAll('svg.mushroom-icon').length).toBe(MUSHROOM_PRIMES.length);
  });
});

describe('primeFromScaleOp', () => {
  it('parses scale:N into N for known primes', () => {
    expect(primeFromScaleOp('scale:2')).toBe(2);
    expect(primeFromScaleOp('scale:11')).toBe(11);
  });

  it('returns null for non-mushroom primes', () => {
    expect(primeFromScaleOp('scale:13')).toBeNull();
    expect(primeFromScaleOp('scale:4')).toBeNull();
  });

  it('returns null for ops that do not start with scale:', () => {
    expect(primeFromScaleOp('divide:2')).toBeNull();
    expect(primeFromScaleOp('')).toBeNull();
  });
});
