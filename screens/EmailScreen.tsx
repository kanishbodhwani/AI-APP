import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MailComponent from "../src/components/MailComponent";
import { Entypo } from "@expo/vector-icons";
import { getSecure } from "../src/utils/secureStorage";
import { useEmailContext } from "../src/context/EmailContext";
import SearchBar from "../src/components/SearchBar";
import {
  useFonts as useFonts2,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import EmailLoadingAnimation from "../src/components/EmailLoadingAnimation";
import { isAccessTokenExpired, saveNewAccessToken } from "../src/utils/token";

const EmailScreen = ({ navigation, route }) => {
  const { user } = route.params;

  const [activeItem, setActiveItem] = useState("INBOX");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [spam, setSpam] = useState([]);

  const [inboxPage, setInboxPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [spamPage, setSpamPage] = useState(1);
  const [searchBar, setSearchBar] = useState(false);
  const [searchedMails, setSearchedMails] = useState([]);
  const [searching, setSearching] = useState(false);

  const { getMessagesWithIndex, getEmails, getLatestEmails } =
    useEmailContext();

  const [quicksand] = useFonts2({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useEffect(() => {
    if (inbox.length > 0 && sent.length > 0 && spam.length > 0) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const token = await getSecure("accessToken");
      const expired = isAccessTokenExpired(token);
      if (expired) {
        const newAccessTokenString = await saveNewAccessToken();
        setAccessToken(newAccessTokenString);
        if (user && user.email) {
          await getMails(newAccessTokenString, activeItem);
        } else {
          setLoading(false);
        }
      } else {
        setAccessToken(token);
        if (user && user.email) {
          await getMails(token, activeItem);
        } else {
          setLoading(false);
        }
      }
    })();
  }, []);

  const getNewMails = async (type) => {
    setRefresh(true);
    const expired = isAccessTokenExpired(accessToken);
    if (expired) {
      const newAccessTokenString = await saveNewAccessToken();
      setAccessToken(newAccessTokenString);
    }
    const latestMails = await getLatestEmails(
      type,
      user.email,
      accessToken.split(" ")[0]
    );
    if (type === "INBOX") {
      const newEmails = latestMails.filter(
        (mail) => !inbox.some((inboxMail) => inboxMail.id === mail.id)
      );
      setInbox([...newEmails, ...inbox]);
      setRefresh(false);
    }
    if (type === "SENT") {
      const newEmails = latestMails.filter(
        (mail) => !inbox.some((inboxMail) => inboxMail.id === mail.id)
      );
      setSent([...newEmails, ...sent]);
      setRefresh(false);
    }
    setRefresh(false);
  };

  const getMails = async (token, item) => {
    if (item === "INBOX" && inbox.length === 0) {
      await getEmails("INBOX", user.email, token.split(" ")[0], 15)
        .then((emails) => {
          setInbox(emails);
          setLoading(false);
        })
        .catch((err) => {
          alert("Error fetching emails");
          console.log("err", err);
          setLoading(false);
        });
    }
    if (item === "SENT" && sent.length === 0) {
      await getEmails("SENT", user.email, token.split(" ")[0], 15)
        .then((emails) => {
          setSent(emails);
          setLoading(false);
        })
        .catch((err) => {
          alert("Error fetching emails");
          console.log("err", err);
          setLoading(false);
        });
    }
    if (item === "SPAM" && spam.length === 0) {
      await getEmails("SPAM", user.email, token.split(" ")[0], 15)
        .then((emails) => {
          setSpam(emails);
          setLoading(false);
        })
        .catch((err) => {
          alert("Error fetching emails");
          console.log("err", err);
          setLoading(false);
        });
    }
    setLoading(false);
  };

  const handleNavigationItemPress = (item) => {
    setSearchBar(false);
    setSearching(false);
    Keyboard.dismiss();
    setLoading(true);
    setActiveItem(item);
    getMails(accessToken, item);
  };

  const arraysAreEqual = (arr1, arr2) => {
    for (let i = 0; i < arr1.length; i++) {
      if (arr2.includes(arr1[i])) {
        return true;
      }
    }
    return false;
  };

  const loadMoreMails = async (type) => {
    setFetching(true);
    if (type === "INBOX") {
      const moreEmails = await getMessagesWithIndex(
        type,
        user.email,
        accessToken.split(" ")[0],
        15
      );
      if (
        (moreEmails !== null &&
          moreEmails !== undefined &&
          moreEmails.length === 0) ||
        arraysAreEqual(spam, moreEmails)
      ) {
        setFetching(false);
        return;
      }
      setInbox([...inbox, ...moreEmails]);
      setInboxPage(inboxPage + 1);
      setFetching(false);
    }
    if (type === "SENT") {
      const moreEmails = await getMessagesWithIndex(
        type,
        user.email,
        accessToken.split(" ")[0],
        15
      );
      if (
        (moreEmails !== null &&
          moreEmails !== undefined &&
          moreEmails.length === 0) ||
        arraysAreEqual(spam, moreEmails)
      ) {
        setFetching(false);
        return;
      }
      setSent([...sent, ...moreEmails]);
      setSentPage(sentPage + 1);
      setFetching(false);
    }
    if (type === "SPAM") {
      const moreEmails = await getMessagesWithIndex(
        type,
        user.email,
        accessToken.split(" ")[0],
        15
      );
      if (
        (moreEmails !== null &&
          moreEmails !== undefined &&
          moreEmails.length === 0) ||
        arraysAreEqual(spam, moreEmails)
      ) {
        setFetching(false);
        return;
      }
      setSpam([...spam, ...moreEmails]);
      setSpamPage(spamPage + 1);
      setFetching(false);
    }
  };

  const handleSearch = async (search) => {
    if (search === "") {
      setSearchBar(false);
      return;
    }
    if(activeItem === "INBOX"){
      const searchedEmails = inbox?.filter((email) => {
        return (
          email.subject.toLowerCase().includes(search.toLowerCase()) ||
          email.emailFrom.toLowerCase().includes(search.toLowerCase())
        );
      });
      setSearchedMails(searchedEmails);
      setSearching(true);
    }
    if(activeItem === "SENT"){
      const searchedEmails = sent?.filter((email) => {
        return (
          email.subject.toLowerCase().includes(search.toLowerCase()) ||
          email.emailFrom.toLowerCase().includes(search.toLowerCase())
        );
      });
      setSearchedMails(searchedEmails);
      setSearching(true);
    }
    if(activeItem === "SPAM"){
      const searchedEmails = spam?.filter((email) => {
        return (
          email.subject.toLowerCase().includes(search.toLowerCase()) ||
          email.emailFrom.toLowerCase().includes(search.toLowerCase())
        );
      });
      setSearchedMails(searchedEmails);
      setSearching(true);
    }
  }

  return (
    <SafeAreaView style={styles.email}>
      <View style={styles.header}>
        {searchBar ? (
          <>
            <SearchBar setSearching={setSearching} setSearchedMails={setSearchedMails} setSearchBar={setSearchBar} onSearch={handleSearch} />
          </>
        ) : (
          <>
            <Text style={styles.headerText}>Emails</Text>
            <Ionicons
              onPress={() => setSearchBar(true)}
              name="search-outline"
              size={28}
              color="#2B2B2B"
            />
          </>
        )}
      </View>
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navigationItem,
            activeItem === "INBOX" && styles.activeNavigationItem,
          ]}
          onPress={() => handleNavigationItemPress("INBOX")}
        >
          <Text
            style={[
              styles.navigationText,
              activeItem === "INBOX" && styles.activeNavigationText,
            ]}
          >
            Inbox
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navigationItem,
            activeItem === "SENT" && styles.activeNavigationItem,
          ]}
          onPress={() => handleNavigationItemPress("SENT")}
        >
          <Text
            style={[
              styles.navigationText,
              activeItem === "SENT" && styles.activeNavigationText,
            ]}
          >
            Sent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navigationItem,
            activeItem === "SPAM" && styles.activeNavigationItem,
          ]}
          onPress={() => handleNavigationItemPress("SPAM")}
        >
          <Text
            style={[
              styles.navigationText,
              activeItem === "SPAM" && styles.activeNavigationText,
            ]}
          >
            Spam
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 10 }}>
        <View
          style={
            loading
              ? {
                  height: "92.8%",
                  alignItems: "center",
                  justifyContent: "center",
                }
              : { height: "92.8%" }
          }
        >
          {loading ? (
            <EmailLoadingAnimation />
          ) : activeItem === "INBOX" ? (
            <FlatList
              data={searching ? searchedMails?.sort((a, b) => b.sentTime - a.sentTime) : inbox?.sort((a, b) => b.sentTime - a.sentTime)}
              scrollsToTop={true}
              onScroll={() => {
                Keyboard.dismiss();
              }}
              refreshing={refresh}
              onRefresh={() => ("INBOX")}
              onEndReached={() => searching ? null :(!fetching ? loadMoreMails("INBOX") : null)}
              ListFooterComponent={
                fetching ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  <Text
                    style={{
                      fontFamily: "Quicksand_400Regular",
                      fontStyle: "italic",
                      color: "#9A9A9A",
                      alignSelf: "center",
                    }}
                  >
                    {" "}
                    No more emails to load{" "}
                  </Text>
                )
              }
              renderItem={({ item }) => (
                <MailComponent
                  navigation={navigation}
                  from={item.emailFrom}
                  subject={item.subject}
                  body={item.body}
                  time={item.sentTime}
                  id={item.id}
                  inbox={true}
                  attachments={item.attachments}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          ) : activeItem === "SENT" ? (
            <FlatList
              data={searching ? searchedMails?.sort((a, b) => b.sentTime - a.sentTime) : sent?.sort((a, b) => b.sentTime - a.sentTime)}
              scrollsToTop={true}
              onScroll={() => {
                Keyboard.dismiss();
              }}
              refreshing={refresh}
              onRefresh={() => getNewMails("SENT")}
              onEndReached={() => searching ? null :(!fetching ? loadMoreMails("SENT") : null)}
              ListFooterComponent={
                fetching ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  <Text
                    style={{
                      fontFamily: "Quicksand_400Regular",
                      fontStyle: "italic",
                      color: "#9A9A9A",
                      alignSelf: "center",
                    }}
                  >
                    {" "}
                    No more emails to load{" "}
                  </Text>
                )
              }
              renderItem={({ item }) => (
                <MailComponent
                  navigation={navigation}
                  from={item.emailFrom}
                  subject={item.subject}
                  body={item.body}
                  id={item.id}
                  time={item.sentTime}
                  attachments={item.attachments}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          ) : activeItem === "SPAM" ? (
            <FlatList
              data={searching ? searchedMails?.sort((a, b) => b.sentTime - a.sentTime) : spam?.sort((a, b) => b.sentTime - a.sentTime)}
              scrollsToTop={true}
              onScroll={() => {
                Keyboard.dismiss();
              }}
              onEndReached={() => searching ? null :(!fetching ? loadMoreMails("SPAM") : null)}
              ListFooterComponent={
                fetching ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                  <Text
                    style={{
                      fontFamily: "Quicksand_400Regular",
                      fontStyle: "italic",
                      color: "#9A9A9A",
                      alignSelf: "center",
                    }}
                  >
                    {" "}
                    No more emails to load{" "}
                  </Text>
                )
              }
              renderItem={({ item }) => (
                <MailComponent
                  navigation={navigation}
                  from={item.emailFrom}
                  subject={item.subject}
                  body={item.body}
                  id={item.id}
                  time={item.sentTime}
                  attachments={item.attachments}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CreateEmail")}
        activeOpacity={0.9}
      >
        <Entypo name="pencil" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EmailScreen;

const styles = StyleSheet.create({
  email: {
    padding: 20,
    backgroundColor: "#fff",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#2B2B2B",
  },
  navigation: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  navigationText: {
    fontSize: 18,
    fontFamily: "Quicksand_700Bold",
    color: "#B9B9B9",
  },
  navigationItem: {},
  activeNavigationText: {
    color: "#2B2B2B",
  },
  addButton: {
    position: "absolute",
    bottom: 47,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#1D6FEB",
    alignItems: "center",
    justifyContent: "center",
  },
  activeNavigationItem: {},
});
