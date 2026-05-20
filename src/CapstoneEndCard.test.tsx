import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CapstoneEndCard, { CapstoneProblem } from './CapstoneEndCard';

const problems: CapstoneProblem[] = [
  {
    left: { num: 1, denom: 2 },
    right: { num: 1, denom: 4 },
    result: { num: 3, denom: 4 },
  },
  {
    left: { num: 2, denom: 3 },
    right: { num: 1, denom: 6 },
    result: { num: 5, denom: 6 },
  },
];

describe('<CapstoneEndCard />', () => {
  it('renders the score as the typographic anchor (problemsSolved / totalProblems)', () => {
    render(
      <CapstoneEndCard
        problemsSolved={4}
        totalProblems={5}
        problems={problems}
        onRetry={() => {}}
      />,
    );
    const scoreNum = document.querySelector('.capstone-end-card__score-num');
    const scoreDen = document.querySelector('.capstone-end-card__score-den');
    expect(scoreNum).toHaveTextContent('4');
    expect(scoreDen).toHaveTextContent('5');
  });

  it('shows the passed caption when `passed` is true', () => {
    render(
      <CapstoneEndCard
        problemsSolved={5}
        totalProblems={5}
        problems={problems}
        passed
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/first try/i)).toBeInTheDocument();
  });

  it('shows the retry caption when `passed` is false/undefined', () => {
    render(
      <CapstoneEndCard
        problemsSolved={2}
        totalProblems={5}
        problems={problems}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/this run/i)).toBeInTheDocument();
  });

  it('fires onRetry when the Try-Another-Set button is clicked', async () => {
    const onRetry = vi.fn();
    render(
      <CapstoneEndCard
        problemsSolved={3}
        totalProblems={5}
        problems={problems}
        onRetry={onRetry}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /try another set/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders one proof row per problem with the operands and result', () => {
    render(
      <CapstoneEndCard
        problemsSolved={2}
        totalProblems={5}
        problems={problems}
        onRetry={() => {}}
      />,
    );
    const rows = document.querySelectorAll('.capstone-end-card__proof-row');
    expect(rows).toHaveLength(problems.length);
  });

  it('skips the equals/result when a problem has no `result`', () => {
    const partial: CapstoneProblem[] = [{ left: { num: 1, denom: 2 }, right: { num: 1, denom: 3 } }];
    render(
      <CapstoneEndCard
        problemsSolved={0}
        totalProblems={1}
        problems={partial}
        onRetry={() => {}}
      />,
    );
    expect(document.querySelector('.capstone-end-card__eq')).toBeNull();
  });

  it('omits the proof block when there are no problems', () => {
    render(
      <CapstoneEndCard
        problemsSolved={0}
        totalProblems={5}
        problems={[]}
        onRetry={() => {}}
      />,
    );
    expect(document.querySelector('.capstone-end-card__proof')).toBeNull();
  });
});
