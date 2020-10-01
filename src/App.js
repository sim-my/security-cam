import React, { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const App = () => {

  //contains the list of records of the user presence
  const [records, setRecords] = useState([]);

  //creating references for video element, start button and stop button respectively

  const recordingVideo = useRef(null);
  const startButton = useRef(null);
  const stopButton = useRef(null);

  //initial function for making camera ready and setting up model
  
  const gettingReady = async () => {

    //disabling both start and stop buttons

    startButton.current.setAttribute("disabled", true);
    stopButton.current.setAttribute("disabled", true);

    //accessing the webcam of the device

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
        recordingVideo.current.srcObject = stream;

      //loading coco ssd model

      const model = await cocoSsd.load();
      model.current = model;

      //enabling the start button
        startButton.current.removeAttribute("disabled");
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => gettingReady());

  return (
    <div className="container pt-4">
      <div className="row">
        <div className="col-8">
          <video autoPlay ref={recordingVideo} />
          <div className="buttons text-center p-3">
            <button className="btn btn-primary mr-4" ref={startButton}>
              Start Camera
            </button>
            <button className="btn btn-danger" ref={stopButton}>
              Stop Camera
            </button>
          </div>
        </div>
        <div className="col-4">
          <table className="table">
            <thead>
              <tr>
                <th>S.N</th>
                <th>Records</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
