# AWS End-to-End IoT Amplify Application in the Cloud
  
## Table of Contents  
[Introduction](#introduction)  
[Prerequisites](#prerequisites)  
[Section I : IoT Setup](#Section-I--IoT-Setup)  
  - [Setting Up Your Device in AWS IoT Core](#Setting-Up-Your-Device-in-AWS-IoT-Core) 
  - [Configuring the ESP32](#Configuring-the-ESP32)  
  - [Testing Your IoT Setup](#Testing-Your-IoT-Setup)  

[Section II : Amplify Setup](#Section-II--Amplify-Setup)  
  - [Setting Up AWS Amplify Application in the Cloud](#Setting-Up-AWS-Amplify-Application-in-the-Cloud)  
  - [Creating Your AWS Amplify Application](#Creating-Your-AWS-Amplify-Application)  
  - [Add Authentication To Your Application](#Add-Authentication-To-Your-Application)  
  - [Using the AWS Amplify PubSub Library to Communicate with AWS IoT Core](#Using-the-AWS-Amplify-PubSub-Library-to-Communicate-with-AWS-IoT-Core)  
  - [Deploying Your Web Application](#Deploying-Your-Web-Application)  
  
## Introduction  

In this demo, you will learn how to build a hosted web application in the cloud that communicates with your [Espressif ESP32](https://www.espressif.com/en/products/devkits/esp32-devkitc/overview) development board via the MQTT protocol. By following the below guide, you should be able to:  
  
  1. Register a device in AWS IoT Core and establish a secure policy for that device  
  2. Configure your ESP32 to publish and subscribe to topics in the AWS cloud using the MQTT protocol  
  3. Build a web application in the cloud using AWS Amplify that bidirectionally communciates with your ESP32  
  4. Apply this basic messaging application to fit your needs  
  
By following this tutorial, you will setup the below architecture. This will make more sense as we go along.

**Note: IMPORTANT** This is a demo only. This is not to be used in a production environment as-is. Please use this to learn and for helping build a demo or PoC only.
  
![AWS End-To-End IoT Web Application](./iot_pictures/ProjectArch3.png)  
  
## Prerequisites  
  
In order to get started, make sure you have the following:  
  
  1. A Mac/PC with admin access and internet connectivity
  2. An AWS Account. A tutorial can be found [here.](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)  
  3. An ESP32 DevKit. You can find them here: https://www.amazon.com/gp/product/B0811LGWY2/ref=ppx_yo_dt_b_asin_title_o04_s00?ie=UTF8&psc=1  
  4. A microUSB cable to connect the ESP32 to your computer    
    [MicroUSB to USB-C cable](https://www.amazon.com/gp/product/B01LONQ7R6/ref=ppx_yo_dt_b_asin_title_o02_s00?ie=UTF8&psc=1)  
    [MicroUSB to USB cable](https://www.amazon.com/AmazonBasics-Male-Micro-Cable-Black/dp/B07232M876/ref=sr_1_1_sspa?dchild=1&keywords=micro+usb+to+usb&qid=1595002180&s=electronics&sr=1-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzR0ZORUgxWTFHNVZEJmVuY3J5cHRlZElkPUEwODMyMjA2MTFMNzVBSlNUSFdEViZlbmNyeXB0ZWRBZElkPUEwODUwMDczM0RVWE5FVTZWSkRQViZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=)  
  5. The AWS CLI installed in your terminal or command shell. Follow the below tutorial on how to install the AWS CLI for your computer's operating system:  
    https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html  
  
We will break down this tutorial into two main sections, an IoT section and a web app section. First, let's look at the IoT component.  
  
# Section I : IoT Setup
  
This section will cover everything you need to setup your ESP32 to communicate with [AWS IoT Core](https://aws.amazon.com/iot-core/). In order to do so, we must first register our device on AWS. In AWS IoT Core, devices are called "things". We will setup a "thing" in AWS to keep track of our device and its security permissions. 
  
## Setting Up Your Device in AWS IoT Core  
  
1.	From the [AWS Console](https://console.aws.amazon.com/console/home), navigate to AWS IoT Core.  
  
2.	If it is your first time using IoT Core, hit “Get started”  
  
3.	On the left panel, expand the “Manage” tab and click “Things”  
![AWS IoT Core Manage Tab](./iot_pictures/IoT%20Core%20Manage%20Tab.png)  
  
4.	Click “Create a single thing”  ![AWS IoT Core Create a Single Thing](./iot_pictures/IoT%20Core%20Create%20a%20Single%20Thing.png)  
  
5.	Give your device a name (In this demo we will use the name ESP32 which is referenced in many other steps. If you wish to use a different name, replace ESP32 with your name in the following steps) and click “Next”  ![AWS IoT Core Add Device to Registry](./iot_pictures/IoT%20Core%20Add%20device%20to%20Registry.png)  
  
6.	Click “Create certificate”  
  
7.	Download the certificate (first option), the private key (third option), and the root CA 1 for AWS Iot (fourth option - go to external site, find “RSA 2048 bit key:” and click “Amazon Root CA 1” to download). Keep these certificates and keys in a safe place for future use. You do not need to download the public key.  ![AWS IoT Core Certificate Created](./iot_pictures/IoT%20Core%20Certificate%20Created.png)  
  
8.	Click “Activate” - button should change to “Deactivate”  
  
9.	Click "Attach Policy"  
  
10.	Do not attach a policy yet, click “Register Thing” - you will be redirected to Things homepage.  ![AWS IoT Core Skip Add Policy](./iot_pictures/IoT%20Core%20Skip%20Attach%20Policy.png)  
  
11.	You will need to find your account ID and region for the next step. To find your account ID, click on the tab on the top that displays your account name. Two pieces of information will be shown, “Federated Login” and “Account”. Save the number underneath “Account”, this is your account ID. Save your account ID (without hyphens) somewhere for the next step. To find your region, click on the tab just to the right of the account tab, it should display a country or state name. The bolded region is your region (ex. us-west-2). Save this region (with hyphens) somewhere for the next step. 
  
![AWS IoT Core How to Find Account ID](./iot_pictures/IoT%20Core%20How%20to%20Get%20AccountID.png) ![AWS IoT Core How to Find Region](./iot_pictures/IoT%20Core%20How%20to%20Get%20Region.png)  
  
12.	Back in AWS IoT Core, expand the “Secure” tab on the left panel and click “Policies”  ![AWS IoT Core Secure Tab](./iot_pictures/IoT%20Core%20Secure%20Tab.png)  
  
13.	Click “Create a Policy”  
  
14.	Give the policy a name and click “Advanced mode”  
  
15.	Click in the “Add statements” box and add the following code, replacing ACCOUNT_ID and REGION with your account ID and region (also replace ESP32 with the name of your device if you used a different name).   
```JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:client/*"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topicfilter/*"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topic/*"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topic/*"
    }
  ]
}
```  
  
![AWS IoT Core Policy](./iot_pictures/IoTCorePolicy.png)  
Note: your region should be formatted the same way it appears in the AWS console (ex. us-west-2). However, your Account ID should not include any hyphens or your device will not be able to connect to AWS IoT Core.  
  
This policy basically allows any resource registered in your account to connect to AWS and subscribe, receive, and publish messages to topics in AWS IoT Core. This allows our IoT device to connect because we have registered it as a "thing" in AWS IoT Core. It will also allow other services to publish to same topics, as we will see later.    
  
16.	Click “Create” - you will be redirected to Policies homepage.  
  
17.	On the left panel, expand the “Secure” tab and click “Certificates”  ![AWS IoT Core Certificates Homepage](./iot_pictures/IoT%20Core%20Certificates.png)  
  
18.	Select the certificate you created for your device (this can be checked by clicking on the certificate and clicking on the “Things” tab, your device should be displayed).  ![AWS IoT Core Certificate Confirmation](./iot_pictures/IoT%20Core%20Confirm%20Cert.png)  
  
19.	Click “Policies”  
  
20.	Click the “Actions” drop down in the top right of this dashboard, click “Attach Policies”  ![AWS IoT Core Attach Policy to Certificate](./iot_pictures/IoT%20Core%20Attach%20Policy.png)  
  
21.	Check the box next to the policy you made in previous steps and click “Attach”  ![AWS IoT Core Attach Policy to Certificate](./iot_pictures/IoT%20Core%20Attach%20Policy%20Choose%20Pol.png)  
  
Now that we have configured our ESP32 as a "thing" in AWS IoT Core, we must tell the ESP32 where and how to send messages. To do this, we will be using the [Arduino Framework](https://www.arduino.cc/) to build a small application that is flashed into the device's memory. Our application will use the MQTT protocol to send a message periodically to the topic "esp32/pub". The message will contain a timestamp and the value of a sensor on the device (Note: no sensor is needed for this to work). Follow the below steps to configure your ESP32 for AWS IoT Core.  
  
## Configuring the ESP32    
  
In this section, we will be using the PlatformIO IDE within VS Code to flash the ESP32 with code. VS Code is a popular choice for developers and can be used for both parts of this guide. The Arduino IDE can also be used for this section but you will still need to download VS Code or another IDE for Section II. If you would like to use the Arduino IDE, you can [learn more here](https://github.com/aws-samples/aws-iot-workshop).  
  
1.	Download [VS Code](https://code.visualstudio.com/) for your OS   
  
2.	Open VS Code and click on the extensions tab on the left bar. Search “PlatformIO IDE” and choose the first option. Click install. You may need to restart VS Code to finish the installation.  ![VS Code PlatformIO Install](./iot_pictures/PlatformIO%20Install.png)  
  
3.	Back in VS Code, click on the house icon in the bottom left (purple or blue bar) to navigate to the PlatformIO homepage.  
![VS Code PlatformIO Bottom Nav Bar](./iot_pictures/PlatformIO%20Bottom%20Bar.png)  
  
4.	Click “New Project”  ![VS Code PlatformIO New Project](./iot_pictures/PlatformIO%20New%20Project.png)  
  
5.	Give the project a name and search for “Espressif ESP32 Dev Module” under boards. Select Arduino for the Framework. Click “Finish” when done  ![VS Code PlatformIO Project Setup](./iot_pictures/PlatformIO%20Project%20Options.png)  
  
6.	Once the project loads, again click on the house icon in the bottom left. Click on “Libraries” on the left panel of the PlatformIO homepage. Install two libraries, MQTT by Joel Gaehwiler and ArduinoJSON by Benoit Blanchon. Restart VS Code and the libraries should be successfully installed.  
  
![VS Code PlatformIO MQTT Library Dependency](./iot_pictures/PlatformIO%20MQTT%20Library.png) ![VS Code PlatformIO ArduinoJSON Library Dependency](./iot_pictures/PlatformIO%20AJ%20Library.png)  
  
7.	In VS Code's file explorer, you will see your project's root directory. Click the “Include” folder in to expand it. Click the new file button near the project name to create a new file in that folder. Call the new file “secrets.h”  
  
8.	Copy and paste the following code into secrets.h:
```C
#include <pgmspace.h>
#define SECRET
#define THINGNAME "ESP32"
const char WIFI_SSID[] = "";
const char WIFI_PASSWORD[] = "";
const char AWS_IOT_ENDPOINT[] = "";
// Amazon Root CA 1
static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
// insert AWS root CA 1 cert here
-----END CERTIFICATE-----
)EOF";
// Device Certificate
static const char AWS_CERT_CRT[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
// insert device certificate here
-----END CERTIFICATE-----
)KEY";
// Device Private Key
static const char AWS_CERT_PRIVATE[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
// insert device private key here
-----END RSA PRIVATE KEY-----
)KEY";
```  
  
9.	In the above code, enter your Wifi SSID (wifi name), Wifi password, and AWS IoT endpoint. You can find your AWS IoT endpoint by clicking “Settings” on the bottom of the left pane in AWS IoT Core. You will also need to paste your root CA certification, the device certification, and the private key into the respective places in the code. Note: you do need the “-----BEGIN CERTIFICATE-----” tags. On mac, TextEdit works well for opening the key and certificate files.  
  
10.	Open the src folder by clicking on it in the file explorer tab. Replace the scaffolding code in main.cpp with the following code (note: this code is a slight adaptation from code written in an AWS blog post https://aws.amazon.com/blogs/compute/building-an-aws-iot-core-device-using-aws-serverless-and-an-esp32/ to work on PlatformIO):  
```C
#include <Arduino.h>
#include "../include/secrets.h"
#include <WiFiClientSecure.h>
#include <MQTTClient.h>
#include <ArduinoJson.h>
#include "WiFi.h"

// The MQTT topics that this device should publish/subscribe
#define AWS_IOT_PUBLISH_TOPIC   "esp32/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "esp32/sub"

WiFiClientSecure net = WiFiClientSecure();
MQTTClient client = MQTTClient(256);

void messageHandler(String &topic, String &payload) {
  Serial.println("incoming: " + topic + " - " + payload);
}

void connectAWS()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.println("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }

  // Configure WiFiClientSecure to use the AWS IoT device credentials
  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);

  // Connect to the MQTT broker on the AWS endpoint we defined earlier
  client.begin(AWS_IOT_ENDPOINT, 8883, net);

  // Create a message handler
  client.onMessage(messageHandler);

  Serial.print("Connecting to AWS IOT");

  while (!client.connect(THINGNAME)) {
    Serial.print(".");
    delay(100);
  }

  if(!client.connected()){
    Serial.println("AWS IoT Timeout!");
    return;
  }

  // Subscribe to a topic
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);

  Serial.println("AWS IoT Connected!");
}

void publishMessage()
{
  StaticJsonDocument<200> doc;
  doc["time"] = millis();
  doc["sensor_a0"] = analogRead(0);
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer); // print to client

  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}

void setup() {
  Serial.begin(9600);
  connectAWS();
}

void loop() {
  publishMessage();
  client.loop();
  delay(1000);
}
```  
    
=====Code Explanation Start=====
```
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.println("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
```  
  
This section of the code connects your ESP32 device to your Wifi. We use the WifiClientSecure library and the Wifi's SSID and password you set in "secrets.h"  
  
```
  Serial.print("Connecting to AWS IOT");

  while (!client.connect(THINGNAME)) {
    Serial.print(".");
    delay(100);
  }

  if(!client.connected()){
    Serial.println("AWS IoT Timeout!");
    return;
  }

  // Subscribe to a topic
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);

  Serial.println("AWS IoT Connected!");
```  
  
The above code connects your device to AWS IoT. We use an MQTT client to accomplish this.  
  
```
void publishMessage()
{
  StaticJsonDocument<200> doc;
  doc["time"] = millis();
  doc["sensor_a0"] = analogRead(0);
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer); // print to client

  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}
```  
  
This function creates a JSON (JavaScript Object Notation) document containing two values, "time" and "sensor_a0". Sensor a0 is a input port on your ESP32 that can be connected to a sensor to generate real data and store it in this JSON document. If you do not have a sensor, this is okay for now just note that the device will read one constant value. This document is then serialized and sent to AWS IoT by publishing to the "esp32/pub" topic.  
  
=====Code Explanation End=======  
  
11.	If you still have an error with your "#include" statements in main.cpp, restart VS Code and the error should disappear.  
  
12.	Next, click the checkmark icon in the bottom bar to build your PlatformIO project.  
![VS Code PlatformIO Bottom Nav Bar](./iot_pictures/PlatformIO%20Bottom%20Bar.png) 
   
13.	To finish configuring the ESP32, you need to flash your code onto the device. With the board plugged in, click the arrow icon in the bottom bar to upload your code to the ESP32.  ![VS Code PlatformIO Successful Flash to Device](./iot_pictures/Successful%20Flash.png)  
  
14.	To see your code in action, click the serial monitor button in the bottom bar, it looks an electrical plug. The terminal should display that your device first connected to your Wifi and then to AWS IoT. Any incoming messages on the topic “esp32/sub” will appear here. Your ESP32 should be publishing messages every so often to the topic “esp32/pub”.  
  
![VS Code PlatformIO Serial Monitor](./iot_pictures/Serial%20Monitor.png)  
  
## Testing Your IoT Setup  
  
1. Now, test your IoT setup by logging back into the AWS Console and navigating to AWS IoT Core. Click "Test" on the left panel. First, we will test the topic to which your ESP32 is publishing messages. Enter "esp32/pub" into the "Subscription topic" box. Keep all of the other settings as default.   
  
![AWS IoT Core Test Subscription Page](./iot_pictures/IoTConsoleTestSubPage.png)  
  
2. Click "Subscribe to topic". You should now see the messages arriving from the ESP32. The messages each contain a timestamp and a sensor value.  
  
![AWS IoT Core Test Subscription Messages](./iot_pictures/IoTConsoleTestSub.png)  
  
3. Next, we will test your ESP32 subscribing to the topic "esp32/sub". Navigate back to the "Test" page in AWS IoT Core and this time, enter "esp32/sub" in the "Publish" section. You can write a custom message or use the default "Hello from AWS IoT Console".  

![AWS IoT Core Test Publish Page](./iot_pictures/IoTConsoleTestPub.png)  
  
4. Click "Publish to topic". Back in VS Code, you should see the message appear on the serial monitor for your device.  
  
![VS Code PlatformIO Serial Monitor With Test Message From Console](./iot_pictures/IoTTestSub.png)  
  
Congratulations! Your ESP32 is now connected to AWS IoT Core and is able to send and receive messages to different IoT topics. Follow the steps in the following section to setup your own web application that can communicate with your ESP32.   
    
# Section II : Amplify Setup  
  
This section will cover the process of setting up an application in the cloud using [AWS Amplify](https://aws.amazon.com/amplify/). By the end of this section, you should have a working application that can send and receive messages to your ESP32 device. Using the Arduino application from the previous section, the ESP32 will be sending frequent messages that will be displayed on the web application's homepage. The application is meant to be a baseline for your use case, you can configure the front end of this application to fit your needs.  
  
AWS Amplify can be used to build mobile and web applications. In this tutorial, we will be focusing on web applications but the same concept can be applied to mobile apps as well.   
  
## Setting Up AWS Amplify Application in the Cloud  
  
We will now setup our AWS Amplify application. Amplify is primarily configured using the [AWS Command Line Interface](https://aws.amazon.com/cli/) (CLI). Note that this tutorial was done on MacOS so you may need to adjust your commands if you are using Windows. Most of these commands came from the [AmplifyDocs](https://docs.amplify.aws/start/q/integration/react) website. We will be using the [React](https://reactjs.org/) framework to build our front-end.  
  
## Creating Your AWS Amplify Application  
  
1. Prerequisites:
  
  - [Node.js](https://nodejs.org/en/) v10.x or later  
  - [npm](https://www.npmjs.com/) v5.x or later  
  - [git](https://git-scm.com/) v2.14.1 or later  
  
2. We first need to install and configure the AWS Amplify CLI. To do so, run the following command in your Terminal or shell prompt:
```Bash
sudo npm install -g @aws-amplify/cli
```  
  
3. We now need to configure Amplify on our machine by providing our account information. Run the following command:
```Bash
amplify configure
```
This command will open a window in your web browser and direct you to your AWS Console. If you are not currently logged in, log in to the AWS account that you would like to use for AWS Amplify. Once you are logged in to the console, go back to your shell prompt and hit Enter.  ![AWS CLI Configure Setup](./amplify_pictures/AmplifyConfigureEnter.png)  
  
You will then be prompted to enter your region. You can find your region the same way you did in the previous section, by clicking on the tab in your AWS Console that displays a state or country name.  ![AWS IoT Core How to Find Region](./iot_pictures/IoT%20Core%20How%20to%20Get%20Region.png)  

Next, you will be asked to provide a username for your Amplify user. This will add a user in AWS Identity Access Manager. It does not matter what you put here, just use a name that is descriptive and that you can remember (ex. amplify-iot). Once you hit Enter, another window on your browser will open. This window directs you to the IAM Add User page and automatically fills in the username you provided. Make sure "Programmatic access" is checked. You do not need to check "AWS Management Console access". Click "Next: Permissions"
  
![AWS Amplify IAM Add User](./amplify_pictures/AmplifyIAMAddUser.png)  
  
The next page shows the user's permissions. Make sure "Attach existing policies directly" is highlighted in the top selection. Also make sure that "AdministatorAccess" is checked. You may need to search for this policy and select it yourself. Click "Next: Tags"
  
![AWS Amplify IAM Policy](./amplify_pictures/AmplifyIAMPolicy.png)  
  
You do not need to add any tags, so click "Next: Review"  
  
![AWS Amplify IAM Tags](./amplify_pictures/AmplifyIAMTags.png)  
  
Click "Create user". This should display a success message and allow you to see the user's Access Key ID and Secret access key. Make sure to download the csv file and keep it in a safe place, this is the only time you will be given these keys. After you have downloaded the csv files with your keys, hit "Close"
  
![AWS Amplify IAM Success](./amplify_pictures/AmplifyIAMSuccess.png)  
  
Back on your Terminal or shell prompt, hit Enter. You will be asked to enter your access key ID and secret access key. Open the csv file you downloaded and paste those keys into the terminal when prompted.  

![AWS Amplify CLI Config](./amplify_pictures/AmplifyCLIConfig.png)  
  
You will then be prompted to provide a profile name, just use the default and hit Enter. You have now configured the Amplify CLI and added an IAM User with administrator access in your AWS account.  
  
4. We will now create an Amplify application using the React framework. We will give it the name myamplifyapp but you can choose any name you would like (Note: Amplify application names cannot contain upper-case letters). Run the following command:  
```Bash
npx create-react-app myamplifyapp
```
  
5. Run the following command to enter your application's root directory.  
```Bash
cd myamplifyapp
```
  
6. Next, initialize your project using the following command.  
```Bash
amplify init
```
  
When prompted, enter all of the default settings. Enter "Y" when asked "Do you want to use an AWS profile?" and select "default" for the following prompt.   
  
Your project will then be initialized in the cloud. This process sets up an [AWS Cloud Formation](https://aws.amazon.com/cloudformation/) stack which includes IAM roles, S3 buckets, and other nested Cloud Formation stacks. This information can be seen in the AWS Console by searching for Cloud Formation.   
  
![AWS Amplify CLI Init](./amplify_pictures/AmplifyInit.png)  
  
7. To test the above steps, run the following command, which runs your application on your machine. Your web browser should appear and navigate to localhost:3000. You should see an empty React web page.  
```Bash
npm start
```
  
![AWS Amplify Empty React Application](./amplify_pictures/AmplifyEmptyApp.png)  
  
Press Control->c in the command prompt to stop the application.  
  
## Add Authentication To Your Application  
  
1. In order for our application to interact with AWS IoT Core, we must first add authentication. We do this using the following command.  
```Bash
amplify add auth
```
  
Select default configuration, username for sign in, and no advanced settings.  

![AWS Amplify Add Auth](./amplify_pictures/AmplifyAddAuth.png)  

2. The previous step added an authentication back-end service in AWS Amplify. This allows us to use AWS Cognito in order to manage users on our website. Cognito uses User Pools and Identity Pools. First, we will setup a user pool for admins on the site. Run the following command to add a user pool.  
```Bash
amplify auth update
```
  
Choose "Create or update Cognito user pool groups" and when prompted, name your group "admin". Enter "N" when asked if you want to add another User Pool Group. You can add other groups to Cognito later throught the console. Since we only added one group, we do not need to do anything to sort them, just press Enter.  
  
![AWS Amplify Add Cognito User Pool Group](./amplify_pictures/AmplifyAddUserPool.png)  
  
3. To add the authentication service to your application in the cloud, run the following command:  
```Bash
amplify push
```
  
When asked if you want to continue, enter "Y". It may take a few minutes to push your changes.    
  
![AWS Amplify Push](./amplify_pictures/AmplifyPush.png)  
  
If you would like to check to see these steps worked, log into the AWS Console and navigate to Cognito. Click "Manage User Pools" and then select "Users and Groups" on the left panel. Click "Groups" at the top and your admin group should be there. You won't have any users yet.   
  
![AWS Amplify Cognito Admin Group](./amplify_pictures/AmplifyCognitoGroup.png)  
  
4. Next, we need to install some dependencies for our application. Run the following commands. Note: you may need to run these with sudo if you have permission issues.    
```Bash
npm install aws-amplify
npm install aws-amplify-react
npm install react-bootstrap bootstrap
```  
  
5. In VS Code, open the root folder of your Amplify application. Open src/app.js. Replace the contents of that file with the following javascript:  
```javascript
import Amplify, { Auth, API } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import React, { Component } from 'react';
import awsconfig from './aws-exports';
import '@aws-amplify/ui/dist/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
Amplify.configure(awsconfig);

function App() {
  return (
    <div className="App">
      Your app here
    </div>
  );
}

export default withAuthenticator(App, true);
```  
  
6. Run your application again with the following command in your terminal:  
```Bash
npm start
```  
  
This will launch your application in a web browser and once it loads, you should be able to see the sign in page of your app.  
  
![AWS Amplify Sign In Page](./amplify_pictures/AmplifySignInPage.png)  
  
7. On your web application, click "Create account" to register a new user. Give the user a username and password that you will remember. The username we will use in this demo is amplifyDemoUser. Enter a valid email and phone number. You will need at least one of these for multi-factor authentication. Click "Create Account"  
  
![AWS Amplify Sign In User](./amplify_pictures/AmplifySignInUser.png)  
  
An email will be sent to that email to verify your identity. Enter the confirmation code in the email into the box on your webpage. The webpage will ask you to sign in. Use the credentials you set in the this step. You should see a minimal application with a greeting, sign out button, and "Your app here"  

![AWS Amplify Minimal Application](./amplify_pictures/AmplifyBlankApp.png)  
 
You should now be able to see that user if you go to Cognito in the AWS Console and click "Manage User Pools" and then "Users"  
  
![AWS Amplify Cognito User](./amplify_pictures/AmplifyCognitoUser.png)  
  
## Using the AWS Amplify PubSub Library to Communicate with AWS IoT Core  
  
Now that we have a basic application with user controls, we can use Amplify's PubSub library to publish and subscribe to AWS IoT topics. This will allow us to establish bidirectional communication between our Amplify application and our ESP32.  
  
1. In order to use Amplify's PubSub library, we need to attach a policy to our Amazon Cognito Identity. First, we need to find our Cognito Identity ID. To find this, go to the AWS Console and find Cognito. Click "Manage Identity Pools". If this application is your only use of Cognito, there will be only one identity pool. If you have multiple identity pools, you must find the one that corresponds to your Amplify application. Click on the name of the identity from your Amplify application.  
  
![AWS Amplify Cognito Identities](./amplify_pictures/AmplifyCognitoIdentities.png)  
  
2. Click on "Identity Browser" in the left panel and there should be one identity in this view. Click on that identity. At the top, your identity ID is displayed. You will want this for the next step.  
  
![AWS Amplify Cognito Identity ID](./amplify_pictures/AmplifyCognitoIdentityID.png)  
  
3. We also need the name of the policy that we created during the IoT section. In this tutorial, we named our policy "ESP32Policy" but you may have named it something different. To see the name of your policy, go to AWS IoT Core in the AWS Console. Click on the "Secure" tab on the left panel and select "Policies". Your policy should be displayed here.  
  
![AWS Amplify IOT Policy](./amplify_pictures/AmplifyIOTPolicy.png)  
  
4. Next, use your Cognito Identity ID and your policy name in the following command in your terminal to attach our policy to our Cognito identity.  
```Bash
aws iot attach-principal-policy --policy-name '<YOUR_IOT_POLICY_NAME>' --principal '<YOUR_COGNITO_IDENTITY_ID>'
```  
  
![AWS Amplify Attach Policy](./amplify_pictures/AmplifyAttachPolicy.png)  
  
5. According to the Amplify Docs:  
>For your Cognito Authenticated Role to be able to interact with AWS IoT it may be necessary to update its permissions, if you haven’t done this before.  
  
To do this, log into the AWS Console and choose CloudFormation from the list of services. Locate the parent stack of your Amplify application, if this is your first time using Amplify, the parent stack will be the only Amplify stack that does not say "NESTED". You can also choose based on creation time. The description should say "Root stack for the Amplify AWS CloudFormation provider.  
  
![AWS Amplify CloudFormation Parent Stack](./amplify_pictures/AmplifyParentStack.png)  
  
Select the "Resources" tab and find the "Auth Role" row. Click the link for "Physical ID" in that row.  
  
![AWS Amplify CloudFormation AuthRole Physical ID](./amplify_pictures/AmplifyAuthRole.png)  
  
This will open IAM in a new tab. Click "Attach policies". Search "IoT" and select both "AWSIoTConfigAccess" and "AWSIoTDataAccess". Click "Attach policy" 
  
![AWS Amplify AuthRole Permissions](./amplify_pictures/AmplifyAuthPerms.png)  
  
6. Finally, return to VS Code. Replace the contents of src/App.js with the following code, making sure to replace the placeholders for your region and endpoint (you can also find this code in the amplify_code folder). To find your endpoint, go to AWS IoT Core from the AWS Console and click on "Settings" on the bottom of the left panel. Your IoT endpoint should be displayed.    
```javascript
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
```  
  
Restart your Amplify application by running the following command again.  
```Bash
npm start
```  
  
Now go back to VS Code and open your Arduino application from Section I. Build the application and flash it to your device (you don't need to do this if this is already flashed onto your ESP32). Click the serial monitor button on the bottom bar of VS Code. This pulls up the Serial Monitor. You should see that your ESP32 has again connected to Wifi and AWS IoT. Your device is now publishing messages onto the topic "esp32/pub".  
  
![AWS Amplify Device Connected](./amplify_pictures/AmplifyDeviceConnected.png)  
  
Navigate to your Amplify application in your web browser (should have opened from the previous command but can also be reached at localhost:3000). On the right, you should see the messages coming in from your ESP32. Each message should show the topic, time, and sensor value. Since no sensor is connected, this value will mostly likely remain constant.  
  
![AWS Amplify Working Message Subscriber](./amplify_pictures/AmplifyIncomingMsg.png)  
  
You can also send messages from your Amplify application back to the ESP32. To do so, simply type a message into the input box and click "Send Message". You will see a success message.  
  
![AWS Amplify Sending Message](./amplify_pictures/AmplifySendMsg.png)  
  
![AWS Amplify Sent Message](./amplify_pictures/AmplifySentMsg.png)  
  
Back on the Serial Monitor for the ESP32 in VS Code, you can see that your message has been successfully delivered.  
  
![AWS Amplify Message Received](./amplify_pictures/AmplifyMsgReceived.png)  
  
## Deploying Your Web Application  

Currently, your Amplify application is currently hosted on your local machine. AWS offers hosting for your application. Note that a free tier is available but can be exceeded. Amplify pricing is based on build minutes and size of content delivered. If you would like your application to be hosted, use the following command from the root directory of your Amplify application.  
```Bash
amplify add hosting
```  
  
You can either host your application on the Amplify Console or with CouldFront and S3. For this tutorial, we will use the Amplify Console. We will also use manual deployment.    
  
![AWS Amplify Add Hosting](./amplify_pictures/AmplifyAddHosting.png)  
  
To publish your app, run the command:  
```Bash
amplify publish
```  
  
When asked if you want to continue, enter "Y"  
  
![AWS Amplify Publish](./amplify_pictures/AmplifyPublish.png)  
   
Once your application is finished publishing, you can go to your site using the URL provided at the end of the command output.  

![AWS Amplify URL](./amplify_pictures/AmplifyURL.png)  
   
You now have a web application in the cloud that can communicate bidirectionally with your ESP32. This idea can be scaled into any type of IoT application. The possibilities are endless! Next steps include but are not limited to:  
-Connecting sensors to receive real time data from your ESP32 on your web application  
-Interpreting the return messages on the ESP32 to produce some desired behavior  
-Including more IoT devices that publish to the same topic  
-Creating your own front end to show trends over time of your IoT data  

## Video Guide
To see a step-by-step video guide, see this [video](https://amazon.awsapps.com/workdocs/index.html#/document/819bd727b0753e2c342dafda6d2796e5e6c541140644cdc9c6a92bb162f45a39).

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

