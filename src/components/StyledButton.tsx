import React from "react";
import { View, Button, StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  buttonStyles?: object;
  buttonTextStyles?: object;
}

const StyledButton: React.FC<ButtonProps> = ({ title, onPress, buttonStyles, buttonTextStyles }) => {
  return (
    <TouchableOpacity onPress={onPress} style={buttonStyles}>
      <Text style={buttonTextStyles}> {title} </Text>
    </TouchableOpacity>
  );
};

export default StyledButton;
