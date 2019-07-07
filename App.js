import React from "react";
import {
  Text,
  Alert,
  View,
  FlatList,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity
} from "react-native";

import firebase from "react-native-firebase";
import Todo from "./src/components/Todo";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      textInput: "",
      loading: true
    };

    this.ref = firebase.firestore().collection("todos");
    this.unsubscribe = null;
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  addTodo = () => {
    this.ref.add({
      status: "Active",
      createdAt: new Date(),
      body: this.state.textInput,
      uid: "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1"
    });

    this.setState({
      textInput: ""
    });
  };

  updateTextInput(value) {
    this.setState({ textInput: value });
  }

  onCollectionUpdate = querySnapshot => {
    let todos = [];
    querySnapshot.forEach(doc => {
      const { uid } = doc.data();
      if (uid === "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1") {
        todos.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });
    todos = todos.sort((a, b) => {
      return (
        new Date(a.createdAt) - new Date(b.createdAt)
      );
    });

    this.setState({
      todos,
      loading: false
    });
  };

  toggleComplete = id => {
    const todo = this.state.todos.find(todo => todo.id === id);
    todo.status = todo === "Active" ? "Done" : "Active";

    this.ref
      .doc(id)
      .set(todo)
      .then(function() {
        this.setState({ prompt: "Document successfully written!" });
      })
      .catch(function(error) {
        this.setState({ prompt: "Error writing document: ", error });
      });
  };

  render() {
    if (this.state.loading) return null;

    return (
      <ImageBackground
        style={styles.bg}
        source={{
          uri:
            "https://images.unsplash.com/photo-1537241969145-07fd0fa8083b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"
        }}
      >
        <View style={styles.container}>
          <Text style={styles.header}>
            Todo List ({this.state.todos.length}){/* {this.state.prompt} */}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={"Add Todo"}
            value={this.state.textInput}
            onChangeText={text => this.updateTextInput(text)}
          />
          <TouchableOpacity
            style={styles.submit}
            onPress={this.addTodo}
            disabled={!this.state.textInput.length}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <FlatList
            style={styles.list}
            data={this.state.todos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Todo {...item} toggleComplete={this.toggleComplete} />
            )}
          />
        </View>
      </ImageBackground>
    );
  }
}

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
