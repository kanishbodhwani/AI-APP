import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Timestamp } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { Goal } from "../src/types/Goal";
import { useGoalContext } from "../src/context/GoalContext";

const isiPhone = Platform.OS === "ios";

const AddGoalScreen = ({ navigation, route }) => {
  const { user } = route.params;

  const { addGoal } = useGoalContext();
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [disable, setDisable] = useState(false);
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker1, setShowPicker1] = useState(false);
  const [showPicker2, setShowPicker2] = useState(false);
  const [reminder, setReminder] = useState(new Date());
  const [reminderDescription, setReminderDescription] = useState("");

  const handleSubmit = async () => {
    if (
      !name ||
      !details ||
      !category ||
      !reminderDescription ||
      !reminder ||
      !dueDate
    ) {
      return alert("Please fill in all fields");
    }
    const goal: Goal = {
      id: "",
      title: name,
      description: details,
      category,
      dueDate: Timestamp.fromDate(dueDate),
      reminder: {
        date: Timestamp.fromDate(reminder),
        description: reminderDescription,
      },
      status: "In Progress",
      userId: user.uid,
      createdAt: Timestamp.fromDate(new Date()),
      progress: 0,
    };
    await addGoal(goal, navigation);
  };

  const onChangeDate = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate || dueDate;
      setDueDate(currentDate);
      if (!isiPhone) {
        setShowPicker1(false);
      }
    }
  };

  const onChangeReminder = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate || reminder;
      setReminder(currentDate);
      if (!isiPhone) {
        setShowPicker2(false);
      }
    }
  };

  const showPicker = () => {
    if(disable) return null;
    return (
      <Picker
        selectedValue={category}
        onValueChange={(itemValue, itemIndex) => {
          setCategory(itemValue);
          Keyboard.dismiss();
        }}
        style={{
          // backgroundColor: 'red',
          marginTop: -60,
          width: "auto",
          color: "#66646A",
          fontFamily: "Poppins_600SemiBold",
        }}
        placeholder="Select a Category"
      >
        <Picker.Item
          style={styles.categoryText}
          label="Business"
          value="Business"
        />
        <Picker.Item
          style={styles.categoryText}
          label="Fitness"
          value="Fitness"
        />
        <Picker.Item
          style={styles.categoryText}
          label="Personal"
          value="Personal"
        />
      </Picker>
    );
  };

  const [poppins] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const renderAddGoalScreen = () => {
    return (
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="ios-chevron-back-circle-outline"
                size={38}
                color="#484848"
                onPress={() => navigation.goBack()}
              />
              <Text style={styles.headerText}>New Goal</Text>
            </View>
            <Image
              source={require("../assets/images/goal.png")}
              style={{ width: 40, height: 40 }}
            />
          </View>
          <View style={styles.form}>
            <Text style={styles.formText}>Title</Text>
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
              placeholder="Add goal title"
              placeholderTextColor={"#908E95"}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <Text style={styles.formDetails}>Description</Text>
            <TextInput
              style={{ ...styles.input, height: 100, textAlignVertical: "top" }}
              onChangeText={setDetails}
              value={details}
              placeholder="What is your goal?"
              placeholderTextColor={"#908E95"}
              multiline={true}
              numberOfLines={3}
              onKeyPress={(event) => {
                if (event.nativeEvent.key === "Enter") Keyboard.dismiss();
              }}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {!disable && <Text style={styles.formDetails}>Category</Text>}
            {isiPhone ? (
              showPicker()
            ) : (
              <View style={styles.category}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue, itemIndex) =>
                    setCategory(itemValue)
                  }
                  style={{
                    width: "auto",
                    color: "#66646A",
                    fontFamily: "Poppins_600SemiBold",
                  }}
                  placeholder="Select a Category"
                >
                  <Picker.Item
                    style={styles.categoryText}
                    label="Business"
                    value="Business"
                  />
                  <Picker.Item
                    style={styles.categoryText}
                    label="Fitness"
                    value="Fitness"
                  />
                  <Picker.Item
                    style={styles.categoryText}
                    label="Personal"
                    value="Personal"
                  />
                </Picker>
              </View>
            )}
            {!disable && (
              <>
                <Text style={{...styles.formDetails, marginTop: isiPhone ? -20: null}}>Deadline</Text>
                <TextInput
                  style={{ ...styles.input }}
                  value={dueDate.toDateString()}
                  dataDetectorTypes="calendarEvent"
                  onPressIn={() => setShowPicker1(true)}
                  placeholder="Add Deadline"
                  placeholderTextColor="#908E95"
                  editable={isiPhone ? false : true}
                />
              </>
            )}
            {showPicker1 && (
              <>
                {isiPhone ? (
                  <TouchableOpacity onPress={() => setShowPicker1(false)}>
                    <Text
                      style={{
                        color: "#007AFF",
                        fontSize: 18,
                        alignSelf: "flex-end",
                        marginTop: 10,
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <DateTimePicker
                  value={new Date("2021-06-01")}
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (!isiPhone) {
                      setShowPicker1(false); // Hide the DateTimePicker
                    }
                    onChangeDate(event, selectedDate); // Handle the date change
                  }}
                  mode="date"
                />
              </>
            )}
            <Text style={styles.formDetails}>Reminder</Text>
            <TextInput
              style={{ ...styles.input }}
              value={reminder.toDateString()}
              dataDetectorTypes="calendarEvent"
              onPressIn={() => {
                setShowPicker2(true);
                setDisable(true);
              }}
              placeholder="This will remind you to work on your goal"
              placeholderTextColor="#908E95"
              onSubmitEditing={() => Keyboard.dismiss()}
              editable={isiPhone ? false : true}
            />
            <TextInput
              style={{ ...styles.input }}
              onChangeText={setReminderDescription}
              value={reminderDescription}
              onPressIn={() => setDisable(true)}
              placeholder="Add a description"
              placeholderTextColor={"#908E95"}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                setDisable(false);
              }}
            />
            {showPicker2 && (
              <>
                {isiPhone ? (
                  <TouchableOpacity onPress={() => {
                    setShowPicker2(false);
                    setDisable(false);
                  }}>
                    <Text
                      style={{
                        color: "#007AFF",
                        fontSize: 18,
                        alignSelf: "flex-end",
                        marginTop: 10,
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <DateTimePicker
                  value={new Date("2021-06-01")}
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if(!isiPhone) {
                      setShowPicker2(false); // Hide the DateTimePicker
                    }
                    onChangeReminder(event, selectedDate); // Handle the date change
                  }}
                  mode="date"
                />
              </>
            )}
          </View>
        </View>
        <TouchableOpacity
          delayPressIn={0}
          activeOpacity={0.8}
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!poppins) return null;
  return (
    <SafeAreaView style={styles.container}>
      {isiPhone ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {renderAddGoalScreen()}
        </KeyboardAvoidingView>
      ) : (
        renderAddGoalScreen()
      )}
    </SafeAreaView>
  );
};

export default AddGoalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDFF",
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#151515",
    marginLeft: 10,
    marginBottom: -3,
  },
  form: {
    flexDirection: "column",
    marginTop: 10,
  },
  formText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#151515",
    marginTop: 20,
  },
  formDetails: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#151515",
    marginTop: 20,
  },
  input: {
    width: "100%",
    borderColor: "#B4B4B4",
    backgroundColor: "#FFFDFF",
    borderRadius: 10,
    height: 50,
    elevation: 3,
    textAlignVertical: "bottom",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    paddingBottom: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // color: "#908E95",
  },
  category: {
    width: "100%",
    borderColor: "#B4B4B4",
    backgroundColor: "#FFFDFF",
    borderRadius: 10,
    height: 50,
    elevation: 3,
    paddingLeft: 5,
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#151515",
    height: 60,
    padding: 10,
    borderRadius: 10,
  },
  submitButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#fff",
  },
  categoryText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
  },
});
