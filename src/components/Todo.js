import React from "react";
import { View, Text, StyleSheet, TouchableHighlight } from "react-native";

export default class Todo extends React.PureComponent {
  toggleComplete = () => {
    this.props.toggleComplete(this.props.id)
  }
  render() {
    const isDone = this.props.status === "Done";
    const bgStyle = isDone ? "#12355B" : "green";

    return (
      <TouchableHighlight
        onPress={this.toggleComplete}
        style={[styles.bg, { backgroundColor: bgStyle }]}
      >
        <View style={styles.container}>
          <View style={{ flex: 2 }}>
            <Text
              style={[
                styles.text,
                { textDecorationLine: isDone ? "line-through" : "none" }
              ]}
            >
              {this.props.index + 1}: {this.props.body}
            </Text>
          </View>
          <View style={{ flex: 0.1 }}>
            <Text
              style={{
                color: "white",
                textDecorationLine: isDone ? "line-through" : null
              }}
            >
              X
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  bg: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: "rgba(52, 52, 52, 0.8)"
  },
  container: {
    flex: 1,
    padding: 10,
    margin: 10,
    alignItems: "center",
    flexDirection: "row"
  },
  text: {
    fontSize: 20,
    marginLeft: 10,
    color: "white",
    fontWeight: "bold"
  }
});
