import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const BottomNav = () => {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 70,
        backgroundColor: "#EEF4D4",
        borderTopWidth: 1,
        borderColor: "#e5e5e5",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: 10,
      }}
    >
      {/* Home */}
      <TouchableOpacity
        onPress={() => router.push("/")}
        style={{ alignItems: "center" }}
      >
        <Ionicons name="home-outline" size={26} color="#444" />
      </TouchableOpacity>

      {/* Stats */}
      <TouchableOpacity
        onPress={() => router.push("/stats")}
        style={{ alignItems: "center" }}
      >
        <Ionicons name="stats-chart-outline" size={26} color="#444" />
      </TouchableOpacity>

      {/* Add */}
      <TouchableOpacity
        onPress={() => router.push("/add")}
        style={{ alignItems: "center" }}
      >
        <Ionicons name="add-circle" size={40} color="#635BFF" />
      </TouchableOpacity>

      {/* Lists */}
      <TouchableOpacity
        onPress={() => router.push("/lists")}
        style={{ alignItems: "center" }}
      >
        <Ionicons name="list-outline" size={26} color="#444" />
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        onPress={() => router.push("/profile")}
        style={{ alignItems: "center" }}
      >
        <Ionicons name="person-outline" size={26} color="#444" />
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;
