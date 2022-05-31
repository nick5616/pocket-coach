import { Text, TextProps, View } from 'react-native';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { ScrollView, StyleSheet } from 'react-native';
import { SummaryItem } from './SummaryItem';

export function WorkoutSummary(props: TextProps) {
  const summary = 
  <View>
    <Text style={styles.workout_title}>Pull</Text>
    <ScrollView style={styles.scroll}>
      <SummaryItem exercise_name="Pull-ups"></SummaryItem>
      <SummaryItem exercise_name="Plate loaded t-bar rows"></SummaryItem>
      <SummaryItem exercise_name="Cable pull-over on mat"></SummaryItem>
      <SummaryItem exercise_name="Bicep curls"></SummaryItem>
      <SummaryItem exercise_name="Rear delt flys"></SummaryItem>
      <SummaryItem exercise_name="Neutral grip lat pull-down"></SummaryItem>
    </ScrollView>
    <View style={styles.footer}></View>
  </View>
  return summary;
  
}

const styles = StyleSheet.create({
  info: {
    alignSelf: "center",
    padding: "3%",
    width: "90%",
    borderRadius: 10,
    marginBottom: "5%",
    backgroundColor: "#e9e9e9"
  },
  scroll: {
    
    
  },
  workout_title: {
    fontSize: 40,
    fontWeight: 'bold',
    
  },
  exercise_title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: "5%"
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  footer: {
    height: "20%",
  }
});