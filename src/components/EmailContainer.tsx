import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

interface EmailContainerProps {
  spam?: number;
  unanswered?: number;
  unread?: number;
  navigation?: any;
}

const EmailContainer = ({
  spam,
  unanswered,
  unread,
  navigation,
}: EmailContainerProps) => {
  const [unansweredEmails, setUnansweredEmails] = useState(false);
  useEffect(() => {
    if (unanswered || unanswered === 0) {
      setUnansweredEmails(true);
    } else {
      setUnansweredEmails(false);
    }
  }, [unanswered]);

  const getAttention = () => {
    if (unansweredEmails) {
      return unanswered > 5 ? "" : "No";
    } else {
      return unread > 5 ? "" : "No";
    }
  };

  const getSpamAttention = () => {
    return spam > 5 ? "" : "No";
  };

  const getIcon = () => {
    if (unansweredEmails) {
      return unanswered > 5 ? true : false;
    } else {
      return unread > 5 ? true : false;
    }
  };

  const getSpamIcon = () => {
    return spam > 5 ? true : false;
  };

  const renderEmailContainer = () => {
    if (spam) {
      return (
        <View style={styles.emailContainer}>
          <View style={styles.emailHeader}>
            <MaterialCommunityIcons
              name="email-fast-outline"
              size={28}
              color="#eee"
            />
            <Text style={{ ...styles.inboxText, color: "#DC7154" }}>Spam</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.emailAnalytics}>
              <Text style={styles.analyticsNummbers}>All time</Text>
              <Text style={styles.analyticsNummbers}>
                <Text style={styles.varyNumber}>
                  {spam > 50 ? "50+" : spam}
                </Text>{" "}
                Total mails
              </Text>
              <Text style={styles.analyticsNummbers}>
                {getSpamAttention()} Attention Required
              </Text>
            </View>
            {getSpamIcon() ? (
              <Ionicons name="triangle" size={24} color="#DC7154" />
            ) : (
              <Ionicons name="triangle" size={24} color="#54DA87" />
            )}
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.emailContainer}>
          <View style={styles.emailHeader}>
            <MaterialCommunityIcons
              name="email-fast-outline"
              size={28}
              color="#eee"
            />
            <Text style={styles.inboxText}>Inbox</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.emailAnalytics}>
              <Text style={styles.analyticsNummbers}>Today</Text>
              <Text style={styles.analyticsNummbers}>
                <Text style={styles.varyNumber}>
                  {unansweredEmails ? unanswered : unread}
                </Text>{" "}
                {unansweredEmails ? "Unanswered" : "Unread"}
              </Text>
              <Text style={styles.analyticsNummbers}>
                {getAttention()} Attention Required
              </Text>
            </View>
            {getIcon() ? (
              <Ionicons name="triangle" size={24} color="#DC7154" />
            ) : (
              <Ionicons name="triangle" size={24} color="#54DA87" />
            )}
          </View>
        </View>
      );
    }
  };

  return (
      <TouchableOpacity
        activeOpacity={0.8}
        delayPressIn={0}
        onPress={() => navigation.navigate("Email")}
      >
        {renderEmailContainer()}
      </TouchableOpacity>
  );
};

export default EmailContainer;

const styles = StyleSheet.create({
  emailContainer: {
    backgroundColor: "#2B2B2B",
    width: 250,
    borderRadius: 30,
    padding: 20,
    marginTop: 10,
    marginLeft: 10,
  },
  emailHeader: {
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  emailAnalytics: {
    flexDirection: "column",
  },
  inboxText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 18,
    color: "#eee",
    marginLeft: 10,
  },
  analyticsNummbers: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: "#eee",
  },
  varyNumber: {
    color: "#54DA87",
  },
});
