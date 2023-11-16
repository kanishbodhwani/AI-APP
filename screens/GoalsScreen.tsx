import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Entypo , Feather} from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import TaskContainer from "../src/components/TaskContainer";
import { useGoalContext } from "../src/context/GoalContext";

const GoalsScreen = ({ navigation }) => {
  const { goals } = useGoalContext();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons onPress={() => navigation.goBack()} name="md-arrow-back" size={24} color="black" />
          <Text style={styles.headText}>Goals</Text>
        </View>
        <Image
          source={require("../assets/images/goal.png")}
          style={{ width: 40, height: 40 }}
        />
      </View>
      {goals && goals.length > 0 ? <ScrollView
        style={{ marginTop: 20, flex: 1 }}
        showsVerticalScrollIndicator={false}
        horizontal={false}
      >
        {goals.map((goal) => (
          <TaskContainer navigation={navigation} width={"100%"} key={goal.id} goal={goal} />
        ))}
      </ScrollView> : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../assets/images/NoGoals.jpg')} style={{width: 300, height: 300}} />
          <Text style={{fontFamily: 'Quicksand_400Regular', fontSize: 16, color: '#9A9A9A', marginTop: 10}}>Make your goals</Text>
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddGoal")} activeOpacity={0.9}>
        <Feather name="target" size={36} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GoalsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 26,
    color: "#2B2B2B",
    marginLeft: 10,
    marginBottom: -4,
  },
  addButton: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#1D6FEB",
    alignItems: 'center',
    justifyContent: 'center',
  },
});
