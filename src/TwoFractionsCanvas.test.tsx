import { useState } from 'react';
import { render, screen, fireEvent, createEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TwoFractionsCanvas, {
  FractionSide,
  displayedFraction,
  multiplierFactor,
} from './TwoFractionsCanvas';

const side = (num: number, denom: number, multipliers: Record<number, number> = {}): FractionSide => ({
  num,
  denom,
  multipliers,
});

// Stateful host so the per-side toolbar buttons can flow back into rendered
// output — TwoFractionsCanvas is a pure controlled component.
type HostProps = {
  initialLeft: FractionSide;
  initialRight: FractionSide;
  onCombine?: (c: { num: number; denom: number }) => void;
  onMatchedBases?: (denom: number) => void;
};

const Host = ({ initialLeft, initialRight, onCombine, onMatchedBases }: HostProps) => {
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);
  return (
    <TwoFractionsCanvas
      left={left}
      right={right}
      onChangeLeft={setLeft}
      onChangeRight={setRight}
      onCombine={onCombine ?? (() => {})}
      onMatchedBases={onMatchedBases}
    />
  );
};

// jsdom's PointerEvent ignores init dict properties like pointerId/clientX,
// so we fire a base event and define the geometry props ourselves.
const firePointer = (
  kind: 'pointerDown' | 'pointerMove' | 'pointerUp',
  el: Element,
  props: { pointerId: number; clientX: number; clientY: number },
) => {
  const evt = createEvent[kind](el, { bubbles: true });
  Object.defineProperty(evt, 'pointerId', { value: props.pointerId });
  Object.defineProperty(evt, 'clientX', { value: props.clientX });
  Object.defineProperty(evt, 'clientY', { value: props.clientY });
  fireEvent(el, evt);
};

