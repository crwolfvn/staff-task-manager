export default function TTChangePasswordModal({
  show,
  onClose,
  onSave,
}) {

  if (!show) return null;

  return (
    <div  style={{  position: "fixed", inset: 0,  background: "rgba(0,0,0,0.4)",  display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, }} >
      <div style={{ background: "white", width: "90%", maxWidth: "500px", padding: "20px", borderRadius: "10px", }} >
        <h2>Change Password</h2>

        <div style={{ display: "grid",  gridTemplateColumns: "150px 1fr", gap: "10px", }} >
          <label>Old Password</label>
          <input type="password" id="old_password" />
          <label>New Password</label>
          <input type="password" id="new_password" />
          <label>Confirm Password</label>
          <input type="password" id="confirm_password" /> </div> 

        <div style={{  marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px", }} >
          <button onClick={onClose}>  Cancel </button>
          <button onClick={onSave}> Save </button>  </div>  </div>  </div> );  } 