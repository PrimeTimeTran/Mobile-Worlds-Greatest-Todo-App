import React from "react";
import {
  Text,
  View,
  FlatList,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

import firebase from "react-native-firebase";
import Todo from "./src/components/Todo"; // we'll create this next

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

    // const query = this.ref
    //   .where("uid", "==", "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1")
    //   .orderBy("createdAt", "asc");

    // const todos = [];

    // query
    //   .get()
    //   .then(querySnapshot => {
    //     querySnapshot.forEach(doc => {
    //       const todo = {
    //         ...doc.data(),
    //         id: doc.id
    //       };
    //       todos.push(todo);
    //     });
    //     this.setState({ todos });
    //   })
    //   .catch(error => {
    //     console.log("Error getting document:", error);
    // });
    
    this.ref
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const todo = {
            ...doc.data(),
            id: doc.id
          };
          todos.push(todo);
        });
        save(todos);
      })
      .catch(error => {
        console.log("Error getting document:", error);
      });
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
      uid: "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1",
    });

    this.setState({
      textInput: ""
    });
  }

  updateTextInput(value) {
    this.setState({ textInput: value });
  }

  onCollectionUpdate = (querySnapshot) => {
    let todos = [];
    querySnapshot.forEach(doc => {
      const { uid, body, status, createdAt } = doc.data();
      if (uid === "JcaPj5OxdsXbQ7YRPLJ3Bo6IQ7r1") {
        todos.push({
          doc,
          uid,
          body,
          status,
          createdAt,
          id: doc.id
        });
      }
    });

    todos = todos.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    this.setState({
      todos,
      loading: false
    });
  };

  render() {
    if (this.state.loading) {
      return null;
    }

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
            Todo List ({this.state.todos.length})
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
            renderItem={({ item }) => <Todo {...item} />}
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
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    fontSize: 50,
    marginTop: 50,
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    padding: 10,
    width: "90%",
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    backgroundColor: "rgba(52, 52, 52, 0.8)"
  },
  submit: {
    width: '30%',
    height: '05%',
    marginTop: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: 'red',
    justifyContent: 'center',
    backgroundColor: '#DB504A'
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    width: "90%",
    height: "90%",
  }
});
