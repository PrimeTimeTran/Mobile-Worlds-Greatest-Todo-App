import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Keyboard,
  FlatList,
  TextInput,
  StyleSheet,
  AsyncStorage,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from "react-native";

import firebase from "react-native-firebase";

import Todo from "./src/components/Todo";
import { randomBackgroundImage } from "./src/utils";

function App() {
  const [todos, setTodos] = useState([]);
  const [email, setEmail] = useState("");
  const [todoBody, setTodoBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState(null);
  const ref = useRef(firebase.firestore().collection("todos"));
  const [currentUser, setCurrentUser] = useState({ email: "" });

  const setupUser = async () => {
    const savedUser = await AsyncStorage.getItem("currentUser");
    const signedInUser = await JSON.parse(savedUser)
    if (signedInUser) {
      setCurrentUser({ ...signedInUser });
      const query = ref.current
        .where("uid", "==", signedInUser.uid)
        .orderBy("createdAt", "asc");
      query.get().then(querySnapshot => {
        let newTodos = [];
        querySnapshot.forEach(doc => {
          const todo = {
            ...doc.data(),
            id: doc.id
          };
          newTodos.push(todo);
        });
        setTodos(newTodos);
      });
    } else {
      console.log("Not signed in");
      setCurrentUser({ email: "" });
    }
  };

  useEffect(() => {
    setupUser();

    const onCollectionUpdate = () => {
      const query = ref.current
        .where("uid", "==", currentUser.uid)
        .orderBy("createdAt", "asc");
      query.get().then(querySnapshot => {
        let newTodos = [];
        querySnapshot.forEach(doc => {
          const todo = {
            ...doc.data(),
            id: doc.id
          };
          newTodos.push(todo);
        });
        setTodos(newTodos);
      });
      setLoading(false);
    };
    ref.current.onSnapshot(onCollectionUpdate);
  }, [todoBody]);

  const addTodo = () => {
    setLoading(true);
    const newTodo = {
      body: todoBody,
      status: "Active",
      createdAt: new Date().toUTCString(),
      uid: currentUser.uid
    };

    ref.current.add(newTodo).then(doc => {
      newTodo.id = doc.id;
    });
    setTodoBody("");
    Keyboard.dismiss;
  };

  onDeleteTodo = id => {
    setLoading(true);
    ref.current.doc(id).delete();
  };

  onToggleTodo = id => {
    setLoading(true);
    const todo = todos.find(todo => todo.id === id);
    todo.status = todo.status === "Active" ? "Done" : "Active";
    ref.current
      .doc(id)
      .set(todo)
      .then(() => {
        console.log("success");
      })
      .catch(error => {
        console.log("failure");
      });
  };

  onSignIn = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(user => {
        const newUser = {
          uid: user.user.uid,
          email: user.user.email
        }
        setCurrentUser(newUser);
        setEmail("");
        setPassword("");
        AsyncStorage.setItem("currentUser", JSON.stringify(newUser))
      })
      .catch(error => {
        console.log("Account not found, creating a new one!");
        createUserAccount();
      });
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
        setEmail("");
        setPassword("");
      })
      .catch(error => {
        console.log("Failed to create new account!");
      });
  };

  renderTodos = () => {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.header}>Todo List ({todos.length})</Text>
          <TextInput
            value={todoBody}
            style={styles.input}
            placeholder="Add Todo"
            placeholderTextColor="lightgrey"
            onChangeText={text => setTodoBody(text)}
          />

          <TouchableOpacity
            onPress={addTodo}
            style={styles.submit}
            disabled={!todoBody.length}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <ActivityIndicator
            color="white"
            size="large"
            animating={loading}
            style={{ marginTop: 10 }}
          />
          <FlatList
            data={todos}
            style={styles.list}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <Todo
                {...item}
                number={index + 1}
                onToggleTodo={onToggleTodo}
                onDeleteTodo={onDeleteTodo}
              />
            )}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  renderSignin = () => {
    return (
      <View style={styles.authForm}>
        <TextInput
          value={email}
          style={styles.formInput}
          placeholder="johndoe@gmail.com"
          onChangeText={text => setEmail(text)}
        />
        <TextInput
          secureTextEntry
          value={password}
          placeholder="********"
          style={styles.formInput}
          onChangeText={text => setPassword(text)}
        />
        <TouchableOpacity onPress={onSignIn} style={styles.submit}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ImageBackground
      style={styles.bg}
      source={{ uri: randomBackgroundImage() }}
    >
      {currentUser.email !== "" && renderTodos()}
      {currentUser.email === "" && renderSignin()}
    </ImageBackground>
  );
}

export default App;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "95%",
    borderWidth: 1,
    borderRadius: 20,
    marginTop: "25%",
    maxHeight: "60%",
    minHeight: "60%",
    paddingBottom: 10,
    alignSelf: "center",
    alignItems: "center",
    borderColor: "white",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.4)"
  },
  header: {
    fontSize: 25,
    marginTop: 50,
    color: "white",
    fontWeight: "bold"
  },
  input: {
    padding: 10,
    width: "90%",
    fontSize: 22,
    color: "white",
    borderWidth: 1,
    borderRadius: 10,
    fontWeight: "bold",
    borderColor: "white"
  },
  submit: {
    width: "30%",
    height: "05%",
    minHeight: 50,
    marginTop: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    backgroundColor: "red",
    justifyContent: "center",
    backgroundColor: "#DB504A"
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold"
  },
  list: {
    width: "90%",
    height: "90%"
  },
  authForm: {
    flex: 1,
    width: "90%",
    height: "10%",
    maxHeight: "40%",
    borderRadius: 25,
    alignSelf: "center",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: "white"
  },
  formInput: {
    margin: 10,
    height: 60,
    padding: 10,
    fontSize: 25,
    width: "90%",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'grey',
  }
});