const stubRect = (el: HTMLElement, rect: Partial<DOMRect>) => {
  const r: DOMRect = {
    left: 0, right: 0, top: 0, bottom: 0, x: 0, y: 0, width: 0, height: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect;
  el.getBoundingClientRect = () => r;
};

const textsOf = (selector: string): (string | null)[] =>
  Array.from(document.querySelectorAll(selector)).map((e) => e.textContent);
const denoms = () => textsOf('.two-fraction__den');
const nums = () => textsOf('.two-fraction__num');

describe('multiplierFactor', () => {
  it('returns 1 when no primes are active', () => {
    expect(multiplierFactor({})).toBe(1);
  });

  it('multiplies prime^count across keys', () => {
    expect(multiplierFactor({ 2: 3 })).toBe(8);
    expect(multiplierFactor({ 2: 2, 3: 1 })).toBe(12);
    expect(multiplierFactor({ 2: 1, 5: 1, 7: 1 })).toBe(70);
  });

  it('treats zero-count entries as identity', () => {
    expect(multiplierFactor({ 2: 0, 3: 0 })).toBe(1);
  });
});

describe('displayedFraction', () => {
  it('scales num and denom by the multiplier product', () => {
    expect(displayedFraction(side(1, 2))).toEqual({ num: 1, denom: 2 });
    expect(displayedFraction(side(1, 2, { 2: 1 }))).toEqual({ num: 2, denom: 4 });
    expect(displayedFraction(side(1, 3, { 3: 2 }))).toEqual({ num: 9, denom: 27 });
  });
});

describe('<TwoFractionsCanvas />', () => {
  it('renders independent per-side toolbars (each side has its own ×P buttons)', () => {
    render(<Host initialLeft={side(1, 2)} initialRight={side(1, 3)} />);
    const leftToolbar = screen.getByRole('toolbar', { name: /left mushrooms/i });
    const rightToolbar = screen.getByRole('toolbar', { name: /right mushrooms/i });
    // Each toolbar exposes all 5 primes {2,3,5,7,11}.
    expect(leftToolbar.querySelectorAll('button')).toHaveLength(5);
    expect(rightToolbar.querySelectorAll('button')).toHaveLength(5);
  });

  it("clicking the left side's ×2 bumps only the left displayed numerator/denom", async () => {
    render(<Host initialLeft={side(1, 2)} initialRight={side(1, 3)} />);
    const user = userEvent.setup();
    const leftToolbar = screen.getByRole('toolbar', { name: /left mushrooms/i });
    await user.click(leftToolbar.querySelector('button[aria-label="Multiply by 2"]')!);
    // Left now shows 2/4; right still 1/3.
    expect(denoms()).toEqual(['4', '3']);
    expect(nums()).toEqual(['2', '1']);
  });

  it('fires onMatchedBases on the rising edge when displayed denominators match', async () => {
    const onMatchedBases = vi.fn();
    // Start mismatched (1/2 vs 1/3); bumping left ×3 and right ×2 makes both denom=6.
    render(
      <Host initialLeft={side(1, 2)} initialRight={side(1, 3)} onMatchedBases={onMatchedBases} />,
    );
    const user = userEvent.setup();
    const leftToolbar = screen.getByRole('toolbar', { name: /left mushrooms/i });
    const rightToolbar = screen.getByRole('toolbar', { name: /right mushrooms/i });
    await user.click(leftToolbar.querySelector('button[aria-label="Multiply by 3"]')!); // left 3/6
    expect(onMatchedBases).not.toHaveBeenCalled();
    await user.click(rightToolbar.querySelector('button[aria-label="Multiply by 2"]')!); // right 2/6
    expect(onMatchedBases).toHaveBeenCalledTimes(1);
    expect(onMatchedBases).toHaveBeenCalledWith(6);
  });

  it('fires onMatchedBases once on initial render when bases already match', () => {
    const onMatchedBases = vi.fn();
    render(
      <Host initialLeft={side(1, 4)} initialRight={side(2, 4)} onMatchedBases={onMatchedBases} />,
    );
    expect(onMatchedBases).toHaveBeenCalledWith(4);
    expect(onMatchedBases).toHaveBeenCalledTimes(1);
  });

  it('marks the right side --draggable only when displayed denoms match', () => {
    // Mismatched start: no --draggable.
    const { unmount } = render(<Host initialLeft={side(1, 2)} initialRight={side(1, 3)} />);
    let sides = document.querySelectorAll('.two-fraction__side');
    expect(sides[1].classList.contains('two-fraction__side--draggable')).toBe(false);
    unmount();
    // Matched start: --draggable applied.
    render(<Host initialLeft={side(1, 4)} initialRight={side(1, 4)} />);
    sides = document.querySelectorAll('.two-fraction__side');
    expect(sides[1].classList.contains('two-fraction__side--draggable')).toBe(true);
  });

  it('on drop over the left zone, fires onCombine with the summed displayed numerator and shared denom', () => {
    const onCombine = vi.fn();
    // Left 1/4, Right 2/4 — already matched, combined should be 3/4.
    render(<Host initialLeft={side(1, 4)} initialRight={side(2, 4)} onCombine={onCombine} />);
    const fractions = document.querySelectorAll('.two-fraction__fraction');
    const leftEl = fractions[0] as HTMLElement;
    const rightEl = fractions[1] as HTMLElement;
    stubRect(leftEl, { left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 });
    stubRect(rightEl, { left: 200, right: 300, top: 0, bottom: 100, width: 100, height: 100 });
    firePointer('pointerDown', rightEl, { pointerId: 1, clientX: 250, clientY: 50 });
    firePointer('pointerMove', rightEl, { pointerId: 1, clientX: 50, clientY: 50 });
    firePointer('pointerUp', rightEl, { pointerId: 1, clientX: 50, clientY: 50 });
    expect(onCombine).toHaveBeenCalledTimes(1);
    expect(onCombine).toHaveBeenCalledWith({ num: 3, denom: 4 });
  });

  it('drops outside the left zone do NOT combine (snap-back path)', () => {
    const onCombine = vi.fn();
    render(<Host initialLeft={side(1, 4)} initialRight={side(2, 4)} onCombine={onCombine} />);
    const fractions = document.querySelectorAll('.two-fraction__fraction');
    const leftEl = fractions[0] as HTMLElement;
    const rightEl = fractions[1] as HTMLElement;
    stubRect(leftEl, { left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 });
    stubRect(rightEl, { left: 200, right: 300, top: 0, bottom: 100, width: 100, height: 100 });
    firePointer('pointerDown', rightEl, { pointerId: 1, clientX: 250, clientY: 50 });
    firePointer('pointerMove', rightEl, { pointerId: 1, clientX: 260, clientY: 50 });
    // Drop in the middle of nowhere (outside left rect).
    firePointer('pointerUp', rightEl, { pointerId: 1, clientX: 500, clientY: 500 });
    expect(onCombine).not.toHaveBeenCalled();
  });

  it('does not start a drag when displayed denoms do not match', () => {
    const onCombine = vi.fn();
    render(<Host initialLeft={side(1, 2)} initialRight={side(1, 3)} onCombine={onCombine} />);
    const fractions = document.querySelectorAll('.two-fraction__fraction');
    const rightEl = fractions[1] as HTMLElement;
    firePointer('pointerDown', rightEl, { pointerId: 1, clientX: 0, clientY: 0 });
    firePointer('pointerMove', rightEl, { pointerId: 1, clientX: 100, clientY: 100 });
    firePointer('pointerUp', rightEl, { pointerId: 1, clientX: 100, clientY: 100 });
    expect(onCombine).not.toHaveBeenCalled();
    // No drag = no --dragging class.
    const sides = document.querySelectorAll('.two-fraction__side');
    expect(sides[1].classList.contains('two-fraction__side--dragging')).toBe(false);
  });

  it('decrement chips appear for active primes and clicking them decrements', async () => {
    render(<Host initialLeft={side(1, 2)} initialRight={side(1, 3)} />);
    const user = userEvent.setup();
    const leftToolbar = screen.getByRole('toolbar', { name: /left mushrooms/i });
    await user.click(leftToolbar.querySelector('button[aria-label="Multiply by 2"]')!);
    await user.click(leftToolbar.querySelector('button[aria-label="Multiply by 2"]')!);
    // Left displayed = 1/2 × 2^2 = 4/8.
    expect(denoms()[0]).toBe('8');
    // The decrement chip for ×2 should now be present.
    await user.click(screen.getByRole('button', { name: /decrement multiplier by 2/i }));
    expect(denoms()[0]).toBe('4'); // 1/2 × 2 = 2/4
  });

  it('snap-back timer cleanup runs on unmount without throwing', () => {
    vi.useFakeTimers();
    try {
      const { unmount } = render(<Host initialLeft={side(1, 4)} initialRight={side(2, 4)} />);
      const fractions = document.querySelectorAll('.two-fraction__fraction');
      const rightEl = fractions[1] as HTMLElement;
      const leftEl = fractions[0] as HTMLElement;
      stubRect(leftEl, { left: 0, right: 10, top: 0, bottom: 10, width: 10, height: 10 });
      stubRect(rightEl, { left: 200, right: 210, top: 0, bottom: 10, width: 10, height: 10 });
      firePointer('pointerDown', rightEl, { pointerId: 1, clientX: 205, clientY: 5 });
      firePointer('pointerUp', rightEl, { pointerId: 1, clientX: 500, clientY: 500 });
      unmount();
      act(() => {
        vi.runAllTimers();
      });
      // No throw → cleanup worked.
    } finally {
      vi.useRealTimers();
    }
  });
});
