import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (itemName, value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(itemName, jsonValue);
    } catch (e) {
        console.log(e);
    }
}

export const getData = async (itemName) => {
    try {
      const jsonValue = await AsyncStorage.getItem(itemName);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
        // error reading value
        console.log(e);
    }
}

export const removeData = async (itemName) => {
    try {
        await AsyncStorage.removeItem(itemName);
    } catch (e) {
        console.log(e);
    }
}