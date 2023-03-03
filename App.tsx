import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
// import { getTasks } from "../../pocket-coach/src/controller/controller";

// getTasks({ response: "bjork" }).then((data) => {
//     console.log("data", data);
//     setTask(data);
// });
const [mothafuckinTask, setTask] = useState<any>("bees");

export default function App() {
    return (
        <View style={styles.container}>
            <Text>Welcome to Pocket-Coach!</Text>
            <StatusBar style="auto" />
            <View>
                <Text>Pizza pie! {mothafuckinTask}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
