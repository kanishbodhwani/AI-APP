import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  useFonts as useFonts2,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import {API_URL} from "../src/constants/urls"
import { useChatContext } from "../src/context/ChatContext";
import { ChatMessage } from "../src/types/ChatMessage";
import MessageContainer from "../src/components/MessageContainer";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { serverTimestamp } from "firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useChatInstanceContext } from "../src/context/ChatInstanceContext";
import * as Speech from 'expo-speech';

const isiPhone = Platform.OS === "ios";

const apikey = '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';

const MessageScreen = ({ navigation, route }) => {
  const [replyInput, setReplyInput] = useState("");
  const [disable, setDisable] = useState(true);
  const [data, setData] = useState([]);
  const { chatMessages, getChatMessages, addChatMessage } = useChatContext();
  const {updateChatInstance, chatInstances} = useChatInstanceContext();
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const { item } = route.params;

  useEffect(() => {
    (async () => {
      await getChatMessages(item.id);
    })();
  }, []);

  const handleSend = async () => {
    if(replyInput === "") return;
    setDisable(false);
    setLoadingMessage(true);
    try {
      const instanceId = item.id;

      const messageDataUser: ChatMessage = {
        id: "",
        instanceId,
        sender: "user",
        text: replyInput,
        timestamp: serverTimestamp(),
      };
      addChatMessage(messageDataUser, instanceId);
      setReplyInput("");

      const prompt = replyInput;
      const response = await axios.post(
        API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + apikey,
          },
        }
      );
      const text = response.data.choices[0].message["content"];
      setData([
        ...data,
        { type: "user", text: replyInput },
        { type: "bot", text: text },
      ]);

      const messageDataBot: ChatMessage = {
        id: "",
        instanceId,
        sender: "bot",
        text: text,
        timestamp: serverTimestamp(),
      };

      addChatMessage(messageDataBot, instanceId);
      const currentDate = new Date();
      updateChatInstance(instanceId, currentDate);
      setDisable(true);
      setLoadingMessage(false);
    } catch (error) {
      console.log("Error adding chat message: ", error);
      setDisable(true);
    }
  };

  const speak = () => {
    if(speaking) {
      Speech.stop();
      return;
    };
    let text = "";
    if(replyInput === "") {
      text = chatMessages[chatMessages.length - 1].text; 
    } else {
      text = replyInput;
    }
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1,
      rate: 0.82,
      onStart: () => {
        setSpeaking(true);
      },
      onDone: () => {
        setSpeaking(false);
      },
      onStopped: () => {
        setSpeaking(false);
      },
      onError: () => {
        setSpeaking(false);
        alert('An error occurred with voice!');
      }
    });
  }

  const [poppins] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [quicksand] = useFonts2({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const renderMessage = () => {
    return (
      <>
        <View style={styles.header}>
          <Ionicons
            name="ios-chevron-back-circle-outline"
            size={38}
            color="#484848"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.name}>{item?.name}</Text>
          <Image
            source={require("../assets/images/bot.png")}
            style={{ width: 35, height: 35, borderRadius: 10 }}
          />
        </View>
        <View style={{ flex: 0.95 }}>
          {chatMessages.length > 0 ? (
            <FlatList
              // initialScrollIndex={data.alength - 1}
              inverted={true}
              scrollEnabled={true}
              getItemLayout={(data, index) => ({
                length: 100,
                offset: 100 * index,
                index,
              })}
              ListFooterComponent={
                loadingMessage ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : null
              }
              scrollEventThrottle={1}
              data={chatMessages}
              contentContainerStyle={{ flexDirection: "column-reverse" }}
              renderItem={({ item }) => {
                return (
                  <MessageContainer
                    message={item.sender === "user"}
                    replyInput={item.text}
                    answer={item.text}
                  />
                );
              }}
              keyExtractor={(item, index) => index.toString()}
              style={{ marginTop: 20 }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name="robot" size={36} color="#454545" />
            </View>
          )}
        </View>
        {/* </ScrollView> */}
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={setReplyInput}
            value={replyInput}
            placeholder="Ask me anything!"
            placeholderTextColor={"#908E95"}
            numberOfLines={4}
            multiline={true}
            editable={disable}
            textAlignVertical="center"
          />
          <TouchableOpacity
            disabled={!disable}
            onPress={handleSend}
            activeOpacity={0.7}
          >
            <FontAwesome
              style={styles.sendIcon}
              name="send"
              size={24}
              color="#514E60"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => speak()} style={styles.textToSpeech} activeOpacity={0.8}>
            {speaking ? <Image source={require("../assets/images/voice-stop.png")} alt="" style={{height: 28, width: 28}}/>
            : <Image source={require("../assets/images/voice-icon.png")} alt="" style={{height: 28, width: 28}}/>}
        </TouchableOpacity>
      </>
    );
  };

  if (!poppins || !quicksand) return null;
  return (
    <SafeAreaView style={styles.container}>
      {isiPhone ? <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >{renderMessage()}</KeyboardAvoidingView> 
      : renderMessage()}
    </SafeAreaView>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F4FA",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 24,
    color: "#484848",
    marginTop: -5,
  },
  messages: {
    flex: 1,
    marginTop: 20,
    flexDirection: "column",
  },
  messageInputContainer: {
    flexDirection: "row",
    width: "100%",
    position: "relative",
    marginTop: 20,
  },
  input: {
    width: "100%",
    borderColor: "#B4B4B4",
    backgroundColor: "#FFFDFF",
    borderRadius: 10,
    height: 50,
    elevation: 3,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: isiPhone ? 15: 5,
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendIcon: {
    position: "absolute",
    right: 20,
    bottom: 10,
  },
  textToSpeech: {
    position: "absolute",
    right: isiPhone ? 10: 20,
    bottom: isiPhone ? 100: 80,
    borderRadius: 50,
    backgroundColor: "#3E74D4",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  }
});
