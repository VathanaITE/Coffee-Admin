// StatCard.jsx
const StatCard = ({ title, value, icon, bgColor, borderColor }) => {
  return (
    <div style={{
      backgroundColor: bgColor || '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
      borderLeft: `6px solid ${borderColor || '#3b82f6'}`,
      minHeight: '180px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{title}</p>
        <p style={{ margin: '16px 0 0', fontSize: '3rem', fontWeight: 800, color: '#0f172a' }}>{value}</p>
      </div>
      <div style={{ display: 'grid', placeItems: 'center', width: '56px', height: '56px', borderRadius: '16px', backgroundColor: `${borderColor || '#3b82f6'}20`, marginTop: '16px' }}>
        <div style={{ color: borderColor || '#3b82f6' }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;