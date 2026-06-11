export default function TTKPI({
  openCount,
  onGoingCount,
  doneCount,
  cancelCount,
  completionRate,
}) {

  const cardStyle = {
    minWidth: "100px",
    padding: "10px",
    
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "white",
    textAlign: "center",
    color: "red",
    fontWeight: "bold"
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "nowrap",
        overflowX: "auto",
        justifyContent: "center",
        marginBottom: "10px",
        scrollbarWidth: "none", 
        msOverflowStyle: "none", 
      }}   className="kpi-scroll"     >


<div
  className="kpi-scroll"
  style={{
    marginBottom: "10px",
  }}
>
    </div>        
      <div style={cardStyle}>
        <div>Open</div>
        <div>{openCount}</div>
      </div>

      <div style={cardStyle}>
        <div>OnGoing</div>
        <div>{onGoingCount}</div>
      </div>

      <div style={cardStyle}>
        <div>Done</div>
        <div>{doneCount}</div>
      </div>

      <div style={cardStyle}>
        <div>Cancel</div>
        <div>{cancelCount}</div>
      </div>

      <div style={cardStyle}>
        <div>Completion</div>
        <div>{completionRate}%</div>
      </div>
    </div>
  );
}