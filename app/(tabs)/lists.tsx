import React from "react";
import { View } from "react-native";
import Recents from "./Recents";
import BottomNav from "./bottomNav";

const lists = () => {
  return (
    <View style={{ flex: 1, height: "100vh", backgroundColor: "#DAEFB3" }}>
      <Recents page="list"/>
      <BottomNav />
    </View>
  );
};

export default lists;
