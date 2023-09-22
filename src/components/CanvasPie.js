import React, { useEffect, useState } from "react";
import DraggablePiechart from "../libraries/draggable-piechart";

const CanvasPie = ()=> {
  const defaultData = [
    {
      proportion: 24,
      format: {
        color: "#" + ((Math.random() * 0xffffff) << 0).toString(16),
        label: "Nothing",
      },
      collapsed: false, // collapse the proportion when dragged to zero
    },
  ];

  const [data, setData] = useState(defaultData);
  const [activity, setActivity] = useState("");
  const [hours, setHours] = useState("");
  const [activityHours, setActivityHours] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
      setupPieChart();
  }, [data]);

  function setupPieChart() {
    var setup = {
      canvas: document.getElementById("piechart"),
      radius: 0.9,
      collapsing: true,
      proportions: data,
      drawSegment: drawSegmentOutlineOnly,
      onchange: onPieChartChange,
    };

    new DraggablePiechart(setup);

    function drawSegmentOutlineOnly(
      context,
      piechart,
      centerX,
      centerY,
      radius,
      startingAngle,
      arcSize,
      format,
      collapsed
    ) {
      if (collapsed) {
        return;
      }
      // Draw segment
      context.save();
      var endingAngle = startingAngle + arcSize;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
      context.closePath();

      //context.fillStyle = "#f5f5f5";
      context.fillStyle = format.color;
      context.fill();
      context.stroke();
      context.restore();

      // Draw label on top
      context.save();
      context.translate(centerX, centerY);
      context.rotate(startingAngle);

      var fontSize = Math.floor(context.canvas.height / 25);
      var dx = radius - fontSize;
      var dy = centerY / 10;

      context.textAlign = "right";
      context.font = fontSize + "pt Helvetica";
      context.fillText(format.label, dx, dy);
      context.restore();
    }

    function onPieChartChange(piechart) {
      var table = document.getElementById("proportions-table");
      // var percentages = piechart.getAllSliceSizePercentages();
      var hours = piechart.getAllSliceSizeHours();
      var activityHours = {};
      var labelsRow = "<tr>";
      var propsRow = "<tr>";
      for (var i = 0; i < data.length; i += 1) {
        labelsRow += "<th>" + data[i].format.label + "</th>";
        activityHours[data[i].format.label] = hours[i];
        // var v = "<var>" + hours[i].toFixed(0) + "%</var>";
        var v = "<var>" + hours[i] + " hrs&nbsp</var>";
        var plus =
          '<div id="plu-' +
          data[i].format.label +
          '" class="adjust-button" data-i="' +
          i +
          '" data-d="-1">&#43;</div>';
        var minus =
          '<div id="min-' +
          data[i].format.label +
          '" class="adjust-button" data-i="' +
          i +
          '" data-d="1">&#8722;</div>';
        propsRow += "<td>" + v + plus + minus + "</td>";
      }
      setActivityHours(activityHours)
      labelsRow += "</tr>";
      propsRow += "</tr>";

      table.innerHTML = labelsRow + propsRow;

      var adjust = document.getElementsByClassName("adjust-button");

      function adjustClick(e) {
        var i = this.getAttribute("data-i");
        var d = this.getAttribute("data-d");
        piechart.moveAngle(i, d * (Math.PI/12));
      }

      for (i = 0; i < adjust.length; i++) {
        adjust[i].addEventListener("click", adjustClick);
      }
    }
  }

  const removeActivity = (activity, hours) => {
    let tempdata = data.filter((d)=>{
      return d.format.label != activity
    })
    if(tempdata[0] &&tempdata[0].format.label == "Nothing"){
      tempdata[0].proportion = tempdata[0].proportion + hours;
    }else{
      tempdata[0] =
        {
          proportion: hours,
          format: {
            color: "#" + ((Math.random() * 0xffffff) << 0).toString(16),
            label: "Nothing",
          },
          collapsed: false, // collapse the proportion when dragged to zero
        }
    }
    setData(tempdata);
  }

  const addActivity = () => {
    let tempdata = data;

    if (activity.trim() === "") {
      setError("Activity name is required.");
      return; // Exit the function if activity is empty
    }

    if (hours <= 0) {
      setError("Hours field cannot be empty.");
      return; // Exit the function if hours are not positive
    }

    if (hours > tempdata[0].proportion || tempdata[0].format.label != "Nothing") {
      setError("Hours cannot exceed more than 24 in a day.");
      return;
    }

    setError("");


    for(let i=0;i<tempdata.length;i++){
      if (tempdata[i].format.label == activity){
        setError("Activity already exists.");
        return;
      }
        tempdata[i].proportion = Number(
          activityHours[tempdata[i].format.label]
        );
    }

    if (tempdata[0].proportion - hours > 0) {
      tempdata[0].proportion = tempdata[0].proportion - hours;
    }
    else{
      tempdata.shift() //if time is 24 the first time
    }

    setData([
      ...tempdata,
      {
        proportion: hours,
        format: {
          color: "#" + ((Math.random() * 0xffffff) << 0).toString(16),
          label: activity,
        },
        collapsed: false, // collapse the proportion when dragged to zero
      },
    ]);
    setActivity("");
    setHours("");
  }

  return (
    <>
      <div className="flex p-2 ml-56">
        <input
          type="text"
          className="border border-black m-2 p-2 placeholder:p-2 rounded-md"
          placeholder="Activity"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        ></input>
        <input
          type="number"
          value={hours}
          className="border border-black p-2 m-2 placeholder:p-2 rounded-md"
          placeholder="Hours"
          onChange={(e) => setHours(Number(e.target.value))}
        ></input>
        <button
          className="bg-blue-500 m-2 rounded-lg p-2"
          onClick={() => addActivity()}
        >
          Add Activity
        </button>
      </div>
      {error && <div className="text-red-500 ml-60">{error}</div>}
      <div className="flex">
        <div>
          <canvas id="piechart" width="500" height="500" className="ml-56" />
          <table id="proportions-table" className="ml-56"></table>
        </div>
        {data.length>1?<div className="bg-slate-200 p-2 rounded-sm">
          <div className="bg-gray-400 p-2 rounded-sm">Remove activity</div>
          {data.map((d) => {
            if (d.format.label != "Nothing")
              return (
                <div className="p-1">
                  <span className="font-bold text-xl">{d.format.label}</span>
                  <span
                    className="text-red-900"
                    onClick={() => removeActivity(d.format.label, d.proportion)}
                  > (-) </span>
                </div>
              );
          })}
        </div>:null}
      </div>
    </>
  );
}

export default CanvasPie;

