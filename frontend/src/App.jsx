import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import TaskModal from "./TaskModal";
import TaskCard from "./TaskCard";
import * as XLSX from "xlsx";
import TaskTable from "./TaskTable";
import TTKPI from "./TTKPI";
import TTHeader from "./TTHeader";

const STAFF_LIST = [ "", "Điều", "Hương", "Thư", "Dùm", "Thắng", "Thành", "Phố", "Quân", "Worker01", "Worker02",];
const STATUS_LIST = [  "Open",  "OnGoing",  "Done",  "Cancel",];
const cellStyle = {border: "1px solid #ddd",padding: "8px",color: "#222",};
const toolbarButtonStyle = {fontSize: "18px", fontWeight: "bold", padding: "12px 24px", color: "#0066cc", cursor: "pointer",borderRadius: "8px", border: "1px solid #0066cc", backgroundColor: "white", minWidth: "120px",};
const searchStyle = {padding: "10px",fontSize: "20px",color: "#654321", };
const mobileButtonStyle = { ...toolbarButtonStyle, minWidth: "90px", fontSize: "16px", padding: "10px",};

function getVNDateTime() { return new Date() .toLocaleString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh", }) .replace(" ", "T");}
function formatDate(dateStr) { if (!dateStr) return ""; const d = new Date(dateStr); return d.toLocaleDateString("en-GB");}
function formatDateTime(dateStr) { if (!dateStr) return ""; const d = new Date(dateStr); return d.toLocaleString( "en-GB", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", } );}
function removeVietnameseTones(str) {  if (!str) return "";  return str    .normalize("NFD")    .replace(/[\u0300-\u036f]/g, "")    .replace(/đ/g, "d")    .replace(/Đ/g, "D");}


function App() {
  const [tasks, setTasks] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showAssignSelect, setShowAssignSelect] = useState(false);
  const [assignStaff, setAssignStaff] = useState("");
  const [selectedTask, setSelectedTask] =    useState(null);
  const [showModal, setShowModal] =    useState(false);
  const [editTask, setEditTask] =    useState({});
  const [searchDate, setSearchDate] =    useState("");
  const [searchTask, setSearchTask] =    useState("");
  const [searchStaff, setSearchStaff] =    useState("");
  const [searchStatus, setSearchStatus] =    useState("");
  const [sortField, setSortField] =    useState("id");
  const [sortAsc, setSortAsc] =    useState(false);
  const [currentUser, setCurrentUser] =useState(null);

  const isMobile = window.innerWidth < 768;
  const openCount =tasks.filter(t => t.status === "Open").length;
  const onGoingCount =tasks.filter(t => t.status === "OnGoing").length;
  const doneCount =tasks.filter(t => t.status === "Done").length;
  const cancelCount =tasks.filter(t => t.status === "Cancel").length;
  const completionRate =tasks.length === 0    ? 0: Math.round(doneCount * 100 / tasks.length);
  
  useEffect(() => {const savedUser =localStorage.getItem("currentUser"); if (savedUser) {setCurrentUser(savedUser);}loadTasks();}, []);

function login() { const username = prompt("Username"); const password = prompt("Password"); 
  if ( username === "admin" && password === "123456" ) { localStorage.setItem( "currentUser", username ); setCurrentUser(username); } 
  else { alert("Login failed"); }}

function logout() {localStorage.removeItem("currentUser");setCurrentUser(null);}

async function loadTasks() { 
  const { data, error } = await supabase  .from("tasks") .select("*");
  if (error) { console.error(error); return; }setTasks(data || []); }
function handleSort(field) {if (sortField === field) { setSortAsc(!sortAsc); } else { setSortField(field); setSortAsc(true);} }

async function saveTask() {
// Lấy Task Name từ textarea
  const taskNameInput =document.getElementById("task_name");
  let data = {...editTask,task_name: taskNameInput? taskNameInput.value: editTask.task_name,};
  if (data.assigned_at === "") {data.assigned_at = null;}
  if (data.completed_at === "") {data.completed_at = null;}
  if (data.status === "Done" &&!data.completed_at) {data.completed_at = getVNDateTime();} // Nếu Done mà chưa có completed_at
  if (data.status !== "Done") {data.completed_at = null;} // Nếu không phải Done thì xóa completed_at
  if (data.id) {const { error } = await supabase.from("tasks").update(data).eq("id", data.id);if (error) {alert(error.message);return;}} // EDIT TASK
  else {delete data.id; // NEW TASK
// Reload task cùng ngày để tránh trùng STT :
    const {data: latestTasks,error: loadError,} = await supabase.from("tasks").select("task_no").eq("task_date", data.task_date); if (loadError) {alert(loadError.message);return;} 
    const maxTaskNo =latestTasks.length === 0? 0: Math.max(...latestTasks.map((t) => Number(t.task_no || 0)));
    data.task_no = maxTaskNo + 1; const { error } = await supabase.from("tasks").insert([data]);if (error) {alert(error.message);return;}}
  setShowModal(false);
  await loadTasks();}

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
  
  setEditTask({
        task_date: dateString,
        task_no: "",
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
      <TTHeader currentUser={currentUser} onLogin={login} onLogout={logout} />
      <h1 style={{ textAlign: "center", }} > Task Manager v0.8  </h1> 
      <TTKPI  openCount={openCount}
          onGoingCount={onGoingCount}
          doneCount={doneCount}
          cancelCount={cancelCount}
          completionRate={completionRate}/>
      <div  style={{display: "flex", gap: "5px", justifyContent: "center", marginBottom: "5px", }} >
       
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle}onClick={loadTasks}> Reload</button>
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle}onClick={() => setShowFilter(!showFilter)}>{showFilter ? "Hide Filter" : "Filter"} </button>
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle}onClick={clearFilters}>Clear Filter</button>
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle}>****</button>
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle}>****</button>
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle} onClick={exportExcel} > Export Excel </button>
              
      
      </div>
      {showFilter && (
      <div style={{display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center", }}>
        <input  type="date" placeholder="Date" value={searchDate} onChange={(e) => setSearchDate( e.target.value )} style={{ ...searchStyle, padding: "8px", width: "150px", }} />
        <input  type="text" placeholder="Task" value={searchTask} onChange={(e) => setSearchTask( e.target.value ) } style={{  ...searchStyle, padding: "8px", width: "350px", }} />
        <select  value={searchStaff} onChange={(e) => setSearchStaff( e.target.value ) } style={{  ...searchStyle, padding: "8px", width: "150px", }} >
          <option value=""> All Staff </option> {STAFF_LIST.map((staff) => (<option key={staff} value={staff}> {staff} </option> ))} </select>
        <select value={searchStatus} onChange={(e) =>setSearchStatus( e.target.value ) } style={{ ...searchStyle, padding: "8px", width: "150px", }} >
          <option value=""> All Status </option>{STATUS_LIST.map((status) => (<option key={status} value={status}> {status} </option>))} </select>      </div> )} 

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap",justifyContent: "center", }}>
        {currentUser && ( <> 
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle}onClick={createNewTask}> New</button>
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle}onClick={editSelectedTask}>Edit</button>
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle} onClick={hoanThanhTask} >Hoàn Thành</button>
        <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle} onClick={GiaoViec}> Giao Việc</button>
          {showAssignSelect && ( 
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "10px", }} > 
          <select value={assignStaff} onChange={(e) => setAssignStaff(e.target.value) } > <option value=""> ChooseStaff </option> {STAFF_LIST .filter((s) => s) .map((s) => ( <option key={s} value={s} > {s} </option> ))} </select> 
          <button style={isMobile ? mobileButtonStyle : toolbarButtonStyle} onClick={confirmAssign} > OK </button>  </div>  )}   </>)}
 
      </div>
      <p style={{ textAlign: "center", fontWeight: "bold", color: "#0066cc", }} > Selected Row: {" "} {selectedTask ? selectedTask.task_date : "None"} {"_"}{selectedTask ? selectedTask.task_no : "None"} {"="} {selectedTask ? selectedTask.task_name : "None"} </p>
      <p style={{ textAlign: "center", fontSize: "20px", }} > Total Tasks: {" "} { filteredTasks.length } {" / "} {tasks.length} </p>
      

      {isMobile ? (

  <TaskCard
    filteredTasks={filteredTasks}
    selectedTask={selectedTask}
    setSelectedTask={setSelectedTask}/> ) : (
  <div
    style={{
      maxWidth: "100%",
      maxHeight: "700px",
      overflow: "auto",
      border: "1px solid #ccc",
      backgroundColor: "white",}}>

    <TaskTable
      filteredTasks={filteredTasks}
      selectedTask={selectedTask}
      setSelectedTask={setSelectedTask}
      handleSort={handleSort}
      cellStyle={cellStyle}
      formatDate={formatDate}
      formatDateTime={formatDateTime}
      getStatusColor={getStatusColor}
    />
  </div>

)} 

      <TaskModal show={showModal} title={ editTask.id ? "Edit Task" : "New Task" } task={editTask} setTask={setEditTask} onSave={saveTask} onClose={() => setShowModal(false) } staffOptions={ STAFF_LIST } />
    </div>
  );
}

export default App;