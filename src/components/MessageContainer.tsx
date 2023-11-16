import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

interface MessageContainerProps {
    message?: boolean;
    replyInput?: string;
    answer?: string;
}

const MessageContainer = ({ message = false , replyInput, answer}: MessageContainerProps) => {
  return (
    <View style={styles.container}>
        {!message ? (
            <Text style={styles.reply}>{answer}</Text>
        ) : (
            <Text style={{...styles.message}}>{replyInput}</Text>
        )}
    </View>
  )
}

export default MessageContainer;

const styles = StyleSheet.create({
    container: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
    },
    reply: {
        color: "#908E95",
        fontFamily: "Poppins_500Medium",
        fontSize: 16,
    },
    message: {
        backgroundColor: "#514E60",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 20,
        borderWidth: 0,
        color: "#fff",
        fontFamily: "Poppins_500Medium",
        fontSize: 15,
        overflow: 'hidden',
        borderTopLeftRadius: 2,
        borderTopEndRadius: 2,
        borderTopStartRadius: 2, 
    },
})