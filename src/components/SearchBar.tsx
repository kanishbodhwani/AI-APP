import { useState } from "react";
import { View, TextInput, Keyboard } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  onSearch: (searchText: string) => void;
  setSearchBar?: (boolean) => void;
  placeholder?: string;
  setSearchedMails?: (mails: any) => void;
  setSearching?: (boolean) => void;
}

const SearchBar = ({ placeholder = '', setSearchBar, onSearch, setSearchedMails, setSearching}: SearchBarProps) => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    Keyboard.dismiss();
    onSearch(searchText);
  };

  return (
    <View style={{width: "auto", flexDirection: "row", alignItems: "center"}}>
      <View style={{position: "absolute", left: 7, zIndex: 1, flexDirection: "row", alignItems: "center"}}>
        <Ionicons name="arrow-back" size={24} color="black" onPress={() => {
          setSearchBar(false); 
          setSearchedMails([]);
          setSearchText("");
          setSearching(false);
        }}/>
      </View>
      <TextInput
        style={{
          height: 40,
          width: "100%",
          borderColor: "#B4B4B4",
          borderWidth: 0.5,
          borderRadius: 4,
          paddingLeft: 35,
          paddingRight: 10,
          backgroundColor: "transparent",
          fontFamily: "Quicksand_500Medium",
          fontSize: 18,
          zIndex: -1,
        }}
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        placeholder={placeholder}
        onSubmitEditing={handleSearch}
      />
    </View>
  );
};

export default SearchBar;
