import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EmailLoadingAnimation = () => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const size = 36;

  const icons = [
    <MaterialIcons name="attach-email" size={size} color="#505050" />,
    <MaterialIcons name="email" size={size} color="#505050" />,
    <MaterialIcons name="mark-email-read" size={size} color="#505050" />,
    <MaterialCommunityIcons name="email-alert" size={size} color="#505050" />,
    <MaterialCommunityIcons name="email-check" size={size} color="#505050" />,  
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon(currentIcon => (currentIcon + 1) % icons.length);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <View>
      {icons[currentIcon]}
    </View>
  );
};

export default EmailLoadingAnimation;