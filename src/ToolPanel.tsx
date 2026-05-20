import { AllowedOp } from './questions';

export type Tool =
  | { kind: 'hammer'; n: number }
  | { kind: 'glue' }
  | null;

type Props = {
  activeTool: Tool;
  allowedOps: AllowedOp[];
  lockedOps?: AllowedOp[];
  onSelect: (tool: Tool) => void;
};

const HAMMER_DIVISIONS = [2, 3, 5];
const HAMMER_ICON_SIZE: Record<number, number> = { 2: 18, 3: 26, 5: 34 };

// Hammer silhouettes from game-icons.net (CC BY 3.0).
// 2: claw-hammer (lorc), 3: toy-mallet (delapouite), 5: flat-hammer (lorc).
export const HAMMER_PATHS: Record<number, string> = {
  2: 'M215.97 27.813c-2.218.04-4.35.177-6.407.375l-.532.062c-2.774.266-5.796 1.01-9.124 1.844-4.418 1.11-8.096 2.607-11.125 4.406l77.782 59.313 7.375 5.656-5.593 7.405-13.72 18.156 67.595 51.626 14.217-18.812 9.47-12.53 6.5 14.342 19.656 43.47 60.593-80.095-47.187-7.124-15.533-2.312 9.47-12.563 14.28-18.843-67.593-51.624L310.78 50.78l-5.03 6.657-7.188-4.25c-28.635-16.917-58.02-25.157-80.343-25.374a76.706 76.706 0 0 0-2.25 0zM453 127.124l-71.47 94.438 34.564 26.187c44.24-20.22 64.01-52.594 71.312-94.625l-34.406-26zm-193.688 25.03c-27.17 33.09-55.308 64.706-82.812 96.22l47.406 39.875c23.11-35.343 46.336-71.61 71.938-108.22l-36.53-27.874zM164.25 262.47c-11.355 13.115-22.564 26.254-33.5 39.5l48.375 52.717c11.707-16.6 23.107-33.515 34.438-50.687l-49.313-41.53zm-45.438 54.124a1111.646 1111.646 0 0 0-23.093 29.72l33.468 73.842c13.586-16.22 26.434-32.893 38.843-49.937l-49.218-53.626zm-35.75 47.03c-12.108 16.978-23.57 34.335-34.124 52.282L98.53 454.47a688.442 688.442 0 0 0 17.22-18.72l-32.688-72.125zm-43.437 68.688a546.43 546.43 0 0 0-14.75 29l37.375 28.313a611.184 611.184 0 0 0 23.125-21.72l-45.75-35.592z',
  3: 'm233.561 26.007-24.539 11.154-67.328 67.329-11.154 24.539 24.537-11.153 67.332-67.332zm26.115 26.111-24.539 11.155-67.33 67.33-11.154 24.539 24.541-11.154 67.328-67.328zm26.114 26.116L261.247 89.39l-67.324 67.324-11.157 24.543 24.54-11.154 67.327-67.326zm26.113 26.113-24.543 11.156-67.324 67.324-11.156 24.543 24.54-11.154 67.329-67.328zm-3.637 42.479-56.908 56.908 56.908 56.908 56.908-56.908zm99.387 53.271-24.543 11.156-67.326 67.326-11.154 24.541 24.543-11.156 67.324-67.324zm26.113 26.113-24.543 11.157-67.326 67.328-11.154 24.539 24.543-11.157 67.324-67.324zm-183.531 1.858-50.62 50.619c8.136 1.446 15.919 5.283 22.167 11.531v.002c6.248 6.248 10.085 14.03 11.531 22.164l50.62-50.619zm209.647 24.256-24.542 11.154-67.328 67.328-11.154 24.541 24.54-11.154 67.33-67.33zm26.11 26.115-24.536 11.152-67.332 67.332-11.153 24.537 24.54-11.154 67.328-67.328zM192.207 295.91c-6.08 0-12.158 2.343-16.848 7.034-9.38 9.38-9.38 24.317 0 33.697 9.38 9.38 24.315 9.38 33.695 0 9.38-9.38 9.38-24.315 0-33.695-4.69-4.69-10.768-7.035-16.847-7.036zm-46.424 46.424c-6.08 0-12.158 2.345-16.848 7.035-9.38 9.38-9.38 24.315 0 33.696 9.38 9.38 24.315 9.38 33.696 0 9.38-9.38 9.382-24.315.002-33.696-4.69-4.69-10.77-7.035-16.85-7.035zm-41.108 31.293-68.59 68.59c-14.58 14.58-11.324 28.174-2.9 36.598s22.017 11.68 36.598-2.9l68.59-68.59c-8.135-1.446-15.918-5.283-22.166-11.532-6.249-6.248-10.086-14.03-11.532-22.166z',
  5: 'm132.813 27.625 29.593 134.125c4.547 3.588 9.68 4.188 18.063 1.97l5.186-1.376 3.813 3.812 84.218 84.188 3.78 3.78-1.343 5.19c-2.42 9.36-1.483 15.047 3.375 19.905l13.53 13.53 97.533-97.563-13.532-13.53c-3.538-3.54-9.39-4.415-19.655-1.438l-5.313 1.53-3.906-3.906-86.187-86.188-1.626-3.28-1.094-3.314V64.376c-.013-.02-.018-.044-.03-.063L132.81 27.626zM310.592 85.5l-14.156 14.188 43.782 43.78 14.186-14.155-43.81-43.813zm120.25 95.844-159.968 159.97 37.063 37.123 160-160-37.094-37.093zM196.5 199.594l-175 175v87.594l218.813-218.782-43.813-43.812z',
};

