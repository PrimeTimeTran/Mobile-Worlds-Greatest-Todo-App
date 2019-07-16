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
import { Button } from 'react-native-elements'

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

  setupUser = async () => {
    const savedUser = await AsyncStorage.getItem("currentUser");
    const signedInUser = await JSON.parse(savedUser);
    if (signedInUser) {
      console.log('signedInUsersignedInUser', signedInUser)
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

  updateTodos = querySnapshot => {
    let newTodos = [];
    console.log('updateTodosupdateTodos', )
    querySnapshot.forEach(doc => {
      console.log('currentUser.uid === doc.data().uid', currentUser.uid === doc.data().uid)
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

  useEffect(() => {
    setupUser();

    const onCollectionUpdate = querySnapshot => {
      updateTodos(querySnapshot);
      setLoading(false);
    };
    ref.current.onSnapshot(onCollectionUpdate);
  }, []);

  addTodo = () => {
    setLoading(true);
    const newTodo = {
      body: todoBody,
      status: "Active",
      createdAt: new Date().toUTCString(),
      uid: currentUser.uid
    };

    ref.current.add(newTodo).then(doc => {
      newTodo.id = doc.id;
      Keyboard.dismiss();
    });
    setTodoBody("");
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
      .then(go => {
        console.log("Success toggling");
      })
      .catch(error => {
        console.log("Failure toggling");
      });
    setLoading(false);
  };

  onSignIn = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(user => {
        const newUser = {
          uid: user.user.uid,
          email: user.user.email
        };
        setCurrentUser(newUser);
        setEmail("");
        setPassword("");
        AsyncStorage.setItem("currentUser", JSON.stringify(newUser));
      })
      .catch(error => {
        console.log("Account not found, creating a new one!");
        createUserAccount();
      });
  };

  const onSignOut = () => {
    try {
      firebase
        .auth()
        .signOut()
        .then(() => {
            console.log("Signed Out");
            setCurrentUser({ uid: '' })
            setTodos([])
          },
          error => {
            console.error("Sign Out Error", error);
          }
        );
    } catch (error) {
      console.log('Error: ', error)
    }
    
  }

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
        <View style={styles.todoContainer}>
          <Text style={styles.header}>Todo List ({todos.length})</Text>
          <TextInput
            value={todoBody}
            style={styles.input}
            placeholder={currentUser.email}
            onSubmitEditing={addTodo}
            placeholderTextColor="lightgrey"
            onChangeText={text => setTodoBody(text)}
          />
          <TouchableOpacity
            onPress={addTodo}
            style={styles.submit}
            disabled={!todoBody.length}
          >
            {loading && <ActivityIndicator color="white" loading />}
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
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
          <Button 
            title="Sign out"
            onPress={onSignOut}
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
      <KeyboardAvoidingView
        behavior="position"
        style={styles.avoidingContainer}
      >
        {currentUser.email !== "" && renderTodos()}
        {currentUser.email === "" && renderSignin()}
      </KeyboardAvoidingView>
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
    justifyContent: "center"
  },
  header: {
    fontSize: 25,
    marginTop: 10,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    justifyContent: "space-around",
    backgroundColor: "#DB504A"
  },
  buttonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold"
  },
  list: {
    flex: 1,
    width: "95%",
    minHeight: "10%",
    maxHeight: "200%"
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
    color: "white",
    borderColor: "grey"
  },
  avoidingContainer: {
    flex: 1,
    width: "95%",
    minWidth: "95%",
    maxHeight: "60%",
    minHeight: "60%",
    paddingBottom: 20,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  todoContainer: {
    flex: 1,
    borderWidth: 1,
    paddingBottom: 5,
    borderRadius: 20,
    minWidth: "100%",
    alignItems: "center",
    borderColor: "white",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.4)"
  },
  button: {
    backgroundColor: "green"
  }
});
