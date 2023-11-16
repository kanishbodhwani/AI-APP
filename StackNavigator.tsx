import { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
  BottomTabBar,
} from "@react-navigation/bottom-tabs";
import StartScreen from "./screens/StartScreen";
import LoginScreen from "./screens/LoginScreen";
import UserContext from "./src/context/userContext";
import HomeScreen from "./screens/HomeScreen";
import { SCREENS } from "./src/constants/routes";
import SignupScreen from "./screens/SignupScreen";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import EmailScreen from "./screens/EmailScreen";
import ChatScreen from "./screens/ChatScreen";
import ProfileScreen from "./screens/ProfileScreen";
import MailScreen from "./screens/MailScreen";
import { FontAwesome } from "@expo/vector-icons";
import MessageScreen from "./screens/MessageScreen";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import AddChatScreen from "./screens/AddChatScreen";
import { ChatProvider } from "./src/context/ChatContext";
import { ChatInstanceProvider } from "./src/context/ChatInstanceContext";
import { EmailProvider } from "./src/context/EmailContext";
import CreateEmail from "./screens/CreateEmail";
import { GoalProvider } from "./src/context/GoalContext";
import GoalsScreen from "./screens/GoalsScreen";
import AddGoalScreen from "./screens/AddGoalScreen";
import { ProfileProvider } from "./src/context/ProfileContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const theme: any = {
  colors: {
    background: "transparent",
  },
};

const StackNavigator = ({ user, handleSignOut }) => {
  const memoizedUser = useMemo(() => user, [user]);
  return (
    <NavigationContainer>
      {memoizedUser ? (
        <UserContext.Provider value={{ user: memoizedUser }}>
          <EmailProvider>
            <ProfileProvider>
              <ChatInstanceProvider>
                <ChatProvider>
                  <GoalProvider>
                    <Stack.Navigator
                      initialRouteName="TabNavigator"
                      screenOptions={{ headerShown: false }}
                    >
                      <Stack.Screen name="TabNavigator">
                        {(props) => (
                          <TabNavigator
                            {...props}
                            user={memoizedUser}
                            handleSignOut={handleSignOut}
                          />
                        )}
                      </Stack.Screen>
                      <Stack.Screen
                        name={SCREENS.MAIL}
                        component={MailScreen}
                        initialParams={{ user: memoizedUser }}
                      />
                      <Stack.Screen
                        name={SCREENS.MESSAGE}
                        component={MessageScreen}
                      />
                      <Stack.Screen
                        name={SCREENS.ADDCHAT}
                        component={AddChatScreen}
                      />
                      <Stack.Screen
                        name={SCREENS.ADDGOAL}
                        component={AddGoalScreen}
                        initialParams={{ user: memoizedUser }}
                      />
                      <Stack.Screen
                        name={SCREENS.GOALS}
                        component={GoalsScreen}
                      />
                      <Stack.Screen
                        name={SCREENS.CREATE_EMAIL}
                        component={CreateEmail}
                      />
                    </Stack.Navigator>
                  </GoalProvider>
                </ChatProvider>
              </ChatInstanceProvider>
            </ProfileProvider>
          </EmailProvider>
        </UserContext.Provider>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={SCREENS.START} component={StartScreen} />
          <Stack.Screen name={SCREENS.SIGNUP} component={SignupScreen} />
          <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const TabNavigator = ({
  user,
  handleSignOut,
}: {
  user: any;
  handleSignOut: () => any;
}) => {
  return (
    <Tab.Navigator
      tabBar={(props) => {
        return (
          <BottomTabBar {...props} style={{ backgroundColor: "transparent" }} />
        );
      }}
      sceneContainerStyle={{ backgroundColor: "transparent" }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          width: "100%",
          borderTopWidth: 0,
          alignSelf: "center",
          elevation: 0,
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      safeAreaInsets={{ top: 0, bottom: 0 }}
      initialRouteName={SCREENS.HOME}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) =>
            !focused ? (
              <AntDesign name="home" size={24} color="black" />
            ) : (
              <Entypo name="home" size={24} color="black" />
            ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMAIL}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) =>
            !focused ? (
              <MaterialCommunityIcons
                name="email-outline"
                size={26}
                color="#474747"
              />
            ) : (
              <MaterialIcons name="email" size={26} color="black" />
            ),
        }}
      >
        {(props) => <EmailScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen
        name={SCREENS.CHAT}
        component={ChatScreen}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) =>
            !focused ? (
              <MaterialCommunityIcons
                name="robot-outline"
                size={26}
                color="#474747"
              />
            ) : (
              <MaterialCommunityIcons name="robot" size={26} color="black" />
            ),
        }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        options={{
          tabBarIcon: ({ focused }) =>
            !focused ? (
              <FontAwesome name="user-o" size={22} color="black" />
            ) : (
              <FontAwesome name="user" size={24} color="black" />
            ),
        }}
      >
        {(props) => (
          <ProfileScreen {...props} user={user} handleSignOut={handleSignOut} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default StackNavigator;
