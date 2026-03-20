export default function ProgressBar({ value = 0 }) {
  return (
    <div style={{
      width: 300,
      height: 14,
      backgroundColor: '#1e1e1e',
      borderRadius: 7,
      overflow: 'hidden',
      marginTop: 5,
      marginBottom: 10,
    }}>
      <div style={{
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        height: '100%',
        backgroundColor: '#00e676',
        borderRadius: 7,
        transition: 'width 0.4s ease',
        boxShadow: '0 0 8px #00e676',
      }} />
    </div>
  );
}
