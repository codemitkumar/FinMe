import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

export const importBackup = async (setAppData,
      setCurrency,
      setMonthlyBudget,
      setLastBackup
) => {
      try {
            const result = await DocumentPicker.getDocumentAsync({
                  type: "application/json",
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;

            // Read file content
            const content = await FileSystem.readAsStringAsync(fileUri, {
                  encoding: FileSystem.EncodingType.UTF8,
            });

            const parsed = JSON.parse(content);

            // Validate backup structure
            if (!parsed) {
                  Alert.alert("Invalid Backup", "The selected file is not valid.");
                  return;
            }

            // Save restored data in AsyncStorage
            await AsyncStorage.setItem("appData", JSON.stringify(parsed));

            // Update states
            setAppData(parsed);
            setCurrency(parsed.currency || "₹ INR");
            setMonthlyBudget(String(parsed.monthlyBudget || "25000"));

            // Mark backup time
            const time = new Date().toLocaleString();
            setLastBackup(time);
            await AsyncStorage.setItem("lastBackup", time);

            Alert.alert("Import Successful", "Backup data has been restored.");
      } catch (e) {
            console.log("Import error:", e);
            Alert.alert("Error", "Failed to import backup.");
      }
};

export const backupData = async (appData,
      setLastBackup
) => {
    try {
      if (!appData) return Alert.alert("No data to backup");

      const fileUri =
        FileSystem.documentDirectory + `backup_${Date.now()}.json`;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(appData), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const time = new Date().toLocaleString();
      setLastBackup(time);
      await AsyncStorage.setItem("lastBackup", time);

      Alert.alert(
        "Backup Completed",
        `Backup saved at:\n${fileUri}\n\nLast updated: ${time}`
      );
    } catch (e) {
      console.log("Backup error:", e);
      Alert.alert("Error", "Backup failed.");
    }
  };