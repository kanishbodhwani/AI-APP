import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import UserIcon from "./UserIcon";
import * as SCREENS from "../constants/routes";

const MailComponent = ({ navigation, from, subject, body, time, id = '', inbox = false , attachments}) => {
  let isHTML = false;
  let textOnlyBody = '';
  let paragraphText = '';
  let bodyHTML = '';
  const b = body.split("HTML:START")[0];
  if(b !== body) {
    bodyHTML = body.split("HTML:START")[1]?.trim();
    textOnlyBody = b.replace(/<[^>]+>/g, "");
    isHTML = true;
    makeParagraphText(bodyHTML);
  } else {
    isHTML = /<\/?[a-z][\s\S]*>/i.test(body);
    textOnlyBody = body.replace(/<[^>]+>/g, "");
    makeParagraphText(body);
  }
  
  function makeParagraphText(b) {
    if (isHTML) {
      const firstParagraphMatch = b.match(/<p\b[^>]*>(.*?)<\/p>/i);
      if (firstParagraphMatch) {
        const firstParagraph = firstParagraphMatch[1];
        const cleanedParagraph = firstParagraph.replace(/[\r\n]+/g, "");
        const words = cleanedParagraph.split(/\s+/);
        paragraphText = words.slice(0, 20).join(" ");
      }
    } else {
      const cleanedTextOnlyBody = textOnlyBody.replace(/[\r\n]+/g, "");
      const words = cleanedTextOnlyBody.split(/\s+/);
      paragraphText = words.slice(0, 10).join(" ");
    }
  }

  const subjectText = subject.replace(/[\r\n]+/g, "");

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(SCREENS.SCREENS.MAIL, {
          emailFrom: from,
          subject,
          body: body,
          bodyHTML,
          isHTML,
          sentTime: time,
          id,
          inbox,
          attachments
        })
      }
      style={styles.mailComponent}
    >
      <UserIcon image={false} borderRadius={10} letter={from.charAt(0)} />
      <View style={styles.mailContainer}>
        <View style={styles.mail}>
          <View style={{ marginTop: -10, width: "60%" }}>
            <Text style={styles.from}>{from?.split("<")[0]}</Text>
            <Text style={styles.subject} numberOfLines={1}>
              {subjectText}
            </Text>
          </View>
          <Text style={styles.date}>{time?.split("T")[0]}</Text>
        </View>
        <Text style={styles.mailBody} numberOfLines={2}>{paragraphText}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MailComponent;

const styles = StyleSheet.create({
  mailComponent: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  mailContainer: {
    flexDirection: "column",
    marginLeft: 10,
    width: "88%",
  },
  mail: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    // backgroundColor: "red",
  },
  from: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 20,
    color: "#3E3E3E",
  },
  subject: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 15,
    color: "#3E3E3E",
  },
  date: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 12,
    color: "#666464",
  },
  mailBody: {
    marginTop: 10,
    fontFamily: "Quicksand_700Bold",
    fontSize: 12,
    color: "#666464",
  },
  mailBodyHTML: {
    marginTop: 10,
  },
});
