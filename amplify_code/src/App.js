import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { pubSub } from 'aws-amplify/in-app-messaging';
import React, { useEffect, useRef } from 'react';
import awsconfig from './aws-exports';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.svg';

Amplify.configure(awsconfig);

var SUB_TOPIC = "esp32/pub";
var PUB_TOPIC = "esp32/sub";

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function AppContent({ signOut }) {
  const incomingMsgRef = useRef(null);
  const sentMsgRef = useRef(null);
  const returnMsgRef = useRef(null);

  useEffect(() => {
    const sub = Amplify.PubSub.subscribe({ topics: [SUB_TOPIC] }).subscribe({
      next: (data) => {
        console.log('Message received', data);
        let topic = data.value[Object.getOwnPropertySymbols(data.value)[0]] || '';
        let time = data.value.time || '';
        let sensor_a0 = data.value.sensor_a0 || '';
        if (incomingMsgRef.current) {
          incomingMsgRef.current.innerHTML += "<b>NEW MESSAGE: </b><br> Topic: " + escapeHtml(String(topic)) + "<br> Time: " + escapeHtml(String(time)) + "<br> Sensor_a0: " + escapeHtml(String(sensor_a0)) + "<br>";
          incomingMsgRef.current.scrollTop = incomingMsgRef.current.scrollHeight;
        }
      },
      error: (error) => console.error(error),
    });

    return () => sub.unsubscribe();
  }, []);

  async function sendMessage() {
    let msgInput = document.getElementById('msg');
    let payload = msgInput.value;
    msgInput.value = '';
    console.log(payload);
    await Amplify.PubSub.publish({ topics: [PUB_TOPIC], message: { msg: payload } });
    if (returnMsgRef.current) {
      returnMsgRef.current.innerHTML = '<h3 style="color: green">Message sent!</h3>';
    }
    if (sentMsgRef.current) {
      sentMsgRef.current.innerHTML += escapeHtml(payload) + "<br>";
      sentMsgRef.current.scrollTop = sentMsgRef.current.scrollHeight;
    }
  }

  return (
    <div className="App">
      <div className="mt-5 row" style={{backgroundColor: "black", alignItems: "center", justifyContent: "center"}}>
        <img src={logo} style={{height: "5vmin"}} alt="logo" />
        <h1 style={{color: "white"}}>IoT Messaging</h1>
        <a href="https://aws.amazon.com/what-is-cloud-computing" className="pl-4">
          <img src="https://d0.awsstatic.com/logos/powered-by-aws-white.png" alt="Powered by AWS Cloud Computing" />
        </a>
      </div>
      <div className="row">
        <div id="publisher" className="col ml-5 mt-5 mb-5 mr-3" style={{borderStyle: "solid", borderWidth: "2px"}}>
          <h2>Publisher</h2>
          <p>The box below can be used to publish messages back to your devices by publishing to the topic <b>{PUB_TOPIC}</b></p>
          <h5>Message: </h5>
          <input type="text" className="form-control" id="msg" name="msg" placeholder="Enter Message Here" />
          <br />
          <button className="btn btn-primary" onClick={sendMessage}>Send Message</button>
          <div ref={returnMsgRef}></div>
          <br />
          <h3>Sent Messages:</h3>
          <p>Your sent messages will appear here</p>
          <div ref={sentMsgRef} className="overflow-auto mb-5 border" style={{maxHeight: "220px"}}></div>
        </div>
        <br /><br />
        <div id="subscriber" className="col mt-5 mr-5 mb-5" style={{borderStyle: "solid", borderWidth: "2px"}}>
          <h2>Subscriber</h2>
          <p>New messages from your device(s) that publish to the topic <b>{SUB_TOPIC}</b> will appear in the box below</p>
          <div ref={incomingMsgRef} className="overflow-auto border" style={{maxHeight: "200px"}}></div>
        </div>
      </div>
      <button className="btn btn-secondary mt-3" onClick={signOut}>Sign Out</button>
    </div>
  );
}

function App() {
  return (
    <Authenticator>
      {({ signOut }) => <AppContent signOut={signOut} />}
    </Authenticator>
  );
}

export default App;
