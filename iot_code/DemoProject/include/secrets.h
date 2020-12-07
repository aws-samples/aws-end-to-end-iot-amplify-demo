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