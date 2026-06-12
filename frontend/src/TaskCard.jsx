// TaskCard.jsx
function getStatusColor(status) { switch (status) { case "Done": return "green"; case "OnGoing": return "orange"; case "Cancel": return "gray"; default: return "red"; }}
export default function TaskCard({
  filteredTasks,
  selectedTask,
  setSelectedTask,}) {


  return (
    <div style={{display: "flex",flexDirection: "column",gap: "12px",marginTop: "15px",}}>
      {filteredTasks.map((task) => 
      (<div key={task.id} onClick={() => setSelectedTask( selectedTask?.id === task.id ? null: task)}
      style={{backgroundColor: "white",color: "#222",border:selectedTask?.id === task.id? "3px solid #0066cc": "1px solid #ddd",
            borderRadius: "10px",
            padding: "12px",
            cursor: "pointer",
            textAlign: "left",}}>
      <div style={{
              fontWeight: "bold",
              fontSize: "18px",
              marginBottom: "8px",}}>{task.task_name}</div>
      <div> 📅 {new Date(task.task_date).toLocaleDateString("en-GB")} </div>
      <div style={{ fontSize: "13px", color: "#666", marginBottom: "5px", }}> #{task.task_no}</div>
      <div> 👤 {task.staff} </div>
      <div> ⏰ {task.deadline}</div>
      <div style={{color: getStatusColor(task.status),fontWeight: "bold",marginTop: "6px",}}>● {task.status}</div>
      {task.note && (
      <div style={{marginTop: "8px",fontSize: "14px",}}>📝 {task.note}</div>)}</div>))}</div>);}