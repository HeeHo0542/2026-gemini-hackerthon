import { useState } from 'react';
import './styles/global.css';
import './styles/intro.css';
import './styles/stage.css';
import './styles/modal.css';
import './styles/components.css';

import type { Creature, Environment, EvolutionResult, TrialResult, HistoryEvent, ActionButton } from './types';
import { generateEnvironment } from './api/gemini';
import { getChaosLevel } from './game/environment';
import IntroScreen from './components/IntroScreen';
import MainStage from './components/MainStage';
import HistoryPanel from './components/HistoryPanel';
import ChoiceModal from './components/ChoiceModal';

// Mock creature for testing environment API
const MOCK_CREATURE: Creature = {
  name: '페로-솔라리스',
  species: 'Ferro-solaris rosaeum',
  description:
    '금속성 세포벽을 가진 광합성 생명체. 철 이온을 흡수하여 꽃잎 형태의 태양광 수집판을 형성한다. 어둠 속에서도 빛을 기억하는 존재.',
  traits: ['금속 세포벽', '자기장 감응', '전자기파 소통'],
  vulnerabilities: ['산성 환경 부식', '고온 구조 붕괴'],
  energyStrategy: '철 이온 기반 광합성',
  stats: { hp: 100, adaptability: 55, resilience: 65, structure: 80 },
  imageUrl: null,
  birthWords: '차가운 금속 사이로 처음 빛이 들어왔을 때, 나는 그것이 따뜻하다는 것을 알았습니다.',
  generation: 1,
};

const MOCK_NATURAL: EvolutionResult = {
  newName: '페로-솔라리스 점액종',
  evolutionSummary:
    '산성 안개에 노출된 페로-솔라리스는 금속 세포벽 위에 점액질 보호막을 분비하기 시작했다. 빛을 포기한 날, 그것은 처음으로 어둠 속에서 웃었다.',
  tradeoffs: ['산성 내성을 얻었으나 광합성 효율 60% 감소'],
  statChanges: { hp: 90, adaptability: 70, resilience: 75, structure: 65 },
  poeticLine: '빛을 포기한 자만이 어둠에서 살아남는다.',
  imageUrl: null,
};

const MOCK_TRIAL: TrialResult = {
  type: '시련',
  title: '산성비',
  narrative:
    '하늘이 노랗게 물들더니 pH 2.1의 강산성 비가 쏟아지기 시작했다. 점액 보호막이 첫 번째 파도를 막아냈지만, 지속적인 강하에 점액이 희석되기 시작했다.',
  survived: true,
  reason:
    '점액 보호막이 1차 방어를 수행했고, 부식된 금속 이온이 토양과 반응하여 2차 중화층을 만들었다.',
  finalScore: 72,
  epitaph: '상처가 갑옷이 되는 데는 시간이 필요하다.',
};

function App() {
  const [phase, setPhase] = useState('intro');
  const [showModal, setShowModal] = useState(false);
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  const creature = MOCK_CREATURE;
  const chaosLevel = getChaosLevel(creature.generation ?? 1);

  const handleStart = (_k1: string, _k2: string) => {
    setPhase('birth');
    setHistory([{ type: 'birth', title: '탄생', summary: `${creature.name} — 금속 × 장미` }]);
  };

  const handleNextFromBirth = async () => {
    setLoading(true);
    setLoadingMessage('환경이 변화하고 있습니다...');

    const env = await generateEnvironment(creature, chaosLevel);

    if (env) {
      setEnvironment(env);
      setHistory((prev) => [
        ...prev,
        { type: 'environment', title: env.eventName, summary: `불안정 지수 ${env.instabilityIndex}` },
      ]);
      console.log('[Environment]', env);
    } else {
      console.error('Environment generation failed');
    }

    setLoading(false);
    setPhase('environment');
    setShowModal(true);
  };

  const handleProceedFromEnvironment = () => {
    setShowModal(false);
    setPhase('comparison');
    setHistory((prev) => [
      ...prev,
      { type: 'evolution', title: '진화 분기', summary: '자동 진화 진행' },
    ]);
  };

  const handleChoosePath = () => {
    setPhase('trial');
    setHistory((prev) => [
      ...prev,
      { type: 'trial', title: MOCK_TRIAL.title, summary: `생존 — 점수 ${MOCK_TRIAL.finalScore}` },
    ]);
  };

  const handleRestart = () => {
    setPhase('intro');
    setShowModal(false);
    setEnvironment(null);
    setHistory([]);
  };

  // Intro screen
  if (phase === 'intro') {
    return <IntroScreen onStart={handleStart} />;
  }

  // Build action buttons based on phase
  const actionButtons: ActionButton[] = [];
  if (phase === 'birth') {
    actionButtons.push({ label: '다음 단계 →', onClick: handleNextFromBirth, primary: true });
  }
  if (phase === 'trial') {
    actionButtons.push({ label: '새로운 생명 창조', onClick: handleRestart, primary: true });
  }

  return (
    <div className="game-layout">
      {loading && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
              {loadingMessage}
            </p>
          </div>
        </div>
      )}

      <MainStage
        phase={phase}
        creature={creature}
        natural={MOCK_NATURAL}
        trial={MOCK_TRIAL}
        actionButtons={actionButtons}
        onChooseNatural={handleChoosePath}
        onChooseIntervened={handleChoosePath}
      />
      <HistoryPanel
        history={history}
        activeIndex={history.length - 1}
      />
      {showModal && environment && (
        <ChoiceModal
          environment={environment}
          onProceed={handleProceedFromEnvironment}
        />
      )}
    </div>
  );
}

export default App;
