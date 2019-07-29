import React, { useState, useRef, useEffect } from 'react'
import { 
  View, 
  Text,
  Keyboard,
  FlatList,
  TextInput,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native'

import firebase from "react-native-firebase";

import { Button } from "react-native-elements";

import Todo from "./Todo";

const { height } = Dimensions.get("window");
const tracker = firebase.analytics();

const Todos = ({ todos, currentUser, onSignOut }) => {
  const [loading, setLoading] = useState(true);
  const [todoBody, setTodoBody] = useState("");
  const ref = useRef(firebase.firestore().collection("todos"));

  useEffect(() => {
    setLoading(false)
  })

  onAddTodo = () => {
    setLoading(true);
    const newTodo = {
      body: todoBody,
      status: "Active",
      uid: currentUser.uid,
      createdAt: new Date().toUTCString()
    };

    ref.current.add(newTodo).then(doc => {
      newTodo.id = doc.id;
      Keyboard.dismiss();
    });
    tracker.logEvent("created_todo", newTodo);
  };

  onToggleTodo = id => {
    setLoading(true);
    const todo = todos.find(todo => todo.id === id);
    todo.status = todo.status === "Active" ? "Done" : "Active";
    ref.current
      .doc(id)
      .set(todo)
      .then(() => {
        tracker.logEvent("toggled_todo", {
          id,
          body: todo.body
        });
      })
      .catch(error => {
        console.log("Failure toggling");
        tracker.logEvent("error_toggling_todo");
      });
    setLoading(false);
  };

  onDeleteTodo = id => {
    setLoading(true);
    ref.current.doc(id).delete();
    tracker.logEvent("deleted_todo");
  };

  renderTodo = ({ item, index }) => {
    return (
      <Todo
        {...item}
        number={index + 1}
        onToggleTodo={onToggleTodo}
        onDeleteTodo={onDeleteTodo}
      />
    );
  };

  const addTodo = () => {
    onAddTodo(todoBody)
    setTodoBody("")
  }

  return (
    <TouchableWithoutFeedback
      style={styles.bg}
      accessible={false}
      onPress={Keyboard.dismiss}
    >
      <View style={styles.todoContainer}>
        <Text style={styles.header}>Todos List ({todos.length})</Text>
        <TextInput
          value={todoBody}
          style={styles.input}
          onSubmitEditing={addTodo}
          onChangeText={setTodoBody}
          placeholder={currentUser.email}
          placeholderTextColor="lightgrey"
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
          renderItem={renderTodo}
          keyExtractor={item => item.id}
        />
        <Button
          title="Sign out"
          onPress={onSignOut}
          style={{ marginTop: 10 }}
        />
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Todos

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: height,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black"
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
    minWidth: "90%",
    borderRadius: 10,
    fontWeight: "bold",
    borderColor: "white"
  },
  submit: {
    width: "35%",
    height: "05%",
    minHeight: 50,
    marginTop: 10,
    borderRadius: 10,
    marginBottom: 10,
    textAlign: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 130, 76, 0.6)",
    justifyContent: "space-around"
  },
  buttonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  list: {
    flex: 1,
    minWidth: "95%",
    maxHeight: "200%"
  },
  todoContainer: {
    flex: 1,
    width: "100%",
    borderWidth: 1,
    paddingBottom: 5,
    borderRadius: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    borderColor: "white",
    justifyContent: "center",
    maxHeight: height * 0.8
  },
});
