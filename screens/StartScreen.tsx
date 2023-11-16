import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Raleway_300Light,
  Raleway_600SemiBold,
  Raleway_700Bold,
  Raleway_500Medium,
} from "@expo-google-fonts/raleway";
import {
  useFonts as useFonts2,
  Quicksand_400Regular,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import {
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import Loader from "../src/components/Loader";
import { Feather } from "@expo/vector-icons";
import { Link } from '@react-navigation/native';
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

const StartScreen = ({ navigation }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "661711631626-q2rjlp98av7i860j52p3ja65oie4q2nh.apps.googleusercontent.com",
    iosClientId:
      "661711631626-ibav6o1ef0eh459182me21h23r6545s2.apps.googleusercontent.com",
    androidClientId:
      "661711631626-t3is7p70ai9tn1jc3n0fidc4u2th9rut.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      setAccessToken(response.authentication.accessToken);
      if (accessToken) {
        fetchUserInfo();
      }
    }
  }, [response, accessToken]);

  const fetchUserInfo = async () => {
    let response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let userInfo = await response.json();
    if (userInfo) {
      navigation.navigate("UserInfo", { userInfoEmail: userInfo.email });
    }
  };


  const [raleway] = useFonts({
    Raleway_300Light,
    Raleway_600SemiBold,
    Raleway_700Bold,
    Raleway_500Medium,
  });

  const [quicksand] = useFonts2({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const [poppins] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!raleway || !quicksand || !poppins) {
    return <Loader />;
  }
  
  return (
    <>
      <StatusBar style="light" backgroundColor="rgba(42, 42, 42, 1)" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.headingText}> AI App </Text>
        <Image style={{width: "120%", height: "50%", marginTop: 20}} source={require("../assets/images/aibg.jpg")} alt="AI" />
        <View style={styles.heading}>
          <Text style={styles.tagLineText}>Empowering <Text style={{color: "#563A81"}}>Business</Text> Communication and Growth </Text>
          <View style={styles.button}>
            <TouchableOpacity
              delayPressIn={0}
              activeOpacity={0.9}
              style={styles.button_login}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.button_login_text}>Get Started</Text>
              <Feather name="arrow-right-circle" size={24} color="white" />
            </TouchableOpacity>  
            <Text style={styles.loginText}> Already have an account? 
              <Link style={{color: "#563A81"}} to={{screen: "Login"}}>
              {" "}Sign in
              </Link> 
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: 'center',
    padding: 20
  },
  background: {
    height: "100%",
    position: "relative",
  },
  overlayView: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#rgba(0,0,0, 0.3)",
    zIndex: 0,
  },
  heading: {  
    marginTop: 20,
    flexDirection: "column",
    justifyContent: "space-between",
    height: "35%",
  },
  headingText: {
    fontFamily: "Raleway_700Bold",
    fontSize: 40,
    color: "rgb(42, 42, 42)",
  },
  tagLineText: {
    textAlign: "left",
    fontFamily: "Raleway_700Bold",
    fontSize: 30,
    color: "rgb(42, 42, 42)",
  },
  button_login: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#151515",
    height: 60,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  button_login_text: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#fff",
  },
  loginText: {
    fontFamily: "Raleway_600SemiBold",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10
  },
  button: {}
});
