import { View, Text, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

const Loader = () => {
  return (
    <SafeAreaView style={{width: '100%', height: '100%', backgroundColor: '#fff'}}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    </SafeAreaView>
  )
}

export default Loader;