import React, { useEffect, useRef, useState } from "react";
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
  const [hours, setHours] = useState(0);
  const [activityHours, setActivityHours] = useState({});
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

  const addActivity = () => {
    let tempdata = data;
    for(let i=0;i<tempdata.length;i++){
      tempdata[i].proportion = Number(activityHours[tempdata[i].format.label]);
    }

    if (tempdata[0].proportion - hours > 0) {
      tempdata[0].proportion = tempdata[0].proportion - hours;
    }else{
      tempdata.shift()
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
  }

  return (
    <>
      <div className="flex p-2">
        <input
        required={true}
          type="text"
          className="border border-black m-2 placeholder:p-2"
          placeholder="Activity"
          onChange={(e) => setActivity(e.target.value)}
        ></input>
        <input
        required
          type="number"
          className="border border-black m-2 placeholder:p-2"
          placeholder="Hours"
          onChange={(e) => setHours(Number(e.target.value))}
        ></input>
        <button className="bg-blue-500 m-2 rounded-lg p-1" onClick={() => addActivity()}>Add Activity</button>
      </div>
      <canvas id="piechart" width="500" height="500" className="ml-56" />
      <table id="proportions-table" className="ml-56"></table>
    </>
  );
}

export default CanvasPie;

