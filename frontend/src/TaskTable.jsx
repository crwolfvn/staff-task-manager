import React from "react";
export default function TaskTable({
  filteredTasks,
  selectedTask,
  setSelectedTask,
  handleSort,
  cellStyle,
  formatDate,
  formatDateTime,
  getStatusColor,}) {



return (

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
            <td style={{ ...cellStyle, minWidth: "400px", textAlign: "left", }} > {task.note} </td> </tr> ) )}  </tbody> </table> );}