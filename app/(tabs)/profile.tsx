import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { generateHTMLReportWithStats } from "../handlers/BudgetPdf";
import { backupData, importBackup } from "../handlers/FileBackup";
import BottomNav from "./bottomNav";
const currencies = ["₹ INR", "$ USD", "€ EUR", "£ GBP", "¥ JPY"];
const screenWidth = 400;
const Profile = () => {
  const [appData, setAppData] = useState<any>(null);
  const [currency, setCurrency] = useState<string>("₹ INR");
  const [monthlyBudget, setMonthlyBudget] = useState<string>("25000");
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string>("25000");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [lastBackup, setLastBackup] = useState<string>("Never");

  useEffect(() => {
    loadProfile();
    loadBackupTime();
  }, []);

  const loadProfile = async () => {
    try {
      const appData = await AsyncStorage.getItem("appData");
      setAppData(appData ? JSON.parse(appData) : null);
      setCurrency(appData ? JSON.parse(appData).currency : "₹ INR");
      setMonthlyBudget(
        appData ? String(JSON.parse(appData).monthlyBudget) : "25000"
      );
    } catch (e) {
      console.log("Error loading profile:", e);
    }
  };

  const loadBackupTime = async () => {
    const time = await AsyncStorage.getItem("lastBackup");
    if (time) setLastBackup(time);
  };

  const selectCurrency = async (c: string) => {
    appData.currency = c;
    setAppData(appData);
    await AsyncStorage.setItem("appData", JSON.stringify(appData));
    setCurrencyModalVisible(false);
  };

  const downloadReport = async () => {
    try {
      if (!appData) {
        Alert.alert("No Data", "No app data found to generate report.");
        return;
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlySavings: (number | "TBD")[] = Array.from(
        { length: 12 },
        (_, i) => {
          const monthExpenses =
            appData.expenses?.filter((e: any) => {
              const d = new Date(e.date);
              return d.getFullYear() === currentYear && d.getMonth() === i;
            }) || [];

          if (monthExpenses.length === 0) {
            return i <= currentMonth ? appData.monthlyBudget || 0 : "TBD";
          }

          const monthTotal = monthExpenses.reduce(
            (sum: number, e: any) => sum + e.amount,
            0
          );
          return (appData.monthlyBudget || 0) - monthTotal;
        }
      );

      const thisYearSavings = monthlySavings
        .filter((s) => typeof s === "number")
        .reduce((sum, s) => sum + (s as number), 0);

      const lastYearSavings = 0;
      const categorySpend = { Needs: 0, Wants: 0 };
      appData.expenses?.forEach((e: any) => {
        if (new Date(e.date).getFullYear() === currentYear) {
          if (e.category === "Needs") categorySpend.Needs += e.amount;
          else categorySpend.Wants += e.amount;
        }
      });

      const pending = { Needs: 0, Wants: 0 };

      const chartsStr = await AsyncStorage.getItem("chartPNGs");
      const charts = chartsStr ? JSON.parse(chartsStr) : {};

      const html = generateHTMLReportWithStats({
        userName: appData.userName || "User",
        monthlyBudget: appData.monthlyBudget || 0,
        currency: appData.currency || "₹",
        shoppingList: appData.expenses || [],
        monthlySavings,
        thisYearSavings,
        lastYearSavings,
        monthName: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ][currentMonth],
        year: currentYear,
        appLogoBase64: "",
        categoryChartBase64: charts.spentChartBase64 || "",
        pendingChartBase64: charts.pendingChartBase64 || "",
        savingsChartBase64: charts.savingsChartBase64 || "",
      });

      const { uri } = await Print.printToFileAsync({ html });
      Alert.alert(
        "Report Generated",
        "Do you want to open the PDF?",
        [
          { text: "No" },
          { text: "Yes", onPress: () => Sharing.shareAsync(uri) },
        ],
        { cancelable: true }
      );
    } catch (e) {
      console.log("Report download error:", e);
      Alert.alert(
        "Error",
        "Failed to generate report. Check console for details."
      );
    }
  };

  const saveBudget = async () => {
    appData.monthlyBudget = Number(budgetInput);
    setAppData(appData);
    setMonthlyBudget(budgetInput);
    await AsyncStorage.setItem("appData", JSON.stringify(appData));
    setBudgetModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.title}>Profile</Text>

        {/* Stats Section */}
        <View style={styles.statsBox}>
          <Text style={styles.statsHeader}>Your Stats ({currency})</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Expenses:</Text>
            <Text style={styles.statValue}>
              {expenses.reduce((a, b) => a + b.amount, 0)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Monthly Budget:</Text>
            <Text style={styles.statValue}>{monthlyBudget}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Remaining:</Text>
            <Text style={styles.statValue}>
              {Number(monthlyBudget) -
                expenses
                  .filter((e) => {
                    const expenseDate = new Date(e.date);
                    const now = new Date();
                    return (
                      expenseDate.getMonth() === now.getMonth() &&
                      expenseDate.getFullYear() === now.getFullYear()
                    );
                  })
                  .reduce((a, b) => a + b.amount, 0)}
            </Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "#888", fontSize: 13 }}>
              Last Backup: {lastBackup}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 20, width: "100%" }}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              setBudgetInput(monthlyBudget);
              setBudgetModalVisible(true);
            }}
          >
            <Text style={styles.btnText}>Edit Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => backupData(appData, setLastBackup)}
          >
            <Text style={styles.btnText}>Backup Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() =>
              importBackup(
                setAppData,
                setCurrency,
                setMonthlyBudget,
                setLastBackup
              )
            }
          >
            <Text style={styles.btnText}>Import From Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={downloadReport}>
            <Text style={styles.btnText}>Download Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <Text style={styles.btnText}>Change Currency ({currency})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.logoutBtn]}>
            <Text style={[styles.btnText, { color: "white" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        transparent
        visible={currencyModalVisible}
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            {currencies.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.modalBtn}
                onPress={() => selectCurrency(c)}
              >
                <Text
                  style={[
                    styles.modalBtnText,
                    currency === c && { fontWeight: "700", color: "#635BFF" },
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalBtn, { marginTop: 10 }]}
              onPress={() => setCurrencyModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: "tomato" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={budgetModalVisible}
        animationType="slide"
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Monthly Budget</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />
            <TouchableOpacity style={styles.modalBtn} onPress={saveBudget}>
              <Text style={[styles.modalBtnText, { color: "#635BFF" }]}>
                Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { marginTop: 10 }]}
              onPress={() => setBudgetModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: "tomato" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: "#DAEFB3",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  statsBox: {
    width: "100%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 14,
    marginTop: 10,
    elevation: 3,
  },

  statsHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  statLabel: {
    color: "#666",
    fontSize: 15,
  },

  statValue: {
    fontSize: 15,
    fontWeight: "600",
  },

  btn: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  btnText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  logoutBtn: {
    backgroundColor: "tomato",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },

  modalBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },

  modalBtnText: {
    fontSize: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
  },
});
