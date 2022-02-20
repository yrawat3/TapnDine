const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const fetch = require("node-fetch");
const strftime = require("strftime");

const createHMAC = (
  date,
  sharedKey,
  secretKey,
  httpMethod,
  requestURL,
  contentType,
  contentMD5,
  nepApplicationKey,
  nepCorrelationID,
  nepOrganization,
  nepServiceVersion
) => {
  const sdk = require("postman-collection");
  const cryptojs = require("crypto-js");

  const url = new sdk.Url(requestURL);
  const uri = encodeURI(url.getPathWithQuery());

  const d = date;
  d.setMilliseconds(0);
  const time = d.toISOString();

  const oneTimeSecret = secretKey + time;
  let toSign = httpMethod + "\n" + uri;
  if (contentType) {
    toSign += "\n" + contentType.trim();
  }
  if (contentMD5) {
    toSign += "\n" + contentMD5.trim();
  }
  if (nepApplicationKey) {
    toSign += "\n" + nepApplicationKey.trim();
  }
  if (nepCorrelationID) {
    toSign += "\n" + nepCorrelationID.trim();
  }
  if (nepOrganization) {
    toSign += "\n" + nepOrganization.trim();
  }
  if (nepServiceVersion) {
    toSign += "\n" + nepServiceVersion.trim();
  }

  const key = cryptojs.HmacSHA512(toSign, oneTimeSecret);
  const accessKey = sharedKey + ":" + cryptojs.enc.Base64.stringify(key);
  return "AccessKey " + accessKey;
};

const secret = "759d6e3fa82040878e8a58ccdb10bce9";
const shared = "95b15046be3d422fbab15d07bfd1cc99";
const siteId = "7efd869cd37f4decb212704aad532eb4";
const menuId = "123";
const nep_organization = "test-drive-d02d7dbfb5d34d80b73f1";

const getItems = () => {
  let d = new Date();
  var myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/json");

  myHeaders.append("nep-organization", nep_organization);
  // myHeaders.append("Date", "Sun, 20 Feb 2022 08:45:39 GMT");

  myHeaders.append("Date", strftime("%a, %d %b %Y %H:%M:%S %Z", d));
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Accept-Language", "en-us");
  myHeaders.append(
    "Authorization",
    createHMAC(
      d,
      shared,
      secret,
      "GET",
      "https://gateway-staging.ncrcloud.com/catalog/v2/items",
      "application/json",
      null,
      null,
      null,
      "test-drive-d02d7dbfb5d34d80b73f1",
      null
    )
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch("https://gateway-staging.ncrcloud.com/catalog/v2/items", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

exports.test = functions.https.onRequest((request, response) => {});

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin
    .firestore()
    .collection("messages")
    .add({ original: original });
  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});
