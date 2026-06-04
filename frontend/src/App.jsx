import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import TaskModal from "./TaskModal";
import TaskCard from "./TaskCard";

const STAFF_LIST = [
  "",
  "Điều",
  "Hương",
  "Thư",
  "Dùm",
  "Thắng",
  "Thành",
  "Phố",
  "Quân",
  "Worker01",
  "Worker02",
];

const STATUS_LIST = [
  "Open",
  "OnGoing",
  "Done",
  "Cancel",
];

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

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const [editTask, setEditTask] =
    useState({});

  const [searchDate, setSearchDate] =
    useState("");

  const [searchTask, setSearchTask] =
    useState("");

  const [searchStaff, setSearchStaff] =
    useState("");

  const [searchStatus, setSearchStatus] =
    useState("");

  const [sortField, setSortField] =
    useState("id");

  const [sortAsc, setSortAsc] =
    useState(false);


  const isMobile = window.innerWidth < 768;


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

  async function saveTask() {
    let data = {
      ...editTask,
    };

    if (
      data.status === "Done" &&
      !data.completed_at
    ) {
      const now = new Date();

      data.completed_at =
        now.toLocaleDateString("en-GB") +
        " " +
        now.getHours() +
        ":" +
        String(
          now.getMinutes()
        ).padStart(2, "0");
    }

    if (
      data.status !== "Done"
    ) {
      data.completed_at = "";
    }

    if (data.id) {
      const { error } = await supabase
        .from("tasks")
        .update(data)
        .eq("id", data.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      delete data.id;

      const { error } = await supabase
        .from("tasks")
        .insert([data]);

      if (error) {
        alert(error.message);
        return;
      }
    }

    setShowModal(false);
    loadTasks();
  }

  async function GiaoViec() {
  if (!selectedTask) {
    alert("Vui lòng chọn công việc");
    return;
  }

  const taskCode =
    `${selectedTask.task_date}_${String(
      selectedTask.task_no || 0
    ).padStart(2, "0")}`;

  let message =
`📌 GIAO VIỆC: ${taskCode}
👤 Người nhận: ${selectedTask.staff}
📝 ${selectedTask.task_name}
⏰ Deadline: ${selectedTask.deadline}
`;

  if (
    selectedTask.note &&
    selectedTask.note.trim() !== ""
  ) {
    message +=

`\n\n📎 Ghi chú:
${selectedTask.note}`;
  }

  try {
    await navigator.clipboard.writeText(
      message
    );

    alert(
      "Đã copy nội dung giao việc"
    );
  } catch (err) {
    console.error(err);

    alert(
      "Không thể copy nội dung"
    );
  }
}

  const filteredTasks = tasks
    .filter((task) => {
      const dateMatch = (
        task.task_date || ""
      )
        .toLowerCase()
        .includes(
          searchDate.toLowerCase()
        );

      const taskMatch =
        removeVietnameseTones(
          task.task_name || ""
        )
          .toLowerCase()
          .includes(
            removeVietnameseTones(
              searchTask
            ).toLowerCase()
          );

      const staffMatch =
        searchStaff === ""
          ? true
          : task.staff ===
            searchStaff;

      const statusMatch =
        searchStatus === ""
          ? true
          : task.status ===
            searchStatus;

      return (
        dateMatch &&
        taskMatch &&
        staffMatch &&
        statusMatch
      );
    })
    .sort((a, b) => {
      let valueA =
        a[sortField] || "";

      let valueB =
        b[sortField] || "";

      if (
        typeof valueA ===
        "string"
      ) {
        valueA =
          valueA.toLowerCase();
      }

      if (
        typeof valueB ===
        "string"
      ) {
        valueB =
          valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return sortAsc
          ? -1
          : 1;
      }

      if (valueA > valueB) {
        return sortAsc
          ? 1
          : -1;
      }

      return 0;
    });

  const cellStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    color: "#222",
  };

  function getStatusColor(
    status
  ) {
    switch (status) {
      case "Done":
        return "green";

      case "OnGoing":
        return "orange";

      case "Cancel":
        return "gray";

      default:
        return "red";
    }
  }

  function createNewTask() {
      const today = new Date();
 const dateString =
    String(
      today.getDate()
    ).padStart(2, "0") +
    "/" +
    String(
      today.getMonth() + 1
    ).padStart(2, "0") +
    "/" +
    today.getFullYear();
    setEditTask({
       task_date: dateString,
      task_name: "",
      deadline: "",
      staff: "",
      status: "Open",
      completed_at: "",
      note: "",
    });

    setShowModal(true);
  }

  function editSelectedTask() {
    if (!selectedTask) {
      alert(
        "Please select a task"
      );
      return;
    }

    setEditTask({
      ...selectedTask,
    });

    setShowModal(true);
  }

  function clearFilters() {
  setSearchDate("");
  setSearchTask("");
  setSearchStaff("");
  setSearchStatus("");
}

const toolbarButtonStyle = {
  fontSize: "18px",
  fontWeight: "bold",

  padding: "12px 24px",

  color: "#0066cc",

  cursor: "pointer",

  borderRadius: "8px",

  border: "1px solid #0066cc",

  backgroundColor: "white",

  minWidth: "120px",
};
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        width: "95%",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          textAlign: "center",
        }}
      >
        Task Manager v0.7
      </h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "15px",
        }}
      >
        <button
  style={toolbarButtonStyle}
  onClick={loadTasks}
>
  Reload
</button>
<button
  style={toolbarButtonStyle}
  onClick={createNewTask}
>
  New
</button>

<button
  style={toolbarButtonStyle}
  onClick={editSelectedTask}
>
  Edit
</button>

<button
  style={toolbarButtonStyle}
  onClick={clearFilters}
>
  Clear Filter
</button>


<button
  style={toolbarButtonStyle}
  onClick={GiaoViec}
>
  Giao Việc
</button>


      </div>

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
            setSearchDate(
              e.target.value
            )
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
            setSearchTask(
              e.target.value
            )
          }
          style={{
            padding: "8px",
            width: "350px",
          }}
        />

        <select
          value={searchStaff}
          onChange={(e) =>
            setSearchStaff(
              e.target.value
            )
          }
          style={{
            padding: "8px",
            width: "150px",
          }}
        >
          <option value="">
            All Staff
          </option>

          {STAFF_LIST.map(
            (staff) => (
              <option
                key={staff}
                value={staff}
              >
                {staff}
              </option>
            )
          )}
        </select>

        <select
          value={searchStatus}
          onChange={(e) =>
            setSearchStatus(
              e.target.value
            )
          }
          style={{
            padding: "8px",
            width: "150px",
          }}
        >
          <option value="">
            All Status
          </option>

          {STATUS_LIST.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}
        </select>
      </div>

      <p
        style={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#0066cc",
        }}
      >
        Selected:
        {" "}
        {selectedTask
          ? selectedTask.task_name
          : "None"}
      </p>

      <p
        style={{
          textAlign: "center",
          fontSize: "20px",
        }}
      >
        Total Tasks:
        {" "}
        {
          filteredTasks.length
        }
        {" / "}
        {tasks.length}
      </p>

      <div
        style={{
          maxWidth: "100%",
          maxHeight: "700px",
          overflow: "auto",
          border:
            "1px solid #ccc",
          backgroundColor:
            "white",
        }}
      >
        <table
          style={{
            minWidth: "99%",
            borderCollapse:
              "collapse",
            color: "#222",
          }}
        >
          <thead
            style={{
              position:
                "sticky",
              top: 0,
              backgroundColor:
                "#dcdcdc",
              zIndex: 10,
            }}
          >
            <tr>
              <th
                style={
                  cellStyle
                }
              >
                Select
              </th>

              <th
                style={
                  cellStyle
                }
                onClick={() =>
                  handleSort(
                    "id"
                  )
                }
              >
                ID
              </th>

              <th
                style={
                  cellStyle
                }
                onClick={() =>
                  handleSort(
                    "task_date"
                  )
                }
              >
                Date
              </th>

              <th
                style={
                  cellStyle
                }
                onClick={() =>
                  handleSort(
                    "task_name"
                  )
                }
              >
                Task
              </th>

              <th
                style={
                  cellStyle
                }
                onClick={() =>
                  handleSort(
                    "deadline"
                  )
                }
              >
                Deadline
              </th>

              <th
                style={
                  cellStyle
                }
                onClick={() =>
                  handleSort(
                    "staff"
                  )
                }
              >
                Staff
              </th>

              <th
                style={
                  cellStyle
                }
                onClick={() =>
                  handleSort(
                    "status"
                  )
                }
              >
                Status
              </th>

              <th
                style={
                  cellStyle
                }
                onClick={() =>
                  handleSort(
                    "completed_at"
                  )
                }
              >
                Completed
              </th>

              <th
                style={
                  cellStyle
                }
                onClick={() =>
                  handleSort(
                    "note"
                  )
                }
              >
                Note
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map(
              (
                task,
                index
              ) => (
                <tr
                  key={task.id}
                  onClick={() =>
  setSelectedTask(
    selectedTask?.id === task.id
      ? null
      : task
  )
}
                  style={{
                    backgroundColor:
                      selectedTask?.id ===
                      task.id
                        ? "#d6ecff"
                        : index %
                            2 ===
                          0
                        ? "#ffffff"
                        : "#f5f5f5",

                    cursor:
                      "pointer",
                  }}
                >
                  <td
                    style={
                      cellStyle
                    }
                  >
                    <input
                      type="radio"
                      checked={
                        selectedTask?.id ===
                        task.id
                      }
                      readOnly
                    />
                  </td>

                  <td
                    style={
                      cellStyle
                    }
                  >
                    {task.task_no}
                  </td>

                  <td
                    style={
                      cellStyle
                    }
                  >
                    {
                      task.task_date
                    }
                  </td>

                  <td
                    style={{
                      ...cellStyle,
                      minWidth:
                        "500px",
                      textAlign:
                        "left",
                    }}
                  >
                    {
                      task.task_name
                    }
                  </td>

                  <td
                    style={
                      cellStyle
                    }
                  >
                    {
                      task.deadline
                    }
                  </td>

                  <td
                    style={
                      cellStyle
                    }
                  >
                    {
                      task.staff
                    }
                  </td>

                  <td
                    style={{
                      ...cellStyle,
                      fontWeight:
                        "bold",
                      color:
                        getStatusColor(
                          task.status
                        ),
                    }}
                  >
                    {
                      task.status
                    }
                  </td>

                  <td
                    style={
                      cellStyle
                    }
                  >
                    {
                      task.completed_at
                    }
                  </td>

                  <td
                    style={{
                      ...cellStyle,
                      minWidth:
                        "400px",
                      textAlign:
                        "left",
                    }}
                  >
                    {task.note}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <TaskModal
        show={showModal}
        title={
          editTask.id
            ? "Edit Task"
            : "New Task"
        }
        task={editTask}
        setTask={setEditTask}
        onSave={saveTask}
        onClose={() =>
          setShowModal(false)
        }
        staffOptions={
          STAFF_LIST
        }
      />
    </div>
  );
}

export default App;