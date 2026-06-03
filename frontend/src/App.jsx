import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setTasks(data);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Manager</h1>

      <p>Total Tasks: {tasks.length}</p>

      <table
        border="1"
        cellPadding="5"
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Task</th>
            <th>Staff</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.task_date}</td>
              <td>{task.task_name}</td>
              <td>{task.staff}</td>
              <td>{task.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;