import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'

interface ChatContainerProps {
    navigation: any;
    name: string;
    details: string;
    item: {
        id: string;
        name: string;
        details: string;
    }
}

const ChatContainer = ({navigation, name, details, item}: ChatContainerProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.container} onPress={() => navigation.navigate("Message", {item})}>
        <View style={styles.personDetails}>
            <Image source={require("../../assets/images/bot.png")} style={{width: 40, height: 40, borderRadius: 10}} />
            <View style={{marginLeft: 10}}>
                <Text style={styles.contact}>{name}</Text>
                <Text style={styles.text}>{details}</Text>
            </View>
        </View>
        <Text style={styles.date}>today</Text>
    </TouchableOpacity>
  )
}

export default ChatContainer;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#F0F0F0",
        padding: 20,
        borderRadius: 20,
        marginTop: 10,
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%"
    },
    personDetails: {
        flexDirection: "row",
        width: "80%",
    },
    contact: {
        fontFamily: "Quicksand_700Bold",
        fontSize: 20,
        color: "#3E3E3E",
        marginTop: -5
    },
    text: {
        fontFamily: "Quicksand_700Bold",
        fontSize: 13,
        color: "#666464",
    },
    date: {
        fontFamily: "Quicksand_700Bold",
        fontSize: 12,
        color: "#666464",
    }
})