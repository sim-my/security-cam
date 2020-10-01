import React, { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import * as moment from "moment";

const App = () => {
  //contains the list of records of the user presence
  const [records, setRecords] = useState([]);

  //creating references for video element, start button and stop button respectively

  const recordingVideo = useRef(null);
  const startButton = useRef(null);
  const stopButton = useRef(null);

  //creating references for record, recorder
  const shouldRecord = useRef(false);
  const record = useRef(false);
  const recorder = useRef(false);

  //creating reference for model

  const modelRef = useRef(null);

  useEffect(() => {
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
          window.stream = stream;
          recordingVideo.current.srcObject = stream;

          //loading coco ssd model

          const model = await cocoSsd.load();
          modelRef.current = model;

          //enabling the start button
          startButton.current.removeAttribute("disabled");
        } catch (error) {
          console.error(error);
        }
      }
    };
    gettingReady();
  }, []);

  //start button on Click

  const startButtonClick = () => {
    shouldRecord.current = true;
    stopButton.current.removeAttribute("disabled");
    startButton.current.setAttribute("disabled", true);
    intruderDetection();
  };

  const stopButtonClick = () => {
    shouldRecord.current = false;
    startButton.current.removeAttribute("disabled");
    stopButton.current.setAttribute("disabled", true);
    stopRecording();
  };

  //start recording function

  const startRecording = () => {
    //if recorder is recording we return
    if (record.current) return;

    //setting record to true and creatinng new recorder object
    record.current = true;
    recorder.current = new MediaRecorder(window.stream);

    //create a new record obsect and change record state
    recorder.current.ondataavailable = function (e) {
      const title = new Date() + "";
      const href = URL.createObjectURL(e.data);
      setRecords((previousRecords) => {
        return [...previousRecords, { href, title }];
      });
    };

    // then the recorder is started
    recorder.current.start();
  };

  //stop recording function

  const stopRecording = () => {
    //if recorder is not recording we return
    if (!record.current) return;

    // set record to false and stop the recorder
    record.current = false;
    recorder.current.stop();
  };

  //Intruder Detection function

  const intruderDetection = async () => {
    //if record is false call stopRecording()
    if (!shouldRecord.current) {
      stopRecording();
      return;
    }

    //initialize with noone detected

    let intruderDetected = false;

    //use model detect object in current video instance

    const predictions = await modelRef.current.detect(recordingVideo.current);

    //if the prediction class returns person then intruder is present

    predictions.forEach((prediction) => {
      if (prediction.class === "person") intruderDetected = true;
    });

    //if intruder present start recording else stop

    intruderDetected ? startRecording() : stopRecording();

    //call recursively this function for each frame in video

    requestAnimationFrame(() => {
      intruderDetection();
    });
  };

  return (
    <div className="container pt-4">
      <div className="row">
        <div className="col-8">
          <video autoPlay ref={recordingVideo} />
          <div className="buttons text-center p-3">
            <button
              className="btn btn-primary mr-4"
              onClick={startButtonClick}
              ref={startButton}
            >
              Start Camera
            </button>
            <button
              className="btn btn-danger"
              onClick={stopButtonClick}
              ref={stopButton}
            >
              Stop Camera
            </button>
          </div>
        </div>
        <div className="col-4">
          <table className="table">
            <thead>
              {!records.length ? (
                <tr>
                  <td>Records</td>
                </tr>
              ) : (
                <tr>
                  <th>S.N</th>
                  <th>Records</th>
                </tr>
              )}
            </thead>
            <tbody>
              {!records.length ? (
                <tr>
                  <td>No record yet</td>
                </tr>
              ) : (
                records.map(record, (key) => {
                  return (
                    <tr>
                      <td>{key + 1}</td>
                      <td>
                        {" "}
                        <a href={record.href}>
                          {moment(record.title).format("LLLL")}
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
