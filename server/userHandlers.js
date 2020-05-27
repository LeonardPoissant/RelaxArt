"use strict";

const { MongoClient } = require("mongodb");
const assert = require("assert");
const _ = require("lodash");

const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT,
  }),
  databaseURL: process.env.FB_DATABASE_URL,
});

const db = admin.database();
const queryDatabase = async (key) => {
  const ref = db.ref(key);
  let data;
  await ref.once(
    "value",
    (snapshot) => {
      data = snapshot.val();
    },
    (err) => {
      console.log(err);
    }
  );
  return data;
};

const getUser = async (email) => {
  console.log("Im here");
  const data = (await queryDatabase("appUsers")) || {};
  const dataValue = Object.keys(data)
    .map((item) => data[item])
    .find((obj) => obj.email === email);

  return dataValue || false;
};

const createUser = async (req, res) => {
  const user = req.body;
  console.log("CREATEUSER", user);
  const returningUser = await getUser(req.body.email);
  if (returningUser) {
    res
      .status(200)
      .json({ status: 200, data: req.body, message: "returning user" });
    return;
  } else {
    console.log("CREATEYSER", req.body);
    const appUsersRef = await db.ref("appUsers");
    appUsersRef.push(req.body).then(() => {
      res.status(200).json({
        status: 200,
        data: req.body,
        message: "new user",
      });
    });
  }
};

const createMongoUser = async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });

  const user = req.body;

  try {
    await client.connect();
    const db = client.db("RELAXART");
    const doesMongoUserExist = await db
      .collection("users")
      .findOne({ displayName: user.displayName });

    console.log("DOESIT", doesMongoUserExist);

    if (doesMongoUserExist != null) {
      res.status(200).json({ status: 200, message: "returning User" });
    } else {
      let r = await db.collection("users").insertOne(user);
      assert.equal(1, r.insertedCount);
      res.status(201).json({
        status: 201,
        data: req.body,
        message: "MongoUser created",
      });
    }
  } catch (err) {
    res.status(500).json({ status: 500, data: req.body, message: err });
  }
  client.close();
};

// const getMongoUser = async (req, res) => {
//   const client = new MongoClient("mongodb://localhost:27017", {
//     useUnifiedTopology: true,
//   });

//   const user = req.body;
//   console.log(user.displayName);

//   try {
//     await client.connect();
//     const db = client.db("RELAXART");
//     const doesMongoUserExist = await db
//       .collection("users")
//       .findOne({ displayName: user.displayName });

//     console.log("DOESIT", doesMongoUserExist);

//     if (doesMongoUserExist.displayName === user.displayName) {
//       res.status(200).json({ status: 200, message: "returning User" });
//     } else {
//       res.status(200).json({ status: 200, user: user, message: "new User" });
//     }
//   } catch (err) {
//     res.status(400).json({ message: "sorry that user doesn't exist" });
//   }
// };

const getUsersInroom = async ({ email, roomId }) => {
  roomId = req.params();
  const data = (await queryDatabase("appUsers")) || {};
  const dataValue = Object.keys(data)
    .map((item) => data[item])
    .find((obj) => obj.email.roomId === roomId);

  return dataValue || false;
};

module.exports = {
  getUser,
  createUser,
  createMongoUser,
  // getMongoUser,
  getUsersInroom,
};
