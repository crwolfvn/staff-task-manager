import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import TaskModal from "./TaskModal";
import TaskCard from "./TaskCard";
import * as XLSX from "xlsx";

const STAFF_LIST = [ "", "Điều", "Hương", "Thư", "Dùm", "Thắng", "Thành", "Phố", "Quân", "Worker01", "Worker02",];
const STATUS_LIST = [  "Open",  "OnGoing",  "Done",  "Cancel",];
const cellStyle = {border: "1px solid #ddd",padding: "8px",color: "#222",};
const toolbarButtonStyle = {fontSize: "18px", fontWeight: "bold", padding: "12px 24px", color: "#0066cc", cursor: "pointer",borderRadius: "8px", border: "1px solid #0066cc", backgroundColor: "white", minWidth: "120px",};
const searchStyle = {padding: "10px",fontSize: "20px",color: "#654321", };

function getVNDateTime() { return new Date() .toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh", }) .replace(" ", "T");}
function formatDate(dateStr) { if (!dateStr) return ""; const d = new Date(dateStr); return d.toLocaleDateString("en-GB");}
function formatDateTime(dateStr) { if (!dateStr) return ""; const d = new Date(dateStr); return d.toLocaleString( "en-GB", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", } );}
function removeVietnameseTones(str) {  if (!str) return "";  return str    .normalize("NFD")    .replace(/[\u0300-\u036f]/g, "")    .replace(/đ/g, "d")    .replace(/Đ/g, "D");}


function App() {
  const [showAssignSelect, setShowAssignSelect] = useState(false);
  const [assignStaff, setAssignStaff] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] =    useState(null);
  const [showModal, setShowModal] =    useState(false);
  const [editTask, setEditTask] =    useState({});
  const [searchDate, setSearchDate] =    useState("");
  const [searchTask, setSearchTask] =    useState("");
  const [searchStaff, setSearchStaff] =    useState("");
  const [searchStatus, setSearchStatus] =    useState("");
  const [sortField, setSortField] =    useState("id");
  const [sortAsc, setSortAsc] =    useState(false);
  const isMobile = window.innerWidth < 768;
  useEffect(() => {  loadTasks();  }, []);

async function loadTasks() { 
  const { data, error } = await supabase  .from("tasks") .select("*");
  if (error) { console.error(error); return; }setTasks(data || []); }
function handleSort(field) {if (sortField === field) { setSortAsc(!sortAsc); } else { setSortField(field); setSortAsc(true);} }

async function saveTask() {
  const taskNameInput =  document.getElementById("task_name");if (taskNameInput) {  editTask.task_name =    taskNameInput.value;}
  let data = {  ...editTask, };
  if (data.status === "Done" && !data.completed_at) {data.completed_at = getVNDateTime();}
  if (data.status !== "Done" ) { data.completed_at = null; }
  if (data.assigned_at === "") { data.assigned_at = null;}
  if (data.completed_at === "") { data.completed_at = null;}
  if (data.status !== "Done") {data.completed_at = null;}
  if (data.id) { const { error } = await supabase  .from("tasks") .update(data).eq("id", data.id);
  if (error) { alert(error.message); return; } }  else { delete data.id; const { error } = await supabase .from("tasks") .insert([data]);
  if (error) { alert(error.message); return; }  }
    setShowModal(false);
    loadTasks(); }

async function MessageBuild(task) { let taskToSend = { ...task };
  // Open -> OnGoing 
  if (task.status === "Open") { const { error } = await supabase .from("tasks") .update({ status: "OnGoing" }) .eq("id", task.id); 
  if (error) { alert(error.message); return; } taskToSend.status = "OnGoing"; 
  if ( selectedTask && selectedTask.id === task.id ) { setSelectedTask(taskToSend); } await loadTasks(); }
  // Tạo message và copy vào clipboard
  const taskCode = `${formatDate(task.task_date)}_${String( task.task_no || 0 ).padStart(2, "0")}`; 
  let message =`📌 GIAO VIỆC: ${taskCode}\n👤 Người nhận: ${task.staff}\n📝Công Việc: ${task.task_name}\n⏰Deadline: ${task.deadline}`; 
    if ( task.note && task.note.trim() !== "" ) { message +=`\n\n📎 Ghi chú:${task.note}`; } 
  try { await navigator.clipboard.writeText( message ); alert( "Đã copy nội dung giao việc" ); } 
  catch (err) { console.error(err); alert( "Không thể copy nội dung" ); }}

async function confirmAssign() { 
  if (!assignStaff) { alert("Chọn nhân viên"); return; } const updateData = { staff: assignStaff, }; 
  if (!selectedTask.assigned_at) { updateData.assigned_at = getVNDateTime();} const { error } = await supabase .from("tasks") .update(updateData) .eq("id", selectedTask.id); 
  if (error) { alert(error.message); return; } const updatedTask = { ...selectedTask, ...updateData, }; setSelectedTask(updatedTask);await loadTasks(); 
    setShowAssignSelect(false); setAssignStaff(""); 
  await MessageBuild(updatedTask);}

async function GiaoViec() { 
  if (!selectedTask) { alert("Vui lòng chọn công việc"); return; } 
  if (!selectedTask.staff) { setShowAssignSelect(true); return; } let taskToSend = { ...selectedTask }; 
  if (!selectedTask.assigned_at) { const assignedNow = getVNDateTime();  const { error } = await supabase .from("tasks") .update({ assigned_at: assignedNow, }) .eq("id", selectedTask.id); 
  if (error) { alert(error.message); return; } taskToSend = { ...selectedTask, assigned_at: assignedNow, }; setSelectedTask(taskToSend); await loadTasks(); } 
  await MessageBuild(taskToSend);}

  

async function hoanThanhTask() { 
  if (!selectedTask) { alert("Vui lòng chọn công việc"); return; } 
  const completedAt = getVNDateTime();
  const { error } = await supabase .from("tasks") .update({ status: "Done", completed_at: completedAt, }) .eq("id", selectedTask.id); 
  if (error) { alert(error.message); return; } await loadTasks(); setSelectedTask({ ...selectedTask, status: "Done", completed_at: completedAt, }); 
  alert("Đã hoàn thành công việc");}

const filteredTasks = tasks.filter((task) => {
  const dateMatch = searchDate === ""? true : task.task_date === searchDate;
  const taskMatch = removeVietnameseTones(task.task_name || "").toLowerCase() .includes(removeVietnameseTones(searchTask).toLowerCase() );
  const staffMatch = searchStaff === "" ? true : task.staff === searchStaff;
  const statusMatch = searchStatus === ""? true: task.status ===searchStatus;
  return ( dateMatch && taskMatch && staffMatch && statusMatch ); } )
    .sort((a, b) => {let valueA =a[sortField] || "";let valueB = b[sortField] || ""; 
      if (typeof valueA === "string" )  { valueA = valueA.toLowerCase(); }
      if (typeof valueB === "string" ) { valueB =valueB.toLowerCase(); }
      if (valueA < valueB) { return sortAsc? -1 : 1; }
      if (valueA > valueB) {return sortAsc? 1: -1; } return 0;});
function getStatusColor(status) {switch (status) {case "Done":return "green"; case "OnGoing":return "orange";case "Cancel":return "gray";default:return "red"; }}

function createNewTask() 
  {const today = new Date();
  const dateString = today.toISOString().slice(0, 10);
    // Lấy tất cả task cùng ngày
  const todayTasks = tasks.filter((t) => t.task_date === dateString);
    // STT tiếp theo 
  const nextTaskNo = todayTasks.length === 0 ? 1 : Math.max( ...todayTasks.map( (t) => Number(t.task_no || 0) ) ) + 1;
  setEditTask({
        task_date: dateString,
        task_no: nextTaskNo,
        task_name: "",
        deadline: "",
        staff: "",
        status: "Open",
        assigned_at: null,
        completed_at: null,
        note: "", });  setShowModal(true); }
function editSelectedTask(){if (!selectedTask) { alert("Please select a task" ); return; }setEditTask({ ...selectedTask,  });setShowModal(true); }
function clearFilters() {setSearchDate("");setSearchTask("");setSearchStaff("");setSearchStatus("");}
function exportExcel() {
  const exportData = filteredTasks.map((t) => ({
    task_date: t.task_date,
    task_no: t.task_no,
    task_name: t.task_name,
    deadline: t.deadline,
    staff: t.staff,
    status: t.status,
    assigned_at: t.assigned_at,
    completed_at: t.completed_at,
    note: t.note, }));
  const worksheet =XLSX.utils.json_to_sheet(exportData);
  const workbook =XLSX.utils.book_new();
  XLSX.utils.book_append_sheet( workbook, worksheet, "Tasks");
  XLSX.writeFile( workbook,`tasks_${new Date().toISOString().slice(0, 10)}.xlsx`  );}

// Kết thúc danh sách các logic và function phụ vụ tính toán
// Return : Bắt đầu từ đây sẽ là giao diên
return (
    <div style={{  padding: "20px",  fontFamily: "Arial", width: "95%", margin: "0 auto", }} >
      <h1 style={{ textAlign: "center", }} > Task Manager v0.8  </h1> 
      <div  style={{display: "flex", gap: "5px", justifyContent: "center", marginBottom: "5px", }} >
        <button style={toolbarButtonStyle}onClick={loadTasks}> Reload</button>
        <button style={toolbarButtonStyle}onClick={createNewTask}> New</button>
        <button style={toolbarButtonStyle}onClick={editSelectedTask}>Edit</button>
        <button style={toolbarButtonStyle}onClick={clearFilters}>Clear Filter</button>
        <button style={toolbarButtonStyle} onClick={GiaoViec}> Giao Việc</button>
        {showAssignSelect && ( <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "10px", }} > 
          <select value={assignStaff} onChange={(e) => setAssignStaff(e.target.value) } > <option value=""> ChooseStaff </option> {STAFF_LIST .filter((s) => s) .map((s) => ( <option key={s} value={s} > {s} </option> ))} </select> 
          <button style={toolbarButtonStyle} onClick={confirmAssign} > OK </button> </div>)}
      
      
      </div>
      <div style={{display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center", }}>
        <input  type="date" placeholder="Date" value={searchDate} onChange={(e) => setSearchDate( e.target.value )} style={{ ...searchStyle, padding: "8px", width: "150px", }} />
        <input  type="text" placeholder="Task" value={searchTask} onChange={(e) => setSearchTask( e.target.value ) } style={{  ...searchStyle, padding: "8px", width: "350px", }} />
        <select  value={searchStaff} onChange={(e) => setSearchStaff( e.target.value ) } style={{  ...searchStyle, padding: "8px", width: "150px", }} >
          <option value=""> All Staff </option>
          {STAFF_LIST.map((staff) => (<option key={staff} value={staff}> {staff} </option> ))} </select>
        <select value={searchStatus} onChange={(e) =>setSearchStatus( e.target.value ) } style={{ ...searchStyle, padding: "8px", width: "150px", }} >
          <option value=""> All Status </option>
          {STATUS_LIST.map((status) => (<option key={status} value={status}> {status} </option>))} </select>
      </div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap",justifyContent: "center", }}>
        <button style={toolbarButtonStyle} onClick={hoanThanhTask} >Hoàn Thành</button>
        <button style={toolbarButtonStyle}>****</button>
        <button style={toolbarButtonStyle}>****</button>
        <button style={toolbarButtonStyle}>****</button>
        <button style={toolbarButtonStyle} onClick={exportExcel} > Export Excel </button>
      </div>
      <p style={{ textAlign: "center", fontWeight: "bold", color: "#0066cc", }} > Selected Row: {" "} {selectedTask ? selectedTask.task_name : "None"} </p>
      <p style={{ textAlign: "center", fontSize: "20px", }} > Total Tasks: {" "} { filteredTasks.length } {" / "} {tasks.length} </p>
      <div style={{ maxWidth: "100%", maxHeight: "700px", overflow: "auto", border: "1px solid #ccc", backgroundColor: "white", }} >
        <table style={{ minWidth: "99%", borderCollapse: "collapse", color: "#222", }} >
          <thead style={{ position: "sticky", top: 0, backgroundColor: "#dcdcdc", zIndex: 10, }} >
            <tr> <th style={cellStyle}>Chọn</th>
              <th style={ cellStyle } onClick={() => handleSort( "task_no" ) } > STT </th>
              <th style={{ ...cellStyle,minWidth: "110px" }} onClick={() => handleSort( "task_date" ) } > Ngày Tạo Task </th>
              <th style={ cellStyle } onClick={() => handleSort( "task_name" ) } > Task </th>
              <th style={ cellStyle } onClick={() => handleSort( "deadline" ) } > Deadline </th>
              <th style={ cellStyle } onClick={() => handleSort( "staff" ) } > Staff </th>
              <th style={ cellStyle } onClick={() => handleSort( "status" ) } > Status </th>	
              <th style={ cellStyle } onClick={() => handleSort( "assigned_at" ) } > Ngày Giao Việc </th>
              <th style={ cellStyle } onClick={() => handleSort( "completed_at" ) } > Hoàn Thành </th>
              
              <th style={ cellStyle } onClick={() => handleSort( "note" ) } > Ghi chú </th> </tr> </thead>
              
          <tbody>{filteredTasks.map(
            (task,index) => (<tr key={task.id}onClick={() =>setSelectedTask(selectedTask?.id === task.id ? null : task )} 
            style={{ backgroundColor: selectedTask?.id === task.id ? "#d6ecff" : index % 2 === 0 ? "#ffffff" : "#f5f5f5", cursor: "pointer", }} > 
            <td style={ cellStyle } > <input type="radio" checked={ selectedTask?.id === task.id } readOnly /> </td> 
            <td style={ cellStyle } > {task.task_no} </td> 
            <td style={ cellStyle } > {formatDate(task.task_date)} </td> 
            <td style={{ ...cellStyle, minWidth: "500px", textAlign: "left", }} > { task.task_name } </td> 
            <td style={ cellStyle } > { task.deadline } </td> 
            <td style={ cellStyle } > { task.staff } </td> 
            <td style={{ ...cellStyle, fontWeight: "bold", color: getStatusColor( task.status ), }} > { task.status } </td> 
            <td style={ cellStyle } > { formatDateTime(task.assigned_at) } </td> 
            <td style={ cellStyle } > { formatDateTime(task.completed_at) } </td> 
            <td style={{ ...cellStyle, minWidth: "400px", textAlign: "left", }} > {task.note} </td> </tr> ) )}  </tbody> </table>
      </div>
      <TaskModal show={showModal} title={ editTask.id ? "Edit Task" : "New Task" } task={editTask} setTask={setEditTask} onSave={saveTask} onClose={() => setShowModal(false) } staffOptions={ STAFF_LIST } />
    </div>
  );
}

export default App;