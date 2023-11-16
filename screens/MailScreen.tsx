import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import UserIcon from "../src/components/UserIcon";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts as useFonts2,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import * as MediaLibrary from "expo-media-library";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useEffect, useState } from "react";
import { getSecure } from "../src/utils/secureStorage";
import { markEmailAsRead } from "../src/services/gmailService";
import { isAccessTokenExpired, saveNewAccessToken } from "../src/utils/token";
import * as Sharing from "expo-sharing";


const isiPhone = Platform.OS === "ios";

interface MailScreenProps {
  navigation: any;
  route: any;
}

const MailScreen = ({ route, navigation }: MailScreenProps) => {
  const {
    emailFrom,
    subject,
    body,
    sentTime,
    id,
    user,
    inbox,
    bodyHTML,
    isHTML,
    attachments,
  } = route.params;
  const [htmlBody, setHtmlBody] = useState(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleReply = () => {
    navigation.navigate("CreateEmail", {
      emailFrom: emailFrom?.split("<")[1].slice(0, -1),
      subject: "Re:" + subject,
      body: body,
      sender: emailFrom?.split("<")[0],
    });
  };

  const handleForward = () => {};

  useEffect(() => {
    (async () => {
      if (!inbox) return;
      const accessToken = await getSecure("accessToken");
      if (accessToken) {
        const expired = isAccessTokenExpired(accessToken);
        if (expired) {
          const newAccessTokenString = await saveNewAccessToken();
          const token = newAccessTokenString.split(" ")[0];
          await markEmailAsRead(user.email, id, token);
        } else {
          const token = accessToken.split(" ")[0];
          await markEmailAsRead(user.email, id, token);
        }
      }
    })();

    if (bodyHTML !== "") {
      setHtmlBody(bodyHTML);
    } else if (!isHTML) {
      const b = `<div style="width: 100%; padding: 10px; margin: 0;">
          <pre style="width: 100%; white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif; font-size: 40px; user-scalable: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; margin: 0;">${body.trim()}</pre>
        </div>`;
      setHtmlBody(b);
    }
  }, []);

  const openAttachment = async (attachments) => {
    for (let i = 0; i < attachments.length; i++) {
      const { uri, name } = attachments[i];
      const permissionResponse = await MediaLibrary.requestPermissionsAsync();
      if (permissionResponse.granted === false) {
        alert("Permission to save file is required");
        return;
      }
      const fileExtension = uri.split(".").pop();
      if (
        fileExtension === "jpg" ||
        fileExtension === "png" ||
        fileExtension === "jpeg" ||
        fileExtension === "gif" ||
        fileExtension === "bmp" ||
        fileExtension === "webp" ||
        fileExtension === "tiff"
      ) {
        await saveToGallery(uri);
      } else {
        try {
          await Sharing.shareAsync(uri, {
            mimeType: "application/octet-stream",
            dialogTitle: name,
            UTI: "public.data",
          });
        } catch (e) {
          alert("Error sharing file");
          console.log(e);
        }
      }
    }
    alert("File Saved!");
  };

  const saveToGallery = async (uri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync("Download");
      if (album == null) {
        await MediaLibrary.createAlbumAsync("Download", asset, false);
        setIsDownloaded(true);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        setIsDownloaded(true);
      }
    } catch (e) {
      alert("Error saving file");
      console.log(e);
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

  if (!poppins || !quicksand) return null;
  return (
    <SafeAreaView style={styles.mailScreen}>
      <View style={styles.header}>
        <Ionicons
          onPress={() => navigation.goBack()}
          name="arrow-back"
          size={28}
          color="black"
        />
        <View style={{ flexDirection: "row" }}>
          {/* <MaterialIcons name="delete-sweep" size={24} color="black" /> */}
          <MaterialIcons
            style={{ marginRight: 10 }}
            name="delete-outline"
            size={29}
            color="black"
          />
          <AntDesign name="staro" size={26} color="black" />
          {/* <AntDesign name="star" size={24} color="black" /> */}
        </View>
      </View>
      <Text style={styles.subject}>{subject}</Text>
      <View style={styles.senderDetails}>
        <View style={{ flexDirection: "row" }}>
          <UserIcon
            borderRadius={10}
            width={50}
            height={50}
            image={false}
            letter={emailFrom.charAt(0)}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.sender}>{emailFrom?.split("<")[0]}</Text>
            <Text style={styles.emailAddress}>
              {emailFrom?.split("<")[1]?.slice(0, -1)}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{sentTime?.split("T")[0]}</Text>
      </View>
      <View style={styles.messageContainer}>
        {attachments.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              position: "absolute",
              padding: 15,
              backgroundColor: "#eee",
              borderRadius: 50,
              zIndex: 10,
              bottom: 20,
              right: 0,
            }}
            onPress={() => openAttachment(attachments)}
          >
            <Ionicons
              name="ios-document-attach-outline"
              size={28}
              color="black"
            />
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: !isDownloaded ? "#D8284D" : "#5C5C5C",
                  borderRadius: 50,
                  overflow: "hidden",
                  right: -15,
                  bottom: -18
                }}
              >
                <Text
                  style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "#fff",
                    borderRadius: 50,
                    paddingLeft: 5,
                    paddingRight: 5,
                    zIndex: 10,
                    left: 1,
                    top: isiPhone ? 1: -0.5
                  }}
                >
                  {attachments?.length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        <WebView
          originWhitelist={["*"]}
          source={{
            html: `
                <style> 
                  body {
                    font-family: Arial, sans-serif;
                    font-size: 40px;
                    user-select: none;
                    margin: 0;
                  }
                </style>
              ${htmlBody !== null ? htmlBody : body}
            `,
          }}
        />
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleReply()}
          style={styles.replyButtonStyles}
        >
          <MaterialCommunityIcons
            style={{ marginRight: 10 }}
            name="arrow-u-left-top"
            size={24}
            color="#fff"
          />
          <Text style={styles.replyButtonTextStyles}>Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.forwardButtonStyles}
        >
          <MaterialCommunityIcons
            style={{ marginRight: 10 }}
            name="arrow-u-right-top"
            size={24}
            color="#fff"
          />
          <Text style={styles.forwardButtonTextStyles}>Forward</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MailScreen;

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
  subject: {
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
    marginTop: 20,
  },
  senderDetails: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sender: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  emailAddress: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  date: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  messageContainer: {
    marginTop: 20,
    flex: 0.9,
    position: "relative",
  },
  message: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  actionButtons: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    alignSelf: "center",
  },
  replyButtonStyles: {
    width: "50%",
    backgroundColor: "#1D6FEB",
    borderColor: "#fff",
    flexDirection: "row",
    height: 70,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 20,
  },
  replyButtonTextStyles: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
  },
  forwardButtonStyles: {
    width: "50%",
    height: 70,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    marginTop: 20,
  },
  forwardButtonTextStyles: {
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
  },
});
