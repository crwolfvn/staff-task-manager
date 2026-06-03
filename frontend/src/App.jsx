import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function removeVietnameseTones(str) {
  if (!str) return "";

  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function App() {
  const [tasks, setTasks] = useState([]);

  const [searchDate, setSearchDate] = useState("");
  const [searchTask, setSearchTask] = useState("");
  const [searchStaff, setSearchStaff] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  
  const [sortField, setSortField] = useState("id");
  const [sortAsc, setSortAsc] = useState(false);
  

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    setTasks(data || []);
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  const staffList = [
    ...new Set(
      tasks
        .map((t) => t.staff)
        .filter(Boolean)
    ),
  ].sort();

  const statusList = [
    ...new Set(
      tasks
        .map((t) => t.status)
        .filter(Boolean)
    ),
  ].sort();

  const filteredTasks = tasks
    .filter((task) => {
      const dateMatch = (task.task_date || "")
        .toLowerCase()
        .includes(searchDate.toLowerCase());

      const taskMatch = removeVietnameseTones(
        task.task_name || ""
      )
        .toLowerCase()
        .includes(
          removeVietnameseTones(searchTask)
            .toLowerCase()
        );

      const staffMatch =
        searchStaff === ""
          ? true
          : task.staff === searchStaff;

      const statusMatch =
        searchStatus === ""
          ? true
          : task.status === searchStatus;

      return (
        dateMatch &&
        taskMatch &&
        staffMatch &&
        statusMatch
      );
    })
    .sort((a, b) => {
      let valueA = a[sortField] || "";
      let valueB = b[sortField] || "";

      if (typeof valueA === "string")
        valueA = valueA.toLowerCase();

      if (typeof valueB === "string")
        valueB = valueB.toLowerCase();

      if (valueA < valueB)
        return sortAsc ? -1 : 1;

      if (valueA > valueB)
        return sortAsc ? 1 : -1;

      return 0;
    });

  const cellStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    color: "#222",
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          textAlign: "center",
        }}
      >
        Task Manager
      </h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Date"
          value={searchDate}
          onChange={(e) =>
            setSearchDate(e.target.value)
          }
          style={{
            padding: "8px",
            width: "120px",
          }}
        />

        <input
          type="text"
          placeholder="Task"
          value={searchTask}
          onChange={(e) =>
            setSearchTask(e.target.value)
          }
          style={{
            padding: "8px",
            width: "350px",
          }}
        />

        <select
          value={searchStaff}
          onChange={(e) =>
            setSearchStaff(e.target.value)
          }
          style={{
            padding: "8px",
            width: "150px",
          }}
        >
          <option value="">
            All Staff
          </option>

          {staffList.map((staff) => (
            <option
              key={staff}
              value={staff}
            >
              {staff}
            </option>
          ))}
        </select>

        <select
          value={searchStatus}
          onChange={(e) =>
            setSearchStatus(e.target.value)
          }
          style={{
            padding: "8px",
            width: "150px",
          }}
        >
          <option value="">
            All Status
          </option>

          {statusList.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}
        </select>
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: "20px",
        }}
      >
        Total Tasks: {filteredTasks.length} / {tasks.length}
      </p>

      <div
        style={{
          maxHeight: "700px",
          overflowY: "auto",
          border: "1px solid #ccc",
          backgroundColor: "white",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#222",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "#dcdcdc",
              zIndex: 10,
            }}
          >
            <tr>
              <th
                style={cellStyle}
                onClick={() =>
                  handleSort("id")
                }
              >
                ID
              </th>

              <th
                style={cellStyle}
                onClick={() =>
                  handleSort("task_date")
                }
              >
                Date
              </th>

              <th
                style={cellStyle}
                onClick={() =>
                  handleSort("task_name")
                }
              >
                Task
              </th>

              <th
                style={cellStyle}
                onClick={() =>
                  handleSort("deadline")
                }
              >
                Deadline
              </th>

              <th
                style={cellStyle}
                onClick={() =>
                  handleSort("staff")
                }
              >
                Staff
              </th>

              <th
                style={cellStyle}
                onClick={() =>
                  handleSort("status")
                }
              >
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map(
              (task, index) => (
                <tr
                  key={task.id}
                  onDoubleClick={() =>
                    alert(
                      `ID: ${task.id}\n\n${task.task_name}`
                    )
                  }
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? "#ffffff"
                        : "#f5f5f5",
                    cursor: "pointer",
                  }}
                >
                  <td style={cellStyle}>
                    {task.id}
                  </td>

                  <td style={cellStyle}>
                    {task.task_date}
                  </td>

                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "left",
                    }}
                  >
                    {task.task_name}
                  </td>

                  <td style={cellStyle}>
                    {task.deadline}
                  </td>

                  <td style={cellStyle}>
                    {task.staff}
                  </td>

                  <td
                    style={{
                      ...cellStyle,
                      fontWeight: "bold",
                      color:
                        task.status ===
                        "Done"
                          ? "green"
                          : "red",
                    }}
                  >
                    {task.status}
                  </td>
                </tr>
              )
            )}
          </tbody>
          
        </table>
      </div>
    </div>
  );
}

export default App;