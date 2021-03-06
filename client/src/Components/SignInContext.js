import React, { createContext, useEffect, useState } from "react";

import withFirebaseAuth from "react-with-firebase-auth";
import * as firebase from "firebase";
import "firebase/auth";

var firebaseConfig = {
  apiKey: "AIzaSyAiXeVVIPJat_NK5vLElJ1QZ_RokcyaM_U",
  authDomain: "realart-7f748.firebaseapp.com",
  databaseURL: "https://realart-7f748.firebaseio.com",
  projectId: "realart-7f748",
  storageBucket: "realart-7f748.appspot.com",
  messagingSenderId: "550734795002",
  appId: "1:550734795002:web:88437bcd85ccc9e40e3943",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseAppAuth = firebaseApp.auth();

const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

providers.googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const signInContext = createContext(null);

const SignInProvider = ({
  children,
  signInWithGoogle,
  signOut,
  user,
  createUserWithEmailAndPassword,
  updateProfile,
}) => {
  const [appUser, setAppUser] = useState({});
  const [mongoUser, setMongoUser] = useState({});
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState("");
  const [okToGo, setOkToGo] = useState(false);

  const handleSignOut = () => {
    signOut();
    setAppUser({});
    setOkToGo(false);
  };

  const signup = async (email, password) => {
    return firebaseAppAuth
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        console.log("SIGNUP", response);
        response.user.updateProfile({
          displayName: displayName,
        });
      })
      .catch((err) => {
        console.log("CATCH", err.message);
        setErr(err);
      });
  };

  const signin = async (email, password) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        setAppUser(response.user);
        return response.user;
      });
  };

  useEffect(() => {
    if (user) {
      const obj = {
        displayName: displayName,
        email: user.email,
        photoURL: user.photoURL,
      };

      console.log("CONTEXT", user);

      fetch("/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(obj),
      })
        .then((res) => res.json())
        .then((googleUser) => {
          console.log("CONTEXT", googleUser);
          setAppUser(googleUser.data);
          setOkToGo(true);
        });
      fetch("/mongoUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(obj),
      })
        .then((res) => res.json())
        .then((mongoUser) => {
          setMongoUser(mongoUser.data);
        });
    }
  }, [user]);

  return (
    <signInContext.Provider
      value={{
        signInWithGoogle,
        createUserWithEmailAndPassword,
        displayName,
        setDisplayName,
        handleSignOut,
        signin,
        signup,
        updateProfile,
        appUser,
        user,
        mongoUser,
        err,
        okToGo,
      }}
    >
      {children}
    </signInContext.Provider>
  );
};

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
  firebaseApp,
})(SignInProvider);
