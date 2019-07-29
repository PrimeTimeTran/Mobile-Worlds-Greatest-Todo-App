import React, { useState } from "react";
import { 
  View, 
  Text,
  TextInput,
  StyleSheet, 
  TouchableOpacity,
} from "react-native";

const SignInForm = ({ onSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.authForm}>
        <TextInput
          value={email}
          style={styles.formInput}
          placeholder="johndoe@gmail.com"
          onChangeText={setEmail}
        />
        <TextInput
          secureTextEntry
          value={password}
          placeholder="********"
          style={styles.formInput}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => onSignIn(email, password)} style={styles.submit}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignInForm;

const styles = StyleSheet.create({
  container: { 
    backgroundColor: 'red' 
  },
  authForm: {
    flex: 1,
    width: "90%",
    height: "10%",
    minWidth: "90%",
    maxHeight: "40%",
    borderRadius: 25,
    alignSelf: "center",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
  },
  formInput: {
    margin: 10,
    height: 60,
    padding: 5,
    fontSize: 25,
    width: "90%",
    borderWidth: 1,
    color: "white",
    minWidth: "90%",
    borderRadius: 10,
    borderColor: "grey"
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
    justifyContent: "space-around"
  },
  buttonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold"
  }
});
