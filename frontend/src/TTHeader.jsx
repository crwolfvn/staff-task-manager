export default function TTHeader({
  currentUser,
  onLogin,
  onLogout,}) {

  return (
    <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",}}>
        <div> {currentUser? `👤 Welcome, ${currentUser}`: "👤 Guest"}</div>
        <div style={{ display: "flex", gap: "10px" }}>  {!currentUser ? (<button onClick={onLogin}> Login</button>
        ) : (
        <> <button> Change Password </button>
        <button onClick={onLogout}> Logout </button> </> )} </div> </div> ); }