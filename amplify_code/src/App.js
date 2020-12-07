import Amplify, { Auth, API } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import React, { Component } from 'react';
import awsconfig from './aws-exports';
import '@aws-amplify/ui/dist/style.css';
import { PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.svg';
Amplify.configure(awsconfig);

var SUB_TOPIC = "esp32/pub";
var PUB_TOPIC = "esp32/sub";

// Apply plugin with configuration
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: '<YOUR-IOT-REGION>',
  aws_pubsub_endpoint: 'wss://xxxxxxxxxxxxx.iot.<YOUR-IOT-REGION>.amazonaws.com/mqtt',
}));

async function ProcessMessage(payload) {
  console.log('Message received', payload);
  let topic=payload.value[Object.getOwnPropertySymbols(payload.value)[0]];
  let time=payload.value.time;
  let sensor_a0=payload.value.sensor_a0;
  let scrollBox = document.getElementById('incomingMsg');
  scrollBox.innerHTML += "<b>NEW MESSAGE: </b><br></br> Topic: " + topic + "<br></br> Time: " + time + "<br></br> Sensor_a0: " + sensor_a0 + "<br></br>";
  scrollBox.scrollTop = scrollBox.scrollHeight;
}

async function SendMessage() {
  let payload=document.getElementById('msg').value;
  document.getElementById('msg').value='';
  console.log(payload);
  await PubSub.publish(PUB_TOPIC, { msg: payload });
  document.getElementById('returnMsg').innerHTML = '<h3 style="color: green">Message sent!</h3>';
  let sentMsgBox = document.getElementById('sentMsg');
  sentMsgBox.innerHTML += payload + "<br></br>";
  sentMsgBox.scrollTop = sentMsgBox.scrollHeight;
}

function App() {
  subscribe();
  return (
    <div className="App">
      <div className="mt-5 row" style={{"background-color": "black", "align-items": "center", "justify-content": "center"}}>
        <img src={logo} style={{"height": "5vmin"}} alt="logo"></img>
        <h1 style={{"color": "white"}}>IoT Messaging</h1>
        <a href="https://aws.amazon.com/what-is-cloud-computing" className="pl-4"><img src="https://d0.awsstatic.com/logos/powered-by-aws-white.png" alt="Powered by AWS Cloud Computing"></img></a>
      </div>
      <div className="row">
        <div id="publisher" className="col ml-5 mt-5 mb-5 mr-3" style={{"border-style": "solid", "border-width": "2px"}}>
          <h2>Publisher</h2>
          <p>The box below can be used to publish messages back to your devices by publishing to the topic <b>{PUB_TOPIC}</b></p>
          <h5>Message: </h5>
          <input type="text" className="form-control" id="msg" name="msg" placeholder="Enter Message Here"></input>
          <br></br>
          <button className="btn btn-primary" onClick={SendMessage}>Send Message</button>
          <div id='returnMsg'></div>
          <br></br>
          <h3>Sent Messages:</h3>
          <p>Your sent messages will appear here</p>
          <div id='sentMsg' className="overflow-auto mb-5 border" syle={{"max-height": "220px"}}></div>
        </div>
        <br></br><br></br>
        <div id="subscriber" className="col mt-5 mr-5 mb-5" style={{"border-style": "solid", "border-width": "2px"}}>
          <h2>Subscriber</h2>
          <p>New messages from your device(s) that publish to the topic <b>{SUB_TOPIC}</b> will appear in the box below</p>
          <div id="incomingMsg" className="overflow-auto border" style={{"max-height": "200px"}}></div>
        </div>
      </div>
    </div>
  );
}

function subscribe() {
  PubSub.subscribe(SUB_TOPIC).subscribe({
    next: data => ProcessMessage(data),
    error: error => console.error(error),
    close: () => console.log('Done'),
  });
}

export default withAuthenticator(App, true);

