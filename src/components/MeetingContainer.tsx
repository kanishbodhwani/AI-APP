import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const MeetingContainer = ({time, title}) => {
  return (
    <View style={styles.meetingContainer}>
        <View style={styles.time}>
            <Text style={styles.timeText}>{time}</Text>
        </View> 
        <View style={styles.title}>
            <Text style={styles.titleText}>{title}</Text>
        </View>       
    </View>
  )
}

export default MeetingContainer;

const styles = StyleSheet.create({
    meetingContainer: {
        backgroundColor: "#2B2B2B",
        width: 250,
        borderRadius: 30,
        height: 50,
        paddingLeft: 20,
        // paddingRight: 20,
        marginTop: 10,
        marginLeft: 20,
        flexDirection: "row"
    },
    time: {
        width: "30%",
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        width: "70%",
        alignItems: "center",
        justifyContent: "center",
        borderLeftWidth: 1,
        borderLeftColor: "#eee",
        marginLeft: 10,
        backgroundColor: "#47BA73",
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30
    },
    timeText: {
        fontFamily: "Quicksand_700Bold",
        fontSize: 15,
        color: "#eee"
    },
    titleText: {
        fontFamily: "Quicksand_700Bold",
        fontSize: 15,
        color: "#eee"
    }
})