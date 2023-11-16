import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import {
  useFonts as useFonts2,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useEffect, useState } from "react";
import { getData } from "../src/utils/asyncStorage";
import { sendEmail } from "../src/services/gmailService";
import { getSecure } from "../src/utils/secureStorage";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { getUserByUsername } from "../src/services/firebase";
import * as DocumentPicker from "expo-document-picker";

interface MailScreenProps {
  navigation: any;
  route: any;
}

const apiKey = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";

const isiPhone = Platform.OS === "ios";

const CreateEmail = ({ route, navigation }: MailScreenProps) => {
  const {
    emailFrom,
    subject: reSubject,
    body: replyBody,
    sender,
  } = route.params || {};

  const [user, setUser] = useState(null);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [disable, setDisable] = useState(false);
  const [show, setShow] = useState("flex" as any);
  const [showFrom, setShowFrom] = useState("flex" as any);
  const [textOnlyBody, setTextOnlyBody] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);

  const [myName, setMyName] = useState<string>("");
  const bgColor = isiPhone ? "#FFFFFF" : "#FFFFFF";

  const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
    setShowFrom("flex");
  });

  useEffect(() => {
    (async () => {
      const user = await getData("@user");
      setUser(user[0]);
      setUser(user);
      if (reSubject && emailFrom) {
        setSubject(reSubject);
        setTo(emailFrom);
      }
      const userName = await getUserByUsername(user.email);
      setMyName(userName.fullname);

      const isHTML = /<[a-z][\s\S]*>/i.test(replyBody);
      if (isHTML) {
        const bodyStartIndex = replyBody.indexOf("<body");
        const bodyEndIndex = replyBody.indexOf("</body>");
        if (bodyStartIndex !== -1 && bodyEndIndex !== -1) {
          const contentBetweenBodyTags = replyBody.substring(
            bodyStartIndex + 6,
            bodyEndIndex
          );
          const textOnlyBody = contentBetweenBodyTags.replace(/<[^>]+>/g, "");
          setTextOnlyBody(textOnlyBody);
        } else {
          setTextOnlyBody(replyBody);
        }
      } else {
        setTextOnlyBody(replyBody);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setDisable(true);
    if (to === "" || subject === "" || body === "") {
      alert("Please fill all the fields");
      setDisable(false);
      return;
    }
    const accessToken = await getSecure("accessToken");
    const emailSent = await sendEmail(
      user.email,
      accessToken,
      to,
      subject,
      body,
      attachments
    );
    if (emailSent) {
      navigation.navigate("Email");
      setDisable(false);
    } else {
      alert("Error sending email");
      setDisable(false);
    }
  };

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

  const rewrite = async () => {
    if (show === "none" || (showFrom === "none" && isiPhone)) {
      Keyboard.dismiss();
      setShow("flex");
      setShowFrom("flex");
    }
    setDisable(true);
    if (body === "" || subject === "") {
      alert("Please enter a body and subject");
      setDisable(false);
      return;
    }
    let promptToSend = "";
    if (textOnlyBody && textOnlyBody !== "") {
      promptToSend =
        "My name: " +
        myName +
        "\n" +
        "Sender's name: " +
        sender +
        "\n" +
        "ReplyBody: Replying to this message" +
        textOnlyBody +
        "\n" +
        "Subject: " +
        subject +
        "\n" +
        "Body: " +
        body +
        "\n" +
        "You have received a short and informal replyBody, subject and body. Rewrite the email body as you are replying to replyBody, in a more professional and concise manner while maintaining clarity and respect. You can also add more details to the email body but not necessary, Best option to write the body as the same format as replyBody. Understand the context of the replyBody and write the reply as email body accordingly. User may have given you only some points in the body, you have to rewrite the whole email body. and also when start the mail with Dear [name] or Hi [name] put the sender's name in the [name] place. At the end of the mail, put My Name instead of [Your Name] that I've provided you. Rember to reply with only body 'Body: ${body}'";
    } else {
      promptToSend =
        "My name: " +
        myName +
        "\n" +
        "Subject: " +
        subject +
        "\n" +
        "Body: " +
        body +
        "\n" +
        "You have received a short and informal subject and email body. Rewrite the subject and email body in a more professional and concise manner while maintaining clarity and respect. You can also add more details to the email body but not long if not necessary. Understand the context of the email and rewrite the subject and email body accordingly. User may have given you only some points, you have to write the whole email body. and reply with Subject: subejct and Body: body and also When starting the mail with Dear [name] or Hi [name] put the sender's name value (if provided) in the [name] place. At the end, put My Name in place of [Your Name]. Remember to reply with the same format and sequence 'Subject: ${subject}' and 'Body: ${body}'";
    }

    try {
      const prompt = promptToSend;
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
            Authorization: "Bearer " + apiKey,
          },
        }
      );
      const text = response.data.choices[0].message["content"];
      let newSubject;
      let newBody;

      if (textOnlyBody) {
        if (text.startsWith("Body: ")) {
          newBody = text.split("Body: ")[1]?.trim();
          const b = manipulateBody(newBody);
          newBody = b;
        } else {
          newBody = text;
          const b = manipulateBody(newBody);
          newBody = b;
        }
      } else {
        if (text.startsWith("Subject: ")) {
          newSubject = text.split("Subject: ")[1].split("Body:")[0]?.trim();
          newBody = text.split("Body:")[1]?.trim();
          const b = manipulateBody(newBody);
          newBody = b;
        } else {
          const dear = text.split("Dear")[0];
          const hi = text.split("Hi")[0];
          const hey = text.split("Hey")[0];
          if (dear) {
            newSubject = dear.trim();
            newBody = text.split("Dear")[1]?.trim();
            newBody = "Dear" + newBody;
            const b = manipulateBody(newBody);
            newBody = b;
          }
          if (hi) {
            newSubject = hi.trim();
            newBody = text.split("Hi")[1]?.trim();
            newBody = "Hi" + newBody;
            const b = manipulateBody(newBody);
            newBody = b;
          }
          if (hey) {
            newSubject = hey.trim();
            newBody = text.split("Hey")[1]?.trim();
            newBody = "Hey" + newBody;
            const b = manipulateBody(newBody);
            newBody = b;
          }
        }
        setSubject(newSubject);
      }

      setBody(newBody);
      setDisable(false);
    } catch (error) {
      console.log("Error writing email", error);
      setDisable(false);
    }
  };

  const manipulateBody = (body) => {
    let b = body.split(myName)[0]?.trim();
    if (b === body) {
      b = body.split("[Your Name]")[0]?.trim();
    }
    b = b + '\n' + `${myName}'s Personal AI Assistant`; 
    return b;
  }

  const deleteFields = () => {
    setTo("");
    setSubject("");
    setBody("");
    navigation.goBack();
  };

  const goBack = () => {
    if (isiPhone) {
      if (show === "none" || showFrom === "none") {
        Keyboard.dismiss();
        setShow("flex");
        setShowFrom("flex");
      } else {
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  const handleShow = () => {
    if (isiPhone) {
      if (show === "none") {
        setShow("flex");
      } else {
        setShow("none");
      }
    }
  };

  const attach = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: false,
      });
      if (result.type === "success") {
        const uri = FileSystem.documentDirectory + result.name;
        await FileSystem.copyAsync({
          from: result.uri,
          to: uri,
        });
        const attachs = await Promise.all(
          [uri].map(async (uri) => {
            try {
              const name = uri.split("/").pop();
              const fileData = await readDocumentFile(uri);
              return { uri: fileData, name };
            } catch (error) {
              console.error("Error reading file:", error);
              return null;
            }
          })
        );
        setAttachments(attachs.filter((attach) => attach !== null));
      }
    } catch (error) {
      console.error("Error attaching files:", error);
    }
  };

  const readDocumentFile = async (fileUri) => {
    try {
      const permissionResponse = await MediaLibrary.requestPermissionsAsync();
      if (permissionResponse.granted === false) {
        alert("Permission to save file is required");
        return;
      }
      const { exists } = await FileSystem.getInfoAsync(fileUri);
      if (!exists) {
        console.error("File does not exist");
        return null;
      }

      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("File data:", fileData);
      return fileData;
    } catch (error) {
      console.error("Error reading document file:", error);
      return null;
    }
  };

  const mailScrenContent = () => {
    return (
      <>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="ios-chevron-back-circle-outline"
              size={38}
              color="#484848"
              onPress={() => goBack()}
            />
            <Text style={styles.composeText}>Compose</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="ios-attach"
              size={29}
              color="black"
              onPress={() => attach()}
            />
            <MaterialIcons
              style={{ marginRight: 10 }}
              name="delete-outline"
              size={29}
              color="black"
              onPress={() => deleteFields()}
            />
          </View>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            height: "95%",
          }}
        >
          <View
            style={{
              marginTop: 10,
              flexDirection: "column",
              flexGrow: 1,
              height: "90%",
            }}
          >
            <View style={{ height: "30%", display: show }}>
              <View style={{ ...styles.flex, display: showFrom }}>
                <View style={styles.inside}>
                  <Text style={styles.inputText}>From</Text>
                </View>
                <TextInput
                  style={{
                    ...styles.input,
                    height: 50,
                    backgroundColor: bgColor,
                    paddingBottom: !isiPhone ? 12 : 0,
                  }}
                  value={user?.email}
                  placeholder=""
                  placeholderTextColor={"#908E95"}
                  editable={false}
                />
              </View>
              <View style={styles.flex}>
                <View style={styles.inside}>
                  <Text style={styles.inputText}>To</Text>
                </View>
                <TextInput
                  style={{
                    ...styles.input,
                    height: 50,
                    backgroundColor: bgColor,
                    paddingBottom: !isiPhone ? 12 : 0,
                  }}
                  onChangeText={setTo}
                  value={to}
                  placeholderTextColor={"#908E95"}
                  onFocus={() => setShowFrom("none")}
                />
              </View>
              <View style={styles.flex}>
                <View style={[styles.inside]}>
                  <Text style={styles.inputText}>Sub</Text>
                </View>
                <TextInput
                  style={[
                    {
                      ...styles.input,
                      height: 50,
                      backgroundColor: bgColor,
                      paddingBottom: !isiPhone ? 12 : 0,
                      paddingTop: isiPhone ? 14 : 0,
                    },
                  ]}
                  onChangeText={setSubject}
                  value={subject}
                  multiline={true}
                  numberOfLines={2}
                  placeholderTextColor={"#908E95"}
                  onFocus={() => setShowFrom("none")}
                />
              </View>
            </View>
            <View style={{ height: "70%" }}>
              <View style={styles.flex}>
                <View
                  style={{
                    flexDirection: "column",
                    flexGrow: 1,
                    width: "100%",
                  }}
                >
                  <TextInput
                    style={{
                      ...styles.input,
                      ...styles.bodyInput,
                      backgroundColor: bgColor,
                      paddingBottom: !isiPhone ? 12 : 0,
                    }}
                    onChangeText={setBody}
                    value={body}
                    placeholder="Write your email here"
                    placeholderTextColor={"#908E95"}
                    multiline={true}
                    numberOfLines={10}
                    onFocus={() => handleShow()}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => rewrite()}
                    disabled={disable}
                    style={disable ? {...styles.rewriteButton, opacity: 0.5}: styles.rewriteButton}
                  >
                    <Text
                      style={{
                        ...styles.inputText,
                        fontSize: 16,
                        color: "#fff",
                      }}
                    >
                      Rewrite
                    </Text>
                    <FontAwesome
                      name="magic"
                      size={20}
                      color="#fff"
                      style={
                        disable
                          ? { ...styles.magicIcon, opacity: 0.5 }
                          : styles.magicIcon
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{ width: "100%", marginTop: show === "none" ? -40 : null }}
          >
            <TouchableOpacity
              style={
                disable
                  ? { ...styles.buttonStyles, opacity: 0.5 }
                  : styles.buttonStyles
              }
              activeOpacity={0.8}
              disabled={disable}
              onPress={() => handleSubmit()}
            >
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 18,
                  color: "#fff",
                }}
              >
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  if (!poppins || !quicksand) return null;
  return (
    <SafeAreaView style={styles.mailScreen}>
      {isiPhone ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
          {mailScrenContent()}
        </KeyboardAvoidingView>
      ) : (
        mailScrenContent()
      )}
    </SafeAreaView>
  );
};

export default CreateEmail;

const styles = StyleSheet.create({
  mailScreen: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  composeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#151515",
    marginLeft: 10,
  },
  flex: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    position: "relative",
    flexGrow: 1,
  },
  inside: {
    backgroundColor: "#eee",
    height: 50,
    width: 80,
    alignItems: "center",
    zIndex: 1,
    position: "absolute",
    justifyContent: "center",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  inputText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
    color: "#6E6E6E",
  },
  input: {
    width: "100%",
    borderColor: "#B4B4B4",
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3,
    textAlignVertical: "bottom",
    paddingLeft: 90,
    paddingRight: 20,
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: "#6E6E6E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  magicIcon: {
    marginLeft: 10,
  },
  bodyInput: {
    maxWidth: "100%",
    flexGrow: 1,
    flexDirection: "column",
    textAlignVertical: "top",
    padding: 20,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  buttonStyles: {
    backgroundColor: "#0072D1",
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 20,
  },
  rewriteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#AC54E6",
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    elevation: 3,
    marginTop: 10,
    alignSelf: "flex-end",
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});
