import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getUserByUsername,
} from "../src/services/firebase";
import { useGoalContext } from "../src/context/GoalContext";
import { useChatInstanceContext } from "../src/context/ChatInstanceContext";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useProfileContext } from "../src/context/ProfileContext";

const ProfileScreen = ({ route, user: u, handleSignOut }) => {
  const [user, setUser] = useState(null);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [activeBots, setActiveBots] = useState([]);
  const { goals } = useGoalContext();
  const { chatInstances } = useChatInstanceContext();
  const {profilePicUrl, getUserProfilePic, uploadProfilePicture} = useProfileContext();
  const [imageLoading, setImageLoading] = useState(false);

  const handleLogout = async () => {
    await handleSignOut();
  };

  useEffect(() => {
    (async () => {
      await getUser();
    })();

    const completed = goals.filter((goal) => goal.progress === 100);
    setCompletedGoals(completed);

    const active = chatInstances.filter(
      (chatInstance) => chatInstance.createdAt === chatInstance.updatedAt
    );
    setActiveBots(active);
  }, []);

  const getUser = async () => {
    setImageLoading(true);
    const user = await getUserByUsername(u.email);
    setUser(user);
    const profilePicture = await getUserProfilePic(user.userId);
    if(profilePicture) {
      setImageLoading(false);
    } else {
      setImageLoading(false);
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });
    if (!result.canceled) {
      const imageUri = result.assets[0];
      setImageLoading(true);
      await uploadProfilePicture(user.userId, imageUri);
      setImageLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.center}>
          <View style={{ position: "relative" , width: 100, height: 100}}>
            {!imageLoading && (!profilePicUrl ? (
              <Image
                source={require("../assets/images/userpic.png")}
                style={{ width: "100%", height: "100%", borderRadius: 50, zIndex: 0 }}
              />
            ) : (
              <Image
                source={{ uri: profilePicUrl }}
                style={{ width: "100%", height: "100%", borderRadius: 50, zIndex: 0 }}
              />
            ))}
            <LinearGradient
              colors={profilePicUrl ? ["rgba(0,0,0,0)", "rgba(0,0,0,.2)"] :["rgba(0,0,0,0)", "rgba(0,0,0,.7)"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                borderRadius: 50,
                zIndex: 1,
              }}
            >
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: 50,
                  zIndex: 2,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {imageLoading ? <ActivityIndicator 
                    size="small" 
                    color="#eee
                  "/> 
                  :<Ionicons name="camera-outline" size={24} color="#eee" />}
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Quicksand_700Bold",
              marginTop: 10,
              color: "#4F4F4F",
            }}
          >
            {user?.fullname}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Quicksand_400Regular",
              marginTop: 5,
              color: "#4F4F4F",
            }}
          >
            {user?.email}
          </Text>
        </View>
        <View
          style={{
            width: "100%",
            alignItems: "flex-start",
            flex: 1,
            marginTop: 20,
          }}
        >
          <View style={styles.smallContainer}>
            <View style={styles.analytics}>
              <Text style={styles.analyticsText}>Goals</Text>
              {/* <FontAwesome name="angle-right" size={24} color="black" /> */}
            </View>
            <View style={styles.goalContainer}>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 20,
                  color: "#fff",
                }}
              >
                {" "}
                Completed{" "}
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 20,
                  color: "#fff",
                }}
              >
                {" "}
                {completedGoals.length}/{goals.length}
              </Text>
            </View>
          </View>
          <View style={styles.smallContainer}>
            <View style={styles.analytics}>
              <Text style={styles.analyticsText}>Bots</Text>
              {/* <FontAwesome name="angle-right" size={24} color="black" /> */}
            </View>
            <View style={styles.botContainer}>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 20,
                  color: "#fff",
                }}
              >
                {" "}
                Interacted Bots{" "}
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins_600SemiBold",
                  fontSize: 20,
                  color: "#fff",
                }}
              >
                {" "}
                {activeBots.length}/{chatInstances.length}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 10, width: "100%", alignItems: "center" }}>
          <TouchableOpacity onPress={handleLogout} style={styles.logout}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_600SemiBold",
                marginTop: 5,
                color: "#fff",
              }}
            >
              Logout
            </Text>
            <AntDesign name="logout" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_500Medium",
                marginTop: 10,
                color: "#4F4F4F",
              }}
            >
              Sign in with another account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  profile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
  },
  growth: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginTop: 20,
    backgroundColor: "#F2F2F2",
    padding: 20,
    borderRadius: 10,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  smallContainer: {
    flexDirection: "column",
    width: "100%",
    marginTop: 10,
  },
  analytics: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  analyticsText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#151515",
  },
  botContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#5F47D0",
    marginTop: 5,
  },
  goalContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3A68A1",
    marginTop: 5,
  },
  logout: {
    width: "100%",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3B3B3B",
  },
});
