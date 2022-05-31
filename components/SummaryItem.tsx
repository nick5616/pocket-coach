import {Image, Text, TextProps, View } from 'react-native';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { ScrollView, StyleSheet } from 'react-native';



export function SummaryItem(props) {
  const summaryItem =
  <View style={[styles.row, styles.container]}>
    <View style={styles.rowItem}> 
      <Image source={require('../assets/images/guy.png')} style={styles.image}></Image>
    </View>
    <View style={styles.rowItem}>
      <View style={[styles.heading]}>
        <Text style={styles.exercise_title}>{props.exercise_name}</Text>
      </View>
      <View style={[styles.row, styles.tags_container]}>
        <View style={[styles.row, styles.tag]}>
          <Text style={[styles.info_label]}>Sets</Text>
          <Text style={[styles.info]}>3</Text>
        </View>
        <View style={[styles.row, styles.tag]}>
          <Text style={[styles.rowItem, styles.info_label]}>Reps</Text>
          <Text style={[styles.rowItem, styles.info]}>8</Text>
        </View>
      </View>   
    </View>
  </View>
    
  return summaryItem;
  
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.soft,
    borderRadius: 10,
    flex: 8,
    width: "auto",
    minHeight: 120,
    padding: 10,
    marginVertical: 5
  },
  info: {
    color: Colors.dark.text,
    backgroundColor: "#779977",
    width: "auto",
    padding: 2

  },
  
  scroll: {
    height: "90%"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  rowItem:{
  },
  
  exercise_title: {
    fontSize: 24,
    fontWeight: '600',
    flexWrap: "wrap",
    flex: 1,
    alignSelf: "flex-end",
    width: "auto"

  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  heading: {
    marginHorizontal: 10,
    alignSelf: "auto",
    flexWrap: "wrap",
    flex: 1, 
    maxWidth: 200
  },
  info_label: {    
    color: Colors.dark.text,
    backgroundColor: "#444444",
    padding: 2
  },
  tag: {
    backgroundColor: "yellow",
    margin: 2,
    padding: 0
  },
  tags_container: {
    marginHorizontal: 10,
    flex: 1,
    width: "auto"
  },
  image: {
    width: 95, 
    height: 95,
  }
});