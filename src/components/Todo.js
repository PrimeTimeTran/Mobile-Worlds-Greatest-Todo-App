import React from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableHighlight
} from "react-native";

const Todo = ({ id, body, index, status, onToggleTodo, onDeleteTodo }) => {
  const isDone = status === "Done";
  const bgStyle = isDone ? "rgba(31, 58, 147, 0.6)" : "rgba(30, 130, 76, 0.6)";
  const textStyle = { textDecorationLine: isDone ? "line-through" : null };

  onLongPress = (body, id) => {
    const prompt = `"${body}"`;
    Alert.alert(
      "Delete your todo?",
      prompt,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => onDeleteTodo(id) }
      ],
      { cancelable: false }
    );
  };

  return (
    <TouchableHighlight
      onPress={() => onToggleTodo(id)}
      onLongPress={() => onLongPress(body, id)}
      style={[styles.bg, { backgroundColor: bgStyle }]}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, textStyle]}>
            {index + 1}: {body}
          </Text>
        </View>
        <View style={{ flex: 0.1 }}>
          <Text style={[styles.x, textStyle]}>X</Text>
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default Todo;

const styles = StyleSheet.create({
  bg: {
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 10
  },
  container: {
    flex: 1,
    margin: 10,
    padding: 10,
    alignItems: "center",
    flexDirection: "row"
  },
  textContainer: {
    flex: 2
  },
  text: {
    fontSize: 15,
    marginLeft: 10,
    color: "white",
    fontWeight: "bold"
  },
  x: {
    color: "white"
  }
});
