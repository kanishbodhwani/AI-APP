import { View, Text, Modal, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Goal } from "../types/Goal";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { useGoalContext } from "../context/GoalContext";

interface GoalModalProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  bgColor: string;
  goal: Goal;
}

const GoalModal = ({
  modalVisible,
  setModalVisible,
  bgColor,
  goal,
}: GoalModalProps) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { updateGoalProgress } = useGoalContext();

  const onSubmit = async () => {
    if(progress === null) {
      setModalVisible(false);
      return;
    };
    setLoading(true);
    await updateGoalProgress(goal.id, progress);
    setLoading(false);
    setModalVisible(false);
  };

  const goBack = () => {
    setProgress(null);
    setModalVisible(false);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={{width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <View style={{ ...styles.goalModal, backgroundColor: bgColor }}>
          <View style={styles.time}>
            <Ionicons
              onPress={() => goBack()}
              name="arrow-back"
              size={24}
              color="#fff"
            />
            <Text numberOfLines={1} style={styles.titleText}>
              {goal?.title}
            </Text>
            <Feather
              onPress={!loading ? onSubmit : null}
              name="check-circle"
              size={24}
              color="#fff"
            />
          </View>
          <View
            style={{
              width: "100%",
              justifyContent: "space-between",
              flexDirection: "row",
              marginTop: 40,
            }}
          >
            <View>
              <Text numberOfLines={1} style={styles.timeLeft}>
                Time Left: 2 days
              </Text>
              <Text numberOfLines={1} style={{ ...styles.deadline }}>
                {goal?.dueDate?.toDate().toDateString()}
              </Text>
            </View>
            <View style={styles.title}>
              <Text
                numberOfLines={1}
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontFamily: "Quicksand_600SemiBold",
                  alignSelf: "flex-end",
                }}
              >
                {goal?.description.split(" ").slice(0, 20).join(" ")}
              </Text>
              <Text
                numberOfLines={1}
                style={{ ...styles.deadline, alignSelf: "flex-end" }}
              >
                {goal?.createdAt?.toDate().toDateString()}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              justifyContent: "space-between",
              flexDirection: "row",
              marginTop: 20,
            }}
          >
            <View>
              <Text numberOfLines={1} style={styles.timeLeft}>
                Time Left: 1 day
              </Text>
              <Text numberOfLines={1} style={{ ...styles.deadline }}>
                Reminder
              </Text>
            </View>
            <View>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontFamily: "Quicksand_600SemiBold",
                  alignSelf: "flex-end",
                }}
              >
                {goal?.reminder?.description || "My Reminder"}
              </Text>
              <Text
                numberOfLines={1}
                style={{ ...styles.deadline, alignSelf: "flex-end" }}
              >
                {goal?.reminder?.date?.toDate().toDateString() || "Tomorrow"}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 30, width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: "#eee",
                  fontFamily: "Poppins_500Medium_Italic",
                  fontStyle: "italic",
                  fontSize: 18,
                  marginTop: 20,
                }}
              >
                Progress
              </Text>
              <Text
                style={{
                  color: "#eee",
                  fontFamily: "Poppins_500Medium_Italic",
                  fontStyle: "italic",
                  fontSize: 18,
                  marginTop: 20,
                }}
              >
                {progress !== null ? progress : goal.progress}% Complete
              </Text>
            </View>
            <Slider
              style={{ width: "100%", height: 50 }}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor="#4FD58E"
              maximumTrackTintColor="#FFFFFF"
              value={progress !== null ? progress : goal.progress}
              onValueChange={(val) => setProgress(val)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GoalModal;

const styles = StyleSheet.create({
  goalModal: {
    padding: 20,
    borderRadius: 20,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: "40%",
    width: "100%",
    alignSelf: "center",
    marginTop: "auto",
    alignItems: "center",
  },
  time: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeLeft: {
    color: "#fff",
    fontFamily: "Quicksand_700Bold",
    fontSize: 17,
  },
  title: {},
  titleText: {
    fontFamily: "Quicksand_700Bold",
    fontSize: 24,
    color: "#fff",
  },
  deadline: {
    fontFamily: "Quicksand_400Regular",
    fontSize: 13,
    color: "#fff",
  },
});
