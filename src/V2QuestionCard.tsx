import {
  V2ConceptId,
  V2Tab,
  V2_CONCEPT_LABELS,
  V2_LESSON_TABS,
  V2_MODULES,
  V2_MODULE_CONCEPTS,
  V2_MODULE_LABELS,
} from './v2lessons';

type Props = {
  conceptId: V2ConceptId;
  tab: V2Tab;
  prompt: string;
  stepIdx: number;
  stepCount: number;
  canGoBack: boolean;
  showNext: boolean;
  nextLabel?: string;
  // Optional Yes/No guess on the current lesson step.
  guessCorrect?: 'yes' | 'no';
  guessExplanation?: string;
  userGuess?: 'yes' | 'no' | null;
  onGuess?: (answer: 'yes' | 'no') => void;
  // Quiz test state (used when tab === 'test' and the lesson has a pool-driven test).
  testQuizActive?: boolean;
  testCurrentDenom?: number | null;
  testSolved?: boolean;
  testFailed?: boolean;
  testComplete?: boolean;
  testTotalRounds?: number;
  testAskedCount?: number;
  testHint?: string;
  nextLessonLabel?: string | null;
  onConceptChange: (id: V2ConceptId) => void;
  onTabChange: (tab: V2Tab) => void;
  onStepChange: (idx: number) => void;
  onRestart: () => void;
  onBack: () => void;
  onNext: () => void;
  onTestRestart?: () => void;
  onTestNextLesson?: () => void;
};

const V2_TAB_LABELS: Record<V2Tab, string> = { lesson: 'Lesson', test: 'Test' };

const FRACTICAL_COLORS = [
  '#ff5d8f',
  '#ff8e3c',
  '#ffd24a',
  '#4ade80',
  '#4cc9f0',
  '#5b8def',
  '#a06cd5',
  '#ff5d8f',
  '#ff8e3c',
  '#ffd24a',
];

const SMASH_COLORS = ['#ff5d8f', '#ff8e3c', '#ffd24a', '#4cc9f0', '#a06cd5'];

const renderPromptInline = (text: string) => {
  const parts = text.split(/(Fractical!?|[235] hammer|SMASH)/);
  return parts.map((part, i) => {
    if (/^Fractical!?$/.test(part)) {
      return (
        <span key={i} className="fractical-logo">
          {[...part].map((ch, j) => (
            <span key={j} style={{ color: FRACTICAL_COLORS[j % FRACTICAL_COLORS.length] }}>
              {ch}
            </span>
          ))}
        </span>
      );
    }
    const hammerMatch = /^([235]) hammer$/.exec(part);
    if (hammerMatch) {
      return (
        <span key={i}>
          {hammerMatch[1]} <span className="metal-tag">HAMMER</span>
        </span>
      );
    }
    if (part === 'SMASH') {
      return (
        <span key={i} className="smash-text">
          {[...part].map((ch, j) => (
            <span key={j} style={{ color: SMASH_COLORS[j % SMASH_COLORS.length] }}>
              {ch}
            </span>
          ))}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const renderPrompt = (prompt: string) =>
  prompt.split('\n\n').map((para, i) => (
    <p key={i} className="question-card__prompt-para">
      {renderPromptInline(para)}
    </p>
  ));

const V2QuestionCard = ({
  conceptId,
  tab,
  prompt,
  stepIdx,
  stepCount,
  canGoBack,
  showNext,
  nextLabel = 'Next',
  guessCorrect,
  guessExplanation,
  userGuess = null,
  onGuess,
  testQuizActive = false,
  testCurrentDenom = null,
  testSolved = false,
  testFailed = false,
  testComplete = false,
  testTotalRounds = 0,
  testAskedCount = 0,
  testHint,
  nextLessonLabel,
  onConceptChange,
  onTabChange,
  onStepChange,
  onRestart,
  onBack,
  onNext,
  onTestRestart,
  onTestNextLesson,
}: Props) => {
  return (
    <div className="question-card">
      <label className="question-card__concept">
        <span className="question-card__concept-label">Lesson</span>
        <select
          value={conceptId}
          onChange={(e) => onConceptChange(e.target.value as V2ConceptId)}
        >
          {V2_MODULES.map((mod) => (
            <optgroup key={mod} label={V2_MODULE_LABELS[mod]}>
              {V2_MODULE_CONCEPTS[mod].map((id) => (
                <option key={id} value={id}>
                  {V2_CONCEPT_LABELS[id]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {V2_LESSON_TABS[conceptId].length > 1 && (
        <div className="lesson-tabs" role="tablist" aria-label="Lesson view">
          {V2_LESSON_TABS[conceptId].map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={`lesson-tab${tab === t ? ' lesson-tab--active' : ''}`}
              onClick={() => onTabChange(t)}
            >
              {V2_TAB_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {tab === 'lesson' ? (
        <>
          <div className="question-card__actions">
            <button
              type="button"
              className="question-card__action"
              onClick={onBack}
              disabled={!canGoBack}
            >
              <span aria-hidden="true">←</span> Back
            </button>
            <button type="button" className="question-card__action" onClick={onRestart}>
              <span aria-hidden="true">⟲</span> Restart
            </button>
            <label className="question-card__step">
              <span className="question-card__step-label">Step</span>
              <select
                value={stepIdx}
                onChange={(e) => onStepChange(Number(e.target.value))}
              >
                {Array.from({ length: stepCount }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1} / {stepCount}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="question-card__prompt">{renderPrompt(prompt)}</div>
          {guessCorrect && (
            <div className="lesson-guess">
              <div className="lesson-guess__choices" role="group" aria-label="Your answer">
                {(['yes', 'no'] as const).map((opt) => {
                  const isSelected = userGuess === opt;
                  const isCorrectOpt = guessCorrect === opt;
                  const answered = userGuess != null;
                  const showCorrect = answered && isCorrectOpt;
                  const showWrong = answered && isSelected && !isCorrectOpt;
                  const classes = [
                    'lesson-guess__choice',
                    isSelected && 'lesson-guess__choice--selected',
                    showCorrect && 'lesson-guess__choice--correct',
                    showWrong && 'lesson-guess__choice--wrong',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={classes}
                      disabled={answered}
                      onClick={() => onGuess?.(opt)}
                    >
                      {opt === 'yes' ? 'Yes' : 'No'}
                    </button>
                  );
                })}
              </div>
              {userGuess && guessExplanation && (
                <p
                  className={`lesson-guess__explanation lesson-guess__explanation--${
                    userGuess === guessCorrect ? 'right' : 'wrong'
                  }`}
                >
                  {userGuess === guessCorrect ? '✓ ' : '✗ '}
                  {guessExplanation}
                </p>
              )}
            </div>
          )}
          {showNext && (
            <button type="button" className="lesson-next" onClick={onNext}>
              {nextLabel} <span aria-hidden="true">→</span>
            </button>
          )}
        </>
      ) : testQuizActive ? (
        <div className="test-quiz">
          {testComplete ? (
            <>
              <p className="test-result test-result--complete">
                🎉 Test complete! You finished all {testTotalRounds} questions.
              </p>
              {nextLessonLabel ? (
                <button
                  type="button"
                  className="lesson-next"
                  onClick={onTestNextLesson}
                >
                  Next lesson: {nextLessonLabel} <span aria-hidden="true">→</span>
                </button>
              ) : (
                <p className="test-final">
                  🎓 You've finished all the lessons! Pick any one from the dropdown to revisit.
                </p>
              )}
            </>
          ) : (
            <>
              {testTotalRounds > 0 && (
                <p className="test-progress">
                  Question {Math.min(testAskedCount + 1, testTotalRounds)} of {testTotalRounds}
                </p>
              )}
              <div className="question-card__prompt">{renderPrompt(prompt)}</div>
              {testHint && !testSolved && !testFailed && (
                <p className="test-hint">{testHint}</p>
              )}
              {testSolved ? (
                <p className="test-result test-result--success">
                  🎉 You made 1/{testCurrentDenom}!
                </p>
              ) : testFailed ? (
                <>
                  <p className="test-result test-result--failed">
                    🤔 We can't get to 1/{testCurrentDenom} from here — let's start over!
                  </p>
                  <button
                    type="button"
                    className="test-restart"
                    onClick={onTestRestart}
                  >
                    Start over
                  </button>
                </>
              ) : null}
            </>
          )}
        </div>
      ) : prompt ? (
        <div className="question-card__prompt">{renderPrompt(prompt)}</div>
      ) : (
        <p className="question-card__prompt question-card__prompt--muted">
          Test coming soon.
        </p>
      )}
    </div>
  );
};

export default V2QuestionCard;
