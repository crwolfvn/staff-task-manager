export default function TTLoginModal({
 show, loginUser, setLoginUser, loginPass, setLoginPass, onLogin, onClose,}) { 
 if (!show) return null; 

 return ( 

    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, }} > 
        <div style={{ background: "white", padding: "20px", borderRadius: "10px", width: "90%", maxWidth: "400px", }} > 
            <h2 style={{ fontWeight: "bold", fontSize: "40px", }}>Login </h2> 
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}> 
                <label style={{ fontWeight: "bold", fontSize: "20px", }} > Username </label> <input style={{ fontWeight: "bold", fontSize: "20px", }} type="text" id="login_user" defaultValue=""/>
                <label style={{ fontWeight: "bold", fontSize: "20px", }} > Password </label> <input style={{ fontWeight: "bold", fontSize: "20px", }} type="password" id="login_pass" defaultValue=""/> </div> 
                
            <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px", }} > 
                <button onClick={onClose}>Cancel</button> <button onClick={onLogin}>Login</button> </div> </div> </div> );}