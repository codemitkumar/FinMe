import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const currencies = ["₹ INR", "$ USD", "€ EUR", "£ GBP", "¥ JPY"];

const FirstTimeSetup = () => {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState(currencies[0]);
  const [monthlyBudget, setMonthlyBudget] = useState("");

  useEffect(() => {
    checkIfSetupDone();
  }, []);

  const checkIfSetupDone = async () => {
    const setupDone = await AsyncStorage.getItem("appData");
    if (setupDone) {
      router.replace("/"); // already has app data
    }
  };

  const handleSave = async () => {
    if (!name || !monthlyBudget) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    Alert.alert(
      "Important",
      "This is a completely local app. Your data is stored only on this device. If you clear cache or uninstall, all data will be lost unless backed up in the app.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "I Understand",
          onPress: async () => {
            const appData = {
              userName: name,
              monthlyBudget: Number(monthlyBudget),
              currency: currency,
              shoppingList: [],
              expenses: [],
            };

            await AsyncStorage.setItem("appData", JSON.stringify(appData));
            router.replace("/profile");
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Let's set up your account. All data is stored locally on this device.
        </Text>

        {/* Name */}
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        {/* Monthly Budget */}
        <Text style={styles.label}>Monthly Budget</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter monthly budget"
          keyboardType="numeric"
          value={monthlyBudget}
          onChangeText={setMonthlyBudget}
        />

        {/* Currency Selection */}
        <Text style={styles.label}>Select Currency</Text>
        <View style={styles.currencyContainer}>
          {currencies.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.currencyBtn,
                currency === c && styles.currencyBtnSelected,
              ]}
              onPress={() => setCurrency(c)}
            >
              <Text
                style={[
                  styles.currencyText,
                  currency === c && styles.currencyTextSelected,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save & Continue</Text>
        </TouchableOpacity>

        {/* Warning Note */}
        <Text style={styles.warningText}>
          ⚠️ This is a local-only app. Clear cache or uninstall will erase all
          data unless backed up.
        </Text>
      </View>
    </ScrollView>
  );
};

export default FirstTimeSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F1D3",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  currencyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  currencyBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
    backgroundColor: "#F9F9F9",
  },
  currencyBtnSelected: {
    backgroundColor: "#635BFF",
    borderColor: "#635BFF",
  },
  currencyText: {
    fontSize: 16,
    color: "#333",
  },
  currencyTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: "#635BFF",
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 25,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  warningText: {
    fontSize: 12,
    color: "#D9534F",
    marginTop: 15,
    textAlign: "center",
  },
});
