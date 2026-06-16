# AWS End-to-End IoT Amplify Application in the Cloud

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Section I: IoT Setup](#section-i-iot-setup)
  - [Setting Up Your Device in AWS IoT Core](#setting-up-your-device-in-aws-iot-core)
  - [Configuring the ESP32](#configuring-the-esp32)
  - [Testing Your IoT Setup](#testing-your-iot-setup)
- [Section II: Web Application Setup](#section-ii-web-application-setup)
  - [Install Dependencies](#install-dependencies)
  - [Deploy the Backend with Amplify](#deploy-the-backend-with-amplify)
  - [Configure IoT Endpoint](#configure-iot-endpoint)
  - [Run the Application](#run-the-application)
  - [Deploy to the Cloud](#deploy-to-the-cloud)
- [Cleanup](#cleanup)
- [Security](#security)
- [License](#license)

## Introduction

In this demo, you will learn how to build a hosted web application in the cloud that communicates with your [Espressif ESP32](https://www.espressif.com/en/products/devkits/esp32-devkitc/overview) development board via the MQTT protocol. By following this guide, you will:

1. Register a device in AWS IoT Core and establish a secure policy for that device
2. Configure your ESP32 to publish and subscribe to topics in the AWS cloud using the MQTT protocol
3. Build a web application using AWS Amplify that bidirectionally communicates with your ESP32
4. Apply this basic messaging application to fit your needs

**Note:** This is a demo only. This is not to be used in a production environment as-is. Please use this to learn and for helping build a demo or PoC only.

## Architecture

![AWS End-To-End IoT Web Application](./iot_pictures/ProjectArchV4.png)

The web application uses:
- **AWS Amplify** for authentication (Cognito) and hosting
- **AWS IoT Core** for MQTT messaging between the ESP32 and the web app
- **React 18** with the `@aws-amplify/ui-react` Authenticator component

## Prerequisites

1. A Mac/PC with admin access and internet connectivity
2. An [AWS Account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
3. [Node.js](https://nodejs.org/en/download/) v20.x or later with npm v10.x or later
4. [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configured with your credentials
5. An ESP32 DevKit with a microUSB cable
6. [VS Code](https://code.visualstudio.com/) with the [PlatformIO extension](https://platformio.org/install/ide?install=vscode)

## Section I: IoT Setup

This section covers everything you need to set up your ESP32 to communicate with [AWS IoT Core](https://aws.amazon.com/iot-core/).

### Setting Up Your Device in AWS IoT Core

1. From the [AWS Console](https://console.aws.amazon.com/), navigate to **AWS IoT Core**.

2. In the left panel, go to **Manage > All devices > Things** and click **Create things**.

3. Select **Create single thing**, give it the name `ESP32`, and click **Next**.

4. Select **Auto-generate a new certificate** and click **Next**.

5. Click **Create policy** (opens in a new tab). Name it `ESP32Policy` and use the following JSON, replacing `REGION` and `ACCOUNT_ID` with your values:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:client/${iot:Connection.Thing.ThingName}"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topicfilter/esp32/sub"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topic/esp32/sub"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topic/esp32/pub"
    }
  ]
}
```

6. Back on the Create thing page, attach the `ESP32Policy` and click **Create thing**.

7. **Download the certificates**: device certificate, private key, and Amazon Root CA 1. Save these securely.

> **Finding your Account ID and Region:** Click your account name in the top-right corner for your Account ID. The region is shown in the dropdown next to it (e.g., `us-west-2`).

### Configuring the ESP32

1. Open VS Code and install the **PlatformIO** extension.

2. Create a new PlatformIO project:
   - Board: `Espressif ESP32 Dev Module`
   - Framework: `Arduino`

3. Install the required libraries via PlatformIO Library Manager:
   - `MQTT` by Joel Gaehwiler
   - `ArduinoJson` by Benoit Blanchon

4. Create the file `include/secrets.h` with your certificate data:

```cpp
#include <pgmspace.h>
#define SECRET
#define THINGNAME "ESP32"

const char WIFI_SSID[] = "YOUR_WIFI_SSID";
const char WIFI_PASSWORD[] = "YOUR_WIFI_PASSWORD";
const char AWS_IOT_ENDPOINT[] = "xxxxxxxxxxxxx.iot.REGION.amazonaws.com";

// Amazon Root CA 1
static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
YOUR_ROOT_CA_CERTIFICATE
-----END CERTIFICATE-----
)EOF";

// Device Certificate
static const char AWS_CERT_CRT[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
YOUR_DEVICE_CERTIFICATE
-----END CERTIFICATE-----
)EOF";

// Device Private Key
static const char AWS_CERT_PRIVATE[] PROGMEM = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
YOUR_PRIVATE_KEY
-----END RSA PRIVATE KEY-----
)EOF";
```

> **Finding your IoT endpoint:** In the AWS Console, go to IoT Core > Settings. The endpoint is listed under "Device data endpoint".

5. Replace the contents of `src/main.cpp` with the following:

```cpp
#include <Arduino.h>
#include "../include/secrets.h"
#include <WiFiClientSecure.h>
#include <MQTTClient.h>
#include <ArduinoJson.h>
#include "WiFi.h"

#define AWS_IOT_PUBLISH_TOPIC   "esp32/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "esp32/sub"

WiFiClientSecure net = WiFiClientSecure();
MQTTClient client = MQTTClient(256);

void connectAWS() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Connecting to Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi!");

  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);

  client.begin(AWS_IOT_ENDPOINT, 8883, net);
  client.onMessage(messageHandler);

  Serial.print("Connecting to AWS IoT...");
  while (!client.connect(THINGNAME)) {
    Serial.print(".");
    delay(100);
  }
  Serial.println("\nConnected to AWS IoT!");
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC);
}

void publishMessage() {
  StaticJsonDocument<200> doc;
  doc["time"] = millis();
  doc["sensor_a0"] = analogRead(0);
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);
  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer);
}

void messageHandler(String &topic, String &payload) {
  Serial.println("Incoming: " + topic + " - " + payload);
}

void setup() {
  Serial.begin(115200);
  connectAWS();
}

void loop() {
  publishMessage();
  client.loop();
  delay(1000);
}
```

6. Build and upload to your ESP32 using the PlatformIO upload button.

### Testing Your IoT Setup

1. In the AWS Console, go to **IoT Core > MQTT test client**.

2. Subscribe to `esp32/pub`. You should see messages arriving from your ESP32 with timestamp and sensor values.

3. Publish a test message to `esp32/sub`. Check the Serial Monitor in VS Code to confirm your ESP32 received it.

Congratulations! Your ESP32 is now connected to AWS IoT Core.

## Section II: Web Application Setup

This section covers setting up the React web application that communicates with your ESP32 via AWS IoT Core. The app uses [AWS Amplify](https://docs.amplify.aws/react/) for authentication and IoT PubSub messaging.

### Install Dependencies

```bash
cd amplify_code
npm install
```

### Deploy the Backend with Amplify

The app uses Amplify's built-in Authenticator component which automatically provisions a Cognito User Pool. To deploy:

```bash
npx ampx sandbox
```

Wait for the deployment to complete. When you see `amplify_outputs.json` generated, your backend is ready.

> **Note:** You need the [AWS Amplify CLI](https://docs.amplify.aws/react/start/account-setup/) configured. See the [Amplify Gen2 quickstart](https://docs.amplify.aws/react/start/quickstart/) for details.

### Configure IoT Endpoint

Update `src/aws-exports.js` with your IoT endpoint:

```javascript
"PubSub": {
    "aws_pubsub_region": "YOUR_REGION",
    "aws_pubsub_endpoint": "wss://YOUR_IOT_ENDPOINT.iot.YOUR_REGION.amazonaws.com/mqtt"
}
```

> **Finding your IoT endpoint:** AWS Console > IoT Core > Settings > Device data endpoint.

### IAM Policy for IoT Access

The Cognito Authenticated role needs permission to access IoT. In the [IAM Console](https://console.aws.amazon.com/iam/), find the Cognito authenticated role created by Amplify and attach this inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iot:Connect", "iot:Subscribe", "iot:Receive", "iot:Publish"],
      "Resource": "*"
    }
  ]
}
```

> **Security note:** For production, scope the resource ARNs to specific topics and clients.

### Run the Application

```bash
npm start
```

The app will open in your browser. Create an account using the sign-up form (Cognito will send a verification code to your email). After signing in, you should see messages from your ESP32 appearing in real-time.

### Deploy to the Cloud

To host your application publicly:

```bash
npx ampx sandbox --outputs-format json
```

Or connect your repo to [AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html) for CI/CD deployments from your Git repository.

## Cleanup

To remove all AWS resources created by this demo:

```bash
cd amplify_code
npx ampx sandbox delete
```

Then delete the IoT Thing and its certificates from the IoT Core Console.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
