import { StyleSheet, View } from "react-native";
import { useAppData } from "../AppContext";

import HeroHeader from "./HeroHeader";
import Recents from "./Recents";
import BottomNav from "./bottomNav";
import FirstTimeSetup from "./firstTimeUser";

export default function HomeScreen() {
  const { appData } = useAppData();
  if (!appData) {
    return <FirstTimeSetup />;
  }

  return (
    <View
      style={{
        flex: 1,
        height: "100vh",
        backgroundColor: "#DAEFB3",
        paddingTop: 20,
      }}
    >
      <HeroHeader />
      <Recents />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
