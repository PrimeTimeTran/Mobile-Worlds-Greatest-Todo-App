import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  FlatList,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity
} from "react-native";

import firebase from "react-native-firebase";


import Todo from "./src/components/Todo";

function App() {
  const [todos, setTodos] = useState([]);
  const [todoBody, setTodoBody] = useState("");

  useEffect(() => {
    // async function loadProducts() {
    //   console.log("loadProducts");
    //   try {
    //     // Create or sign the user into a anonymous account
    //     await firebase.auth().signInAnonymously();
    //     // call our named products endpoint
    //     const { data } = await firebase.functions().httpsCallable("products")({
    //       page: 1,
    //       limit: 15
    //     });

    //     // Update component state
    //     setProducts(data);
    //     setLoading(false);
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }

    // loadProducts();
    firebase
      .firestore()
      .collection("todos")
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
  });

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
    fontSize: 50,
    marginTop: 50,
    color: "white",
    fontWeight: "bold"
  },
  input: {
    padding: 10,
    width: "90%",
    fontSize: 30,
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