const HammerIcon = ({ n, size }: { n: number; size: number }) => {
  const d = HAMMER_PATHS[n];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 512 512">
      <path d={d} fill="#2a2a2a" transform="rotate(-30 256 256)" />
    </svg>
  );
};

// Hand-drawn glue pot — matches the mushroom illustration style:
// rounded body, simple white highlights, no fine detail. (T25)
const GlueIcon = () => (
  <svg width={26} height={26} viewBox="0 0 32 32" aria-hidden>
    {/* Lid */}
    <rect x="11" y="3" width="10" height="4" rx="1.5" fill="#3a3a3a" />
    {/* Neck */}
    <rect x="12.5" y="6" width="7" height="3" fill="#5a5a5a" />
    {/* Bottle body */}
    <path
      d="M9 11 Q9 9 12 9 H20 Q23 9 23 11 V25 Q23 28 20 28 H12 Q9 28 9 25 Z"
      fill="#e8b86a"
      stroke="#7a4f1a"
      strokeWidth="1.2"
    />
    {/* Label band */}
    <rect x="11" y="15" width="10" height="6" fill="#fff4d6" />
    {/* Highlight */}
    <path
      d="M11 12 Q10.5 14 11 22"
      stroke="#fff"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.55"
    />
    {/* Drip */}
    <path
      d="M16 7 Q16 8 16.5 9 Q16 8.2 15.5 9 Q16 8 16 7"
      fill="#fff4d6"
    />
  </svg>
);

const ToolPanel = ({ activeTool, allowedOps, lockedOps, onSelect }: Props) => {
  const isActive = (tool: NonNullable<Tool>) => {
    if (!activeTool) return false;
    if (activeTool.kind !== tool.kind) return false;
    if (tool.kind === 'hammer' && activeTool.kind === 'hammer') return activeTool.n === tool.n;
    return true;
  };

  const hammerAllowed = (n: number) => allowedOps.includes(`split:${n}` as AllowedOp);
  const hammerLocked = (n: number) =>
    lockedOps?.includes(`split:${n}` as AllowedOp) ?? false;
  const glueAllowed = allowedOps.includes('glue');

  if (allowedOps.length === 0) return null;

  const hammers = HAMMER_DIVISIONS.filter(hammerAllowed);

  return (
    <>
      {hammers.length > 0 && (
        <div className="tool-panel" aria-label="Hammers">
          {hammers.map((n) => {
            const tool: Tool = { kind: 'hammer', n };
            const active = isActive(tool);
            const locked = hammerLocked(n);
            const classes = [
              'tool-btn',
              active && 'tool-btn--active',
              locked && 'tool-btn--locked',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={n}
                type="button"
                className={classes}
                onClick={() => {
                  if (locked) return;
                  onSelect(active ? null : tool);
                }}
                aria-label={`Hammer: divide by ${n}`}
                aria-disabled={locked || undefined}
              >
                <span className="tool-btn__icon" aria-hidden>
                  <HammerIcon n={n} size={HAMMER_ICON_SIZE[n]} />
                </span>
                <span className="tool-btn__label">{n}</span>
              </button>
            );
          })}
        </div>
      )}
      {glueAllowed && (
        <div className="tool-panel" aria-label="Glue">
          <button
            type="button"
            className={`tool-btn${isActive({ kind: 'glue' }) ? ' tool-btn--active' : ''}`}
            onClick={() => onSelect(isActive({ kind: 'glue' }) ? null : { kind: 'glue' })}
            aria-label="Glue: merge pieces"
          >
            <span className="tool-btn__icon" aria-hidden>
              <GlueIcon />
            </span>
            <span className="tool-btn__label">Glue</span>
          </button>
        </div>
      )}
    </>
  );
};

export default ToolPanel;
