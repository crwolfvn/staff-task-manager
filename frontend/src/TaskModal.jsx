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
      <div style={{ background: "white", width: "95%", maxWidth: "1200px", padding: "20px", borderRadius: "10px", color: "#222", maxHeight: "150vh", overflowY: "auto", }}>
        <h2>{title}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px", }} >
          <label>Date</label>
          <input value={task.task_date || ""} onChange={(e) => setTask({ ...task, task_date: e.target.value,})}/>
          
          <label>Task</label>
          <textarea rows="3" value={task.task_name || ""} onChange={(e) => setTask({ ...task, task_name: e.target.value, }) } />

          <label>Deadline</label>
          <input value={task.deadline || ""} onChange={(e) => setTask({ ...task, deadline: e.target.value, }) } />

          <label>Staff</label>
          <select value={task.staff || ""} onChange={(e) => setTask({ ...task, staff: e.target.value, }) } >
            {staffOptions.map((s) => (<option key={s}>{s}</option>))}</select>

          <label>Status</label>
          <select value={task.status || "Open"} onChange={(e) => { const newStatus = e.target.value; setTask({ ...task, status: newStatus, assigned_at: newStatus === "OnGoing" && !task.assigned_at ? new Date().toLocaleString("sv-SE") : task.assigned_at, }); }}>
            <option>Open</option>
            <option>OnGoing</option>
            <option>Done</option>
            <option>Cancel</option>    </select>
        
          <label>Ngày Giao Việc</label>
          <input value={task.assigned_at || ""} onChange={(e) => setTask({ ...task, assigned_at: e.target.value, }) } />
          
          <label>Note</label>
          <textarea rows="4" value={task.note || ""} onChange={(e) => setTask({ ...task, note: e.target.value, }) } />
        
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end", }} >
          <button onClick={onClose}> Cancel  </button>
          <button onClick={onSave}>  Save </button>   </div> </div> </div> ); } 