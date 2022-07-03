import {Dimensions, Image, Text, TextProps, View } from 'react-native';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { Exercises } from "../constants/Enums";

export function SummaryItem(props: any) {
  const summaryItem =
  <View style={[styles.row, styles.container]}>
    <LinearGradient colors={["#eb0d89", "#1d0af1"]} start={[0.1, 0.1]} style = {styles.gradient}> 
      <View style={[styles.background]}>  
        <View style={[styles.rowItemContainer]}>
          <View style={[styles.rowItem, styles.pictureFrame]}> 
            <Image source={props.path} style={styles.image}></Image>
          </View>
          <View style={[styles.rowItem, styles.textbackground]}>
            <View style={[styles.heading]}>
              <Text style={styles.exercise_title}>{props.exercise_name}</Text>
            </View>
            <View style={[]}>
              <Text>{props.description}</Text>
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
      </View>
    </LinearGradient>
  </View>
  return summaryItem;
  
}

const styles = StyleSheet.create({
  textbackground: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginLeft: 10,
    padding: 9,
    borderRadius: 10    
  },
  pictureFrame: {
    justifyContent: 'center', //Centered vertically
    alignItems: 'center', // Centered horizontally
    
  },
  gradient: {
    borderRadius: 10
  },
  background: {
    // backgroundColor: "linear-gradient(#FFDDDD, #FFFFFF)",
    
    minHeight: 120,
    backgroundColor: "rgba(255, 255, 255, 0.5)"
  },
  container: {
    width: "100%",
    minHeight: 120,
    marginVertical: 5,
    borderRadius: 10
  },
  info: {
    color: Colors.light.text,
    width: "auto",
    padding: 2,

    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)"

  },
  
  scroll: {
    height: "90%"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 10,
    
  },
  rowItem:{
  },
  rowItemContainer: {
    padding: 10,
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  exercise_title: {
    fontSize: 20,
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
    alignSelf: "auto",
    flexWrap: "wrap",
    flex: 1, 
    maxWidth: 200
  },
  info_label: {    
    color: Colors.light.text,
    padding: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",

    borderRadius: 10


  },
  tag: {
    margin: 2,
    padding: 0,
    borderRadius: 10


  },
  tags_container: {
    flex: 1,
    width: "auto",
    borderRadius: 10
  },
  image: {
    width: 80, 
    height: 80,
    
  }
});