import React, { useState, useEffect, useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  AsyncStorage,
  ImageBackground,
  KeyboardAvoidingView
} from "react-native";

import firebase from "react-native-firebase";

import Todos from "./src/components/Todos";
import SignInForm from "./src/components/SignInForm";

console.disableYellowBox = true;

const { height } = Dimensions.get("window");
const tracker = firebase.analytics();

const bgs = [
  require("./assets/1.jpg"),
  require("./assets/2.jpg"),
  require("./assets/3.jpg"),
  require("./assets/4.jpg"),
  require("./assets/5.jpg"),
  require("./assets/6.jpg"),
  require("./assets/7.jpg"),
  require("./assets/8.jpg"),
  require("./assets/9.jpg"),
  require("./assets/10.jpg")
];

const bg = bgs[Math.floor(Math.random() * bgs.length)];

function App() {
  const [todos, setTodos] = useState([]);
  const ref = useRef(firebase.firestore().collection("todos"));
  const [currentUser, setCurrentUser] = useState({ email: "" });

  updateTodos = querySnapshot => {
    let newTodos = [];
    querySnapshot.forEach(doc => {
      if (currentUser.uid === doc.data().uid) {
        const todo = {
          ...doc.data(),
          id: doc.id
        };
        newTodos.push(todo);
      }
    });
    newTodos = newTodos.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    setTodos(newTodos);
  };

  setupUser = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }

    const savedUser = await AsyncStorage.getItem("currentUser");
    const signedInUser = await JSON.parse(savedUser);
    if (signedInUser) {
      setCurrentUser({ ...signedInUser });
      const query = ref.current
        .where("uid", "==", signedInUser.uid)
        .orderBy("createdAt", "asc");
      query.get().then(querySnapshot => {
        updateTodos(querySnapshot);
      });
    } else {
      console.log("Not signed in");
    }
  };

  getToken = async () => {
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem("fcmToken", fcmToken);
      }
    }
  };

  requestPermission = async () => {
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.warn("permission rejected");
    }
  };

  useEffect(() => {
    setupUser();

    const onCollectionUpdate = querySnapshot => {
      updateTodos(querySnapshot);
    };
    ref.current.onSnapshot(onCollectionUpdate);
  }, []);

  onSignIn = (email, password) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(user => {
        const newUser = {
          uid: user.user.uid,
          email: user.user.email
        };
        setCurrentUser(newUser);
        AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
        tracker.logEvent("signed_in", newUser);
      })
      .catch(error => {
        console.log("Account not found, creating a new one!");
        createUserAccount();
      });
  };

  const onSignOut = async () => {
    try {
      await AsyncStorage.removeItem("currentUser");
      firebase
        .auth()
        .signOut()
        .then(
          () => {
            setTodos([]);
            console.log("Signed Out");
            setCurrentUser({ email: "", uid: "" });
            tracker.logEvent("signed_out");
          },
          error => {
            console.error("Sign Out Error", error);
          }
        );
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const createUserAccount = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(user => {
        setCurrentUser({
          uid: user.user.uid,
          email: user.user.email
        });
        tracker.logEvent("created_account", {
          uid: user.user.uid,
          email: user.user.email
        });
      })
      .catch(error => {
        console.log("Failed to create new account!");
      });
  };

  return (
    <ImageBackground style={styles.bg} source={bg}>
      <KeyboardAvoidingView
        behavior="position"
        style={styles.avoidingContainer}
      >
        {currentUser.email === "" ? (
          <SignInForm onSignIn={onSignIn} />
        ) : (
          <Todos
            todos={todos}
            onSignOut={onSignOut}
            currentUser={currentUser}
          />
        )}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

export default App;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: height,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black"
  },
  avoidingContainer: {
    flex: 1,
    width: "95%",
    minWidth: "95%",
    maxHeight: "60%",
    minHeight: "60%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center"
  }
});
