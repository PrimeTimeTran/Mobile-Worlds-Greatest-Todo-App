import React, { useState, useEffect, useRef } from "react";
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
import { randomBackgroundImage } from "./src/utils";

function App() {
  const [todos, setTodos] = useState([]);
  const [todoBody, setTodoBody] = useState("");
  const ref = useRef(firebase.firestore().collection("todos"));

  useEffect(() => {
    const onCollectionUpdate = () => {
      const query = ref.current
        .where("uid", "==", "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1")
        .orderBy("createdAt", "asc");
      query.get().then(querySnapshot => {
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
    };
    ref.current.onSnapshot(onCollectionUpdate);
  }, [todoBody]);

  const addTodo = () => {
    const newTodo = {
      body: todoBody,
      status: "Active",
      createdAt: new Date().toUTCString(),
      uid: "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1"
    };

    ref.current.add(newTodo).then(doc => {
      newTodo.id = doc.id;
    });

    setTodoBody("");
    Keyboard.dismiss;
  };

  onDeleteTodo = id => {
    ref.current.doc(id).delete();
  };

  onToggleTodo = id => {
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

  return (
    <ImageBackground
      style={styles.bg}
      source={{ uri: randomBackgroundImage() }}
    >
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
          <FlatList
            data={todos}
            style={styles.list}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <Todo
                {...item}
                onToggleTodo={onToggleTodo}
                index={index}
                onDeleteTodo={onDeleteTodo}
              />
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
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "black"
  },
  container: {
    flex: 1,
    width: "95%",
    borderWidth: 1,
    borderRadius: 20,
    marginTop: "40%",
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
  }
});
