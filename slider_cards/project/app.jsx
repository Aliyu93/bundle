// Main app — wraps everything inside the iOS frame
function App() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1612',
      padding: 16
    }}>
    <IOSDevice width={390} height={820}>
      <div
        dir="rtl"
        style={{
          width: '100%',
          height: '100%',
          background: '#fbf7f0',
          fontFamily: '"Tajawal", "Inter", system-ui, sans-serif',
          color: '#2a2520',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          paddingTop: 54,
          paddingBottom: 28
        }}
      >
        {/* Just the rail — with its own section header + see-all link */}
        <ProductSlider title="جلابيات" />
      </div>
    </IOSDevice>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
