import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Keyboard,
  FlatList,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";

import firebase from "react-native-firebase";

import Todo from "./src/components/Todo";

function App() {
  const [todos, setTodos] = useState([]);
  const [todoBody, setTodoBody] = useState("");

  useEffect(() => {

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('user')
      } else {
        console.log('no user')
      }
    })
    const todosRef = firebase
      .firestore()
      .collection("todos")

    const query = todosRef
            .where("uid", "==", "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1")
            .orderBy("createdAt", "asc");
    query
      .get()
      .then(querySnapshot => {
        let newTodos = [];
        querySnapshot.forEach(function(doc) {
          const todo = {
            ...doc.data(),
            id: doc.id
          };
          newTodos.push(todo);
        });
        setTodos(newTodos);
      });
  }, [todoBody, todos]);

  const addTodo = async () => {
    const newTodo = {
      status: "Active",
      createdAt: new Date(),
      body: todoBody,
      uid: "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1"
    };

    firebase
      .firestore()
      .collection("todos")
      .doc()
      .set(newTodo);
    setTodoBody("");

    const newTodos = todos.push(newTodo)
    setTodos(newTodos);
  };

  toggleComplete = id => {
    const todo = todos.find(todo => todo.id === id);
    todo.status = todo.status === "Active" ? "Done" : "Active";
    const todosRef = firebase.firestore().collection("todos");
    todosRef
      .doc(id)
      .set(todo)
      .then(() => {
        console.log("success");
      })
      .catch(error => {
        console.log("failure");
      });
  };

  return (
    <ImageBackground
      style={styles.bg}
      source={{
        uri:
          "https://images.unsplash.com/photo-1537241969145-07fd0fa8083b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.header}>Todo List ({todos.length})</Text>
        <TextInput
          value={todoBody}
          style={styles.input}
          placeholder={"Add Todo"}
          onChangeText={text => setTodoBody(text)}
        />
        <TouchableOpacity
          onPress={addTodo}
          style={styles.submit}
          disabled={!todoBody.length}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        <FlatList
          data={todos}
          style={styles.list}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <Todo {...item} toggleComplete={toggleComplete} index={index} />
          )}
        />
      </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

export default App;

const styles = StyleSheet.create({
  bg: {
    width: "100%",
    height: "100%"
  },
  container: {
    flex: 1,
    width: "95%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.9)"
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
    fontWeight: "bold",
    backgroundColor: "rgba(255, 255, 255, 0.5)"
  },
  submit: {
    width: "30%",
    height: "05%",
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
  }
});
