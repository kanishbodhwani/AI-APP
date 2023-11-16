import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import ChatContainer from '../src/components/ChatContainer'
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Entypo } from '@expo/vector-icons';
import { useChatInstanceContext } from '../src/context/ChatInstanceContext'
import SearchBar from '../src/components/SearchBar'

const ChatScreen = ({navigation, route}) => {
  const {id, user} = route.params;
  const {getChatInstances, chatInstances} = useChatInstanceContext();
  const [searchedChats, setSearchedChats] = useState([]); 
  const [searchBar, setSearchBar] = useState(false);
  const [searching, setSearching] = useState(false);


  // App level state <- add a bot 
  // App Level state -> Component level state

  useEffect(() => {
    (async () => {
      await getChatInstances(user.uid);
    })();
  }, [id]);

  const [poppins] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const handleSearch = (text) => {
    if(text === "") return;
    const filteredChats = chatInstances.filter(chat => chat.name.toLowerCase().includes(text.toLowerCase()));
    setSearchedChats(filteredChats);
    setSearching(true);
  }

  if(!poppins) return null;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      {searchBar ? (
          <>
            <SearchBar setSearchBar={setSearchBar} setSearchedMails={() => {}} setSearching={setSearching} onSearch={handleSearch} />
          </>
        ) : (
          <>
            <Text style={styles.chatText}>Bots</Text>
            <Ionicons onPress={() => setSearchBar(true)} name="search-outline" size={28} color="#2B2B2B" />
          </>
        )}
      </View>
      <View style={styles.chats}>
        {chatInstances && chatInstances.length > 0 ? <FlatList
          data={searching ? searchedChats :chatInstances}
          ListEmptyComponent={() => (
            <Text
              style={{
                fontFamily: "Quicksand_400Regular",
                fontStyle: "italic",
                color: "#9A9A9A",
                alignSelf: "center",
              }}
            >
              {" "}
              No Bots found{" "}
            </Text>
          )}
          renderItem={({item}) => <ChatContainer key={item.id} name={item.name} details={item.details} navigation={navigation} item={item}/>}
          keyExtractor={(item) => item.id}
        /> : (
          <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
            <Image source={require('../assets/images/NoBots.jpg')} style={{width: 200, height: 200}} />
            <Text style={{fontFamily: 'Quicksand_400Regular', fontSize: 16, color: '#9A9A9A', marginTop: 10}}>No Bots found</Text>
          </View>        )}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddChat")} activeOpacity={0.9}>
        <Entypo name="new-message" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatText: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
  },
  chats: {
    flex: 1,
    marginTop: 20,
    flexDirection: 'column',
  },
  addButton: {
    position: 'absolute',
    bottom: 14,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#1D6FEB",
    alignItems: 'center',
    justifyContent: 'center',
  },
})