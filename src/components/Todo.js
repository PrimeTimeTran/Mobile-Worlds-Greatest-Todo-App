import React from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";

const Todo = ({ id, body, index, status, toggleComplete }) => {
  const isDone = status === "Done";
  const bgStyle = isDone ? "#12355B" : "green";
  const textStyle = { textDecorationLine: isDone ? "line-through" : null };

  return (
    <TouchableHighlight
      onPress={() => toggleComplete(id)}
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
    backgroundColor: "rgba(52, 52, 52, 0.8)"
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
    fontSize: 20,
    marginLeft: 10,
    color: "white",
    fontWeight: "bold"
  },
  x: {
    color: "white"
  }
});
