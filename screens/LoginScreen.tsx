import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Raleway_300Light,
  Raleway_700Bold,
  Raleway_400Regular,
  Raleway_800ExtraBold,
  Raleway_500Medium,
} from "@expo-google-fonts/raleway";
import StyledButton from "../src/components/StyledButton";
import { AntDesign } from "@expo/vector-icons";
import Loader from "../src/components/Loader";
import { Image } from "expo-image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { storeData } from "../src/utils/asyncStorage";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { saveSecure } from "../src/utils/secureStorage";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

// const SERVER_BASE_URL = "http://10.0.2.2:3000";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/gmail.modify'],
    extraParams: {
      'access_type': 'offline',
      prompt: 'consent',
    },
    clientSecret: "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",  
    responseType: "code",
    usePKCE: true,
    codeChallenge: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",
    expoClientId:
      "973384691133-1kb68sbmsuhev2q77ldm4ovk3r652gph.apps.googleusercontent.com",
    iosClientId:
      "973384691133-bupje4dvvef4nm0qd8ss8h3al26m3i85.apps.googleusercontent.com",
    androidClientId:
      "973384691133-36avb21fsgkbbse2s6el5aid45ihdjg1.apps.googleusercontent.com",
  });

  useEffect(() => {
    (async () => {
      if (response?.type === "success") {
        const { authentication } = response;
        console.log("response", response);
        if(authentication.refreshToken && authentication.accessToken) {
          await saveSecure("refreshToken", authentication.refreshToken);
          const expiresIn = new Date().getTime() + (authentication.expiresIn * 1000);
          const accessToken = `${authentication.accessToken} ${expiresIn}`
          await saveSecure("accessToken", accessToken);
          handleLogin();
        }
      }
    })();
  }, [response]);

  const handleLogin = () => {
    setLoading(true);
    if (username && password) {
      signInWithEmailAndPassword(auth, username, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          if (user) {
            await storeData("@user", user);
            navigation.navigate("TabNavigator");
            setLoading(false);
          }
        })
        .catch((error) => {
          const errorMessage = error.message;
          alert(errorMessage);
          setLoading(false);
        });
    } else {
      alert("Please fill in all fields");
    }
  };


  const [fontsLoaded] = useFonts({
    Raleway_300Light,
    Raleway_700Bold,
    Raleway_800ExtraBold,
    Raleway_400Regular,
    Raleway_500Medium,
  });

  if (!fontsLoaded || loading) {
    return <Loader />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <AntDesign
        onPress={() => navigation.goBack()}
        name="back"
        size={30}
        color="black"
      />
      <View style={styles.loginScreen}>
        <View style={styles.loginText}>
          <Text style={styles.signInText}>Lets sign you in.</Text>
          <Text style={styles.raleway}>Welcome Back.</Text>
          <Text style={styles.raleway}>You've been missed!</Text>
        </View>
        <View style={styles.loginForm}>
          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <Image
            style={styles.image}
            source={require("../assets/images/login.jpg")}
            priority="high"
          />
        </View>
        <View style={styles.loginButton}>
          <StyledButton
            title="Sign in"
            onPress={() => {
              if(!username || !password) {
                alert("Please fill in all fields");
                return;
              }
              promptAsync();
            }}
            buttonStyles={styles.buttonStyles}
            buttonTextStyles={styles.buttonTextStyles}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
  },
  loginScreen: {
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    padding: 10,
    marginTop: 10,
  },
  loginButton: {},
  loginText: {},
  signInText: {
    fontFamily: "Raleway_800ExtraBold",
    fontSize: 35,
  },
  raleway: {
    fontFamily: "Raleway_300Light",
    fontSize: 35,
  },
  loginForm: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    marginTop: 40,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    marginTop: 12,
    borderRadius: 8,
    fontFamily: "Raleway_400Regular",
    fontSize: 16,
  },
  buttonStyles: {
    backgroundColor: "#19171E",
    borderRadius: 10,
    width: "100%",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderColor: "none",
    borderWidth: 0,
    marginTop: 10,
  },
  buttonTextStyles: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Raleway_500Medium",
  },
  image: {
    width: "100%",
    height: "90%",
  },
});
