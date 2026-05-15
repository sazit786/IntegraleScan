const ENERGY_STYLES = `
  @keyframes energyGlow {
    0%   { box-shadow: 0 0 6px #00e676, 0 0 12px #00e676; }
    50%  { box-shadow: 0 0 14px #00e676, 0 0 28px #00e676, 0 0 42px #00b248; }
    100% { box-shadow: 0 0 6px #00e676, 0 0 12px #00e676; }
  }
  @keyframes energyShimmer {
    0%   { background-position: -300px 0; }
    100% { background-position: 300px 0; }
  }
  .energy-bar {
    background: linear-gradient(
      90deg,
      #00e676 0%,
      #00e676 40%,
      #69f0ae 50%,
      #00e676 60%,
      #00e676 100%
    );
    background-size: 600px 100%;
    animation:
      energyGlow     1.8s ease-in-out infinite,
      energyShimmer  2.2s linear     infinite;
  }
`;

export default function ProgressBar({ value = 0, preset = 'default' }) {
  const isEnergy = preset === 'energy';

  return (
    <>
      {isEnergy && <style>{ENERGY_STYLES}</style>}
      <div style={{
        width: '100%',
        height: 14,
        backgroundColor: '#1e1e1e',
        borderRadius: 7,
        overflow: 'hidden',
        marginTop: 5,
        marginBottom: 10,
      }}>
        <div
          className={isEnergy ? 'energy-bar' : ''}
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
            height: '100%',
            backgroundColor: isEnergy ? undefined : '#00e676',
            borderRadius: 7,
            transition: 'width 0.4s ease',
            boxShadow: isEnergy ? undefined : '0 0 8px #00e676',
          }}
        />
      </div>
    </>
  );
}
