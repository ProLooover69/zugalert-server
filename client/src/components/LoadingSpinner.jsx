export default function LoadingSpinner() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',
      height:'100vh',flexDirection:'column',gap:'1rem'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid #f0f0f0',
        borderTop:'3px solid #e74c3c',borderRadius:'50%',
        animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{color:'#888'}}>ZugAlert lädt…</span>
    </div>
  );
}