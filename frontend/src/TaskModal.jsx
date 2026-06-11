export default function TaskModal({
  show,
  title,
  task,
  setTask,
  onSave,
  onClose,
  staffOptions,
}) {
  if (!show) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, }} >
      <div style={{ background: "white", width: "95%", maxWidth: "900px", padding: "20px", borderRadius: "10px", color: "#222", maxHeight: "150vh", overflowY: "auto", }}>
        <h2  style={{fontSize: "40px"}} >{title}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px", }} >
          <label style={{fontSize: "25px"}} >Date</label>
          <input type="date" value={task.task_date || ""} style={{fontSize: "25px"}} onChange={(e) => setTask({ ...task, task_date: e.target.value,})}/>
          
          <label style={{fontSize: "25px"}} >Task</label>
          <textarea rows="4" style={{fontSize: "25px"}} defaultValue={task.task_name || ""} id="task_name"/>

          <label style={{fontSize: "25px"}} >Deadline</label>
          <input value={task.deadline || ""}  style={{fontSize: "25px"}} onChange={(e) => setTask({ ...task, deadline: e.target.value, }) } />

          <label style={{fontSize: "25px"}} >Staff</label>
          <select value={task.staff || ""}  style={{fontSize: "25px"}} onChange={(e) => setTask({ ...task, staff: e.target.value, }) } >
            {staffOptions.map((s) => (<option key={s}>{s}</option>))}</select>

          <label style={{fontSize: "25px"}} >Status</label>
          <select value={task.status || "Open"}  style={{fontSize: "25px"}} onChange={(e) => { const newStatus = e.target.value; setTask({ ...task, status: newStatus, assigned_at: newStatus === "OnGoing" && !task.assigned_at ? new Date().toLocaleString("sv-SE") : task.assigned_at, }); }}>
            <option>Open</option>
            <option>OnGoing</option>
            <option>Done</option>
            <option>Cancel</option>    </select>
        
          <label style={{fontSize: "25px"}} >Ngày Giao</label>
          <input value={task.assigned_at || ""}  style={{fontSize: "25px"}} onChange={(e) => setTask({ ...task, assigned_at: e.target.value, }) } />
          
          <label style={{fontSize: "25px"}} >Note</label>
          <textarea rows="4"  style={{fontSize: "25px"}} value={task.note || ""} onChange={(e) => setTask({ ...task, note: e.target.value, }) } />
        
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end", }} >
          <button style={{fontSize: "25px"}} onClick={onClose}> Cancel  </button>
          <button style={{fontSize: "25px"}} onClick={onSave}> Save</button>   </div> </div> </div> ); } 