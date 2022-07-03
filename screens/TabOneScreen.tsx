import { ScrollView, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { MonoText } from '../components/StyledText';
import { RootTabScreenProps } from '../types';
import { WorkoutSummary } from '../components/WorkoutSummary';
import { LinearGradient } from "expo-linear-gradient";

export default function TabOneScreen({ navigation }: RootTabScreenProps<'CurrentWorkout'>) {
  return (
    <View style={styles.container}>
        <WorkoutSummary></WorkoutSummary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: "red",
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
