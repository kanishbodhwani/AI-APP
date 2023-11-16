import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import StyledButton from "../src/components/StyledButton";
import { AntDesign } from "@expo/vector-icons";
import {
  useFonts,
  Raleway_300Light,
  Raleway_700Bold,
  Raleway_400Regular,
  Raleway_800ExtraBold,
  Raleway_500Medium,
} from "@expo-google-fonts/raleway";
import Loader from "../src/components/Loader";
import { addDoc, collection, setDoc } from "firebase/firestore";
import { signUpWithEmail } from "../src/services/firebase";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth, db, provider } from "../firebase";
import { User } from "../src/types/User";
import { storeData } from "../src/utils/asyncStorage";
import { saveSecure } from "../src/utils/secureStorage"
import { signInWithPopup } from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  Home: undefined;
  user: User;
};

type SignupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Home"
>;

type SignupScreenProps = {
  navigation: SignupScreenNavigationProp;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
    setImage(null);
  });
  const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
    setImage(require("../assets/images/signup.jpg"));
  });
  const [fontsLoaded] = useFonts({
    Raleway_300Light,
    Raleway_700Bold,
    Raleway_800ExtraBold,
    Raleway_400Regular,
    Raleway_500Medium,
  });

  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState(require("../assets/images/signup.jpg"));

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
        const { authentication} = response;
        if(authentication.refreshToken && authentication.accessToken) {
          await saveSecure("refreshToken", authentication.refreshToken);
          const expiresIn = new Date().getTime() + (authentication.expiresIn * 1000);
          const accessToken = `${authentication.accessToken} ${expiresIn}`
          await saveSecure("accessToken", accessToken);
          handleSignup();
        }
      }
    })();
  }, [response]);

  const handleSignup = async () => {
    setLoading(true);
    const res = await signUpWithEmail(username, password);
    if (res) {
      const user = {
        fullname: name,
        username: username,
        dateCreated: new Date(),
        userId: res.uid,
        email: res.email,
        profilePhotoUrl: "",
      };

      addDoc(collection(db, "users"), user)
        .then(async (userRef) => {
          if (userRef) {
            await storeData("@user", user);
            setLoading(false);
          } else {
            setLoading(false);
            alert("There was an error signing up. Please try again.");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setLoading(false);
      alert("There was an error signing up. Please try again.");
    }
  };

  if (!fontsLoaded || loading) {
    return <Loader />;
  } else
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
            <Text style={styles.signInText}>Sign up</Text>
          </View>
          <Image style={image ? styles.image : null} source={image} />
          <View style={image ? styles.trs : styles.loginForm}>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={name}
              onChangeText={setName}
            />
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
          </View>
          <View style={styles.loginButton}>
            <StyledButton
              title="Sign in"
              onPress={() => promptAsync()}
              buttonStyles={styles.buttonStyles}
              buttonTextStyles={styles.buttonTextStyles}
            />
          </View>
        </View>
      </SafeAreaView>
    );
};

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
    justifyContent: "space-evenly",
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
  trs: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    marginTop: 40,
    width: "100%",
    transform: [{ translateY: -80 }],
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
    height: "60%",
  },
});

export default SignupScreen;
