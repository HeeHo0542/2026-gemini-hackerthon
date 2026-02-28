import type { Environment, PlayerAxisLevel } from '../types';

interface ChoiceModalProps {
  environment: Environment;
  onProceed: () => void;
}

const axisConfig = {
  energy: { icon: '\u26A1', label: '에너지' },
  physical: { icon: '\uD83D\uDC80', label: '물리' },
  purity: { icon: '\uD83E\uDEE7', label: '순도' },
} as const;

function axisColor(level: PlayerAxisLevel): string {
  switch (level) {
    case 'LOW': return 'modal__param-value--low';
    case 'NORMAL': return 'modal__param-value--normal';
    case 'HIGH': return 'modal__param-value--high';
    case 'CRITICAL': return 'modal__param-value--critical';
  }
}

export default function ChoiceModal({ environment, onProceed }: ChoiceModalProps) {
  const {
    eventName,
    instabilityIndex,
    narrative,
    playerAxes,
    sensory,
    threatDetail,
  } = environment;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal__event-name">{eventName}</h2>
        <div className="modal__instability">불안정 지수 {instabilityIndex}</div>

        <p className="modal__narrative">{narrative}</p>

        <div className="modal__params">
          {(Object.keys(axisConfig) as Array<keyof typeof axisConfig>).map((axis) => (
            <div className="modal__param" key={axis}>
              <span className="modal__param-label">
                {axisConfig[axis].icon} {axisConfig[axis].label}
              </span>
              <span className={`modal__param-value ${axisColor(playerAxes[axis])}`}>
                {playerAxes[axis]}
              </span>
            </div>
          ))}
        </div>

        <div className="modal__sensory">
          <div className="modal__sensory-item">
            <span className="modal__sensory-icon">{'\uD83D\uDC41'}</span>
            <span>{sensory.visual}</span>
          </div>
          <div className="modal__sensory-item">
            <span className="modal__sensory-icon">{'\uD83D\uDC42'}</span>
            <span>{sensory.auditory}</span>
          </div>
          <div className="modal__sensory-item">
            <span className="modal__sensory-icon">{'\u270B'}</span>
            <span>{sensory.tactile}</span>
          </div>
        </div>

        <div className="modal__threat">
          <span>{'\u26A0'}</span>
          <span>{threatDetail}</span>
        </div>

        <div className="modal__divider" />

        <button className="modal__observe-btn" onClick={onProceed}>
          {'\uD83D\uDC41'} 진화를 지켜본다
        </button>
      </div>
    </div>
  );
}
