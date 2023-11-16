import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Timestamp } from "firebase/firestore";
import { useChatInstanceContext } from "../src/context/ChatInstanceContext";
import { ChatInstance } from "../src/types/ChatInstance";
import { getData } from "../src/utils/asyncStorage";
import { Ionicons } from "@expo/vector-icons";

const isiPhone = Platform.OS === "ios";

const AddChatScreen = ({ navigation }) => {
  const { addChatInstance } = useChatInstanceContext();
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = async () => {
    if (!name || !details) {
      return alert("Please add a name and details");
    }
    const user = await getData("@user");
    const chatInstance: ChatInstance = {
      id: "",
      name,
      details,
      createdBy: "user",
      createdAt: Timestamp.fromDate(new Date()),
      userId: user.uid,
      updatedAt: Timestamp.fromDate(new Date()),
    };
    addChatInstance(chatInstance, navigation);
  };

  const [poppins] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const renderAddChatScreen = () => {
    return (
      <View style={{flex: 1, justifyContent: "space-between"}}>
        <View>
          <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="ios-chevron-back-circle-outline"
              size={38}
              color="#484848"
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerText}>New Bot</Text>
          </View>
            <Image
              source={require("../assets/images/bot.png")}
              style={{ width: 40, height: 40, borderRadius: 10 }}
            />
          </View>
          <View style={styles.form}>
            <Text style={styles.formText}>Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
              placeholder="Add bot name"
              placeholderTextColor={"#908E95"}
            />
            <Text style={styles.formDetails}>Details</Text>
            <TextInput
              style={{ ...styles.input, height: 100, textAlignVertical: "top" }}
              onChangeText={setDetails}
              value={details}
              placeholder="What your bot does"
              placeholderTextColor={"#908E95"}
              multiline={true}
              numberOfLines={3}
            />
          </View>
        </View>
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={0.8}
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Add Bot</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!poppins) return null;
  return (
    <SafeAreaView style={styles.container}>
      {isiPhone ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {renderAddChatScreen()}
        </KeyboardAvoidingView>
      ) : (
        renderAddChatScreen()
      )}
    </SafeAreaView>
  );
};

export default AddChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDFF",
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#151515",
    marginLeft: 10,
  },
  form: {
    flexDirection: "column",
    marginTop: 10,
  },
  formText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#151515",
    marginTop: 20,
  },
  formDetails: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#151515",
    marginTop: 20,
  },
  input: {
    width: "100%",
    borderColor: "#B4B4B4",
    backgroundColor: "#FFFDFF",
    borderRadius: 10,
    height: 50,
    elevation: 3,
    textAlignVertical: "bottom",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // color: "#908E95",
  },
  submitButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#151515",
    height: 60,
    padding: 10,
    borderRadius: 10,
  },
  submitButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#fff",
  },
});
