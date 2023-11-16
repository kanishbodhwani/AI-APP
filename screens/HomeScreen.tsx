import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_500Medium_Italic,
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
import { FontAwesome } from "@expo/vector-icons";
import EmailContainer from "../src/components/EmailContainer";
import { useGoalContext } from "../src/context/GoalContext";
import TaskContainer from "../src/components/TaskContainer";
import { useEffect, useState } from "react";
import { getRandomQuote } from "../src/services/quotes";
import { useChatInstanceContext } from "../src/context/ChatInstanceContext";
import { useEmailContext } from "../src/context/EmailContext";
import { getSecure } from "../src/utils/secureStorage";
import Loader from "../src/components/Loader";
import { isAccessTokenExpired, saveNewAccessToken } from "../src/utils/token";
import { useProfileContext } from "../src/context/ProfileContext";
import { LinearGradient } from "expo-linear-gradient";

const HomeScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const { getGoals } = useGoalContext();
  const { getChatInstances } = useChatInstanceContext();
  const { getUnasnweredEmails, getUnreadEmails, getEmails } = useEmailContext();
  const { profilePicUrl, getUserProfilePic } = useProfileContext();
  const [unreadEmails, setUnreadEmails] = useState(0);
  const [unansweredEmails, setUnansweredEmails] = useState(0);
  const [spams, setSpams] = useState(0);
  const [quote, setQuote] = useState({ q: "", by: "" });
  const [goals, setGoals] = useState([]);
  const [chatInstances, setChatInstances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = await getSecure("accessToken");
      const expired = isAccessTokenExpired(token);
      if (expired) {
        const newAccessTokenString = await saveNewAccessToken();
        await getAllData(newAccessTokenString);
      } else {
        await getAllData(token);
      }
      setLoading(false);
    })();
  }, []);

  const getAllData = async (token) => {
    const promise = Promise.allSettled([
      getGoals(user.uid),
      getChatInstances(user.uid),
      getRandomQuote(),
      getUnasnweredEmails("INBOX", user.email, token.split(" ")[0]),
      getUnreadEmails("INBOX", user.email, token.split(" ")[0]),
      getEmails("SPAM", user.email, token.split(" ")[0], 10),
      getUserProfilePic(user.uid),
    ]);

    const [
      goals,
      chatInstances,
      quote,
      unansweredMails,
      unreadMails,
      spams,
      photo,
    ] = await promise;
    if (goals.status === "fulfilled") {
      setGoals(goals.value);
    }
    if (chatInstances.status === "fulfilled") {
      setChatInstances(chatInstances.value);
    }
    if (quote.status === "fulfilled") {
      setQuote({ q: quote.value.quote, by: quote.value.author });
    }
    if (unansweredMails.status === "fulfilled") {
      setUnansweredEmails(unansweredMails.value);
    }
    if (unreadMails.status === "fulfilled") {
      setUnreadEmails(unreadMails.value);
    }
    if (spams.status === "fulfilled") {
      setSpams(spams.value.length);
    }
    if (photo.status === "fulfilled") {
    }
  };

  const greet = () => {
    const date = new Date();
    const hour = date.getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const [poppins] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_500Medium_Italic,
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
  if (loading) return <Loader />;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "column" }}>
          <Text style={styles.headerText}>{greet()}</Text>
          <Text style={styles.headerText}>{user?.email?.split("@")[0]}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Profile")}
        >
          {profilePicUrl ? (
            <Image
              source={{ uri: profilePicUrl }}
              style={{ width: 40, height: 40, borderRadius: 50 }}
            />
          ) : (
            <Image
              source={require("../assets/images/userpic.png")}
              style={{ width: 40, height: 40, borderRadius: 50 }}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.mainContent}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          horizontal={false}
        >
          <View style={styles.quote}>
            <Text style={styles.quoteText}>{quote.q}</Text>
            <Text style={styles.quoteBy}>~{quote.by}</Text>
          </View>
          <View style={styles.smallContainer}>
            <View style={styles.analytics}>
              <Text style={styles.analyticsText}>Email Analytics</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Email")} activeOpacity={0.8}>
                <FontAwesome
                  name="angle-right"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.scrollerContainer}>
              <ScrollView
                showsHorizontalScrollIndicator={false}
                horizontal={true}
              >
                <EmailContainer
                  navigation={navigation}
                  unanswered={unansweredEmails}
                  unread={null}
                />
                <EmailContainer
                  navigation={navigation}
                  unread={unreadEmails}
                  unanswered={null}
                />
                <EmailContainer navigation={navigation} spam={spams} />
              </ScrollView>
            </View>
          </View>
          <View style={styles.smallContainer}>
            <View style={styles.analytics}>
              <Text style={styles.analyticsText}>Bots</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Chat")} activeOpacity={0.8}>
                <FontAwesome
                  name="angle-right"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.scrollerContainer}>
              {chatInstances && chatInstances.length > 0 ? (
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                >
                  {chatInstances.map((chatInstance) => (
                    <TaskContainer
                      navigation={navigation}
                      key={chatInstance.id}
                      bot={chatInstance}
                    />
                  ))}
                </ScrollView>
              ) : (
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate("Chat")} style={{ position: "relative", marginLeft: 15, width: '100%', marginTop: 10}}>
                  <Image
                    source={require("../assets/images/bots.jpg")}
                    style={{
                      width: "90%",
                      height: 130,
                      borderRadius: 10,
                    }}
                  />
                  <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 10,
                      width: "90%",
                      height: 130,
                    }}
                  />
                  <View style={{width: '90%', position: "absolute", height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#fff",
                        fontFamily: "Poppins_600SemiBold",
                        zIndex: 10,
                      }}
                    >
                      Add your first bot
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.smallContainer}>
            <View style={styles.analytics}>
              <Text style={styles.analyticsText}>Goals</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Goals")} activeOpacity={0.8}>
                <FontAwesome
                  name="angle-right"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.scrollerContainer}>
                {goals && goals.length > 0 ? (
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                >
                  {goals.map((goal) => (
                    <TaskContainer
                      navigation={navigation}
                      key={goal.id}
                      goal={goal}
                    />
                  ))}
                </ScrollView>
              ) : (
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate("Goals")} style={{ position: "relative", marginLeft: 15, width: '100%', marginTop: 10}}>
                    <Image
                    source={require("../assets/images/goals.jpg")}
                    style={{
                      width: "90%",
                      height: 130,
                      borderRadius: 10,
                    }}
                  />
                  <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 10,
                      width: "90%",
                      height: 130,
                    }}
                  />
                  <View style={{width: '90%', position: "absolute", height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#fff",
                        fontFamily: "Poppins_600SemiBold",
                        zIndex: 10,
                      }}
                    >
                      Add your first goal
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{height: 30}}/>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#151515",
  },
  mainContent: {
    flexDirection: "column",
    flex: 1,
  },
  quote: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  quoteText: {
    fontFamily: "Poppins_500Medium_Italic",
    fontStyle: "italic",
    fontSize: 17,
    color: "#151515",
  },
  quoteBy: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: "#151515",
    alignSelf: "flex-end",
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
  scrollerContainer: {
    width: "100%",
    paddingLeft: 20,
  },
});

export default HomeScreen;
