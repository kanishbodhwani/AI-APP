import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Entypo , MaterialCommunityIcons} from '@expo/vector-icons';
import { ChatInstance } from '../types/ChatInstance';
import { Goal } from '../types/Goal';
import { useEffect, useState } from 'react';
import GoalModal from './GoalModal';

interface TaskContainerProps {
  bot?: ChatInstance;
  goal?: Goal;
  width?: number | string;
  navigation: any;
}

const TaskContainer = ({bot, goal, width = null, navigation}: TaskContainerProps) => {
  const [goalObj , setGoalObj] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);

  const getBgColor = () => {
    if(goal && goal.dueDate) {
      const dueDate = goal.dueDate;
      const today = new Date();
      const diffTime = Math.abs(dueDate.toDate().getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if(diffDays <= 1) {
        return "#FF5C74";
      }
      if(diffDays <= 7) {
        return "#FF9D65";
      }
      return "#3A68A1";
    } else {
      return "#3A68A1";
    }
  }

  useEffect(() => {
    if(goal) {
      setGoalObj(true);
    } else {
      setGoalObj(false);
    }
  }, []);

  return (
    <TouchableOpacity delayPressIn={0} activeOpacity={0.8} onPress={() => goalObj ? setModalVisible(true) : navigation.navigate('Message', {item: bot})}>
      <View style={{...styles.taskContainer, width: width ? width : 210, marginLeft: width ? 0: 10, backgroundColor: !goalObj ? "#5F47D0": getBgColor()}}>
        <View style={styles.time}>
          <Text numberOfLines={1} style={styles.titleText}>{!goalObj ? bot?.name : goal?.title}</Text>
          {goalObj ? <Entypo name="stopwatch" size={24} color="#fff" /> : <MaterialCommunityIcons name="robot-outline" size={26} color="#fff" />}
        </View>
        <View style={styles.title}>
          <Text numberOfLines={1} style={{color: "#fff", fontSize: 18, fontFamily: 'Quicksand_600SemiBold'}}>{goalObj ? goal?.description.split(' ').slice(0, 20).join(' '): 'Last Used'}</Text>
          <Text numberOfLines={1} style={{...styles.deadline}}>{goalObj ? goal?.dueDate?.toDate().toDateString(): bot?.updatedAt.toDate().toDateString()}</Text>
        </View>
      </View>
      {goalObj && <GoalModal goal={goal} bgColor={getBgColor()} modalVisible={modalVisible} setModalVisible={setModalVisible} />}
    </TouchableOpacity>
  )
}

export default TaskContainer;

const styles = StyleSheet.create({
    taskContainer: {
        flexDirection: "column",
        padding: 20,
        borderRadius: 30,
        marginTop: 10,
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
        fontSize: 17
    },
    title: {
        marginTop: 20,
    },
    titleText: {
        fontFamily: "Quicksand_700Bold",
        fontSize: 19,
        color: "#fff"
    },
    deadline: {
        fontFamily: "Quicksand_400Regular",
        fontSize: 13,
        color: "#fff"
    }
})