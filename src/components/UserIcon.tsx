import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const colors = [
  '#FFCCCC', // Light Red
  '#FFD8B1', // Light Orange
  '#CCCCFF', // Light Blue
  '#CDB8E6', // Light Indigo
  '#F4C2F4', // Light Violet
  '#E6E6E6', // Light Black
];

const getRandomColor = () => {
  var randomIndex = Math.floor(Math.random() * colors.length);
  var randomColor = colors[randomIndex];
  return randomColor;
}

const UserIcon = ({
  borderRadius = 50,
  width = 40,
  height = 40,
  image = true,
  letter = '',
}) => {
  const [currentBgColor, setCurrentBgColor] = useState(null);
  
  useEffect(() => {
    if (!image) {
      let randomColor = getRandomColor();
      setCurrentBgColor(randomColor);
    }
  }, []);

  const getContrastColor = (colorCode = '') => {
    var colorCodeRed = parseInt(colorCode?.slice(1, 3), 16);
    var colorCodeGreen = parseInt(colorCode?.slice(3, 5), 16);
    var colorCodeBlue = parseInt(colorCode?.slice(5, 7), 16);

    var brightness = (colorCodeRed * 299 + colorCodeGreen * 587 + colorCodeBlue * 114) / 1000;
    var contrastColor = brightness > 128 ? '#000000' : '#FFFFFF';
  
    return contrastColor;
  }

  return image ? (
    <Image
      source={require("../../assets/images/user.jpeg")}
      style={{ width, height, borderRadius }}
    />
  ) : (
    <View style={{ width, height, borderRadius, backgroundColor: currentBgColor, ...styles.flex}}>
      <Text style={{color: getContrastColor(currentBgColor), fontSize: 24, fontFamily: "Quicksand_700Bold", marginBottom: 5}}>{letter}</Text>
    </View>
  );
};

export default UserIcon;


const styles = StyleSheet.create({
  flex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }
});