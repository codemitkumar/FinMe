import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart, ProgressChart } from "react-native-chart-kit";
import { captureRef } from "react-native-view-shot";
import BottomNav from "./bottomNav";

const screenWidth = Dimensions.get("window").width;

const Stats = () => {
  const [userData, setUserData] = useState<any>(null);
  const budgetChartRef = useRef(null);
  const spentChartRef = useRef(null);
  const pendingChartRef = useRef(null);
  const savingsChartRef = useRef(null);
  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const dataStr = await AsyncStorage.getItem("appData");
        if (dataStr) setUserData(JSON.parse(dataStr));
      } catch (err) {
        console.log("Failed to load app data:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!userData) return;

    const saveChartsToStorage = async () => {
      try {
        const width = 400;
        const height = 300;

        const spentChartBase64 = await captureRef(spentChartRef, {
          format: "png",
          quality: 1,
          width,
          height,
          result: "base64",
        });

        const budgetChartBase64 = await captureRef(budgetChartRef, {
          format: "png",
          quality: 1,
          width,
          height,
          result: "base64",
        });

        const pendingChartBase64 = await captureRef(pendingChartRef, {
          format: "png",
          quality: 1,
          width,
          height,
          result: "base64",
        });

        const savingsChartBase64 = await captureRef(savingsChartRef, {
          format: "png",
          quality: 1,
          width,
          height,
          result: "base64",
        });

        await AsyncStorage.setItem(
          "chartPNGs",
          JSON.stringify({
            spentChartBase64,
            budgetChartBase64,
            pendingChartBase64,
            savingsChartBase64,
          })
        );

        console.log("Charts saved to AsyncStorage ✅");
      } catch (e) {
        console.log("Failed to save charts:", e);
      }
    };

    saveChartsToStorage();
  }, [userData]);

  // Current month & year
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Monthly expenses
  const monthlyExpenses = useMemo(() => {
    if (!userData?.expenses) return [];
    return userData.expenses.filter((e: any) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [userData]);

  const spent = useMemo(
    () => monthlyExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthlyExpenses]
  );

  const categorySpend = useMemo(() => {
    let needs = 0,
      wants = 0;
    monthlyExpenses.forEach((e) => {
      if (e.category === "Needs") needs += e.amount;
      else wants += e.amount;
    });
    return { Needs: needs, Wants: wants };
  }, [monthlyExpenses]);

  // Budget from user data
  const budget = userData?.monthlyBudget || 0;

  // Pending expenses (optional: you can mark some expenses as pending in data)
  const pending = { Needs: 0, Wants: 0 };

  // Monthly savings (simplified as budget - spent for each month)
  const monthlySavings = Array.from({ length: 12 }, (_, i) => {
    if (!userData?.expenses) return 0;
    const monthlyTotal = userData.expenses
      .filter((e: any) => new Date(e.date).getMonth() === i)
      .reduce((sum: number, e: any) => sum + e.amount, 0);
    return (userData.monthlyBudget || 0) - monthlyTotal;
  });

  // Yearly savings
  const thisYearSavings = monthlySavings.reduce((sum, s) => sum + s, 0);
  const lastYearSavings = thisYearSavings; // Placeholder, you can compute actual last year if needed

  if (!userData) return <Text style={{ margin: 20 }}>Loading Stats...</Text>;

  return (
    <View
      style={{
        flex: 1,
        height: "100vh",
        backgroundColor: "#DAEFB3",
        paddingTop: 20,
      }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>Stats</Text>
        {/* Budget Left */}
        <View style={styles.card} ref={budgetChartRef} collapsable={false}>
          <Text style={styles.cardTitle}>Budget Left</Text>
          <Text style={styles.cardValue}>
            {userData.currency}
            {budget - spent}
          </Text>
          <ProgressChart
            data={{ labels: ["Spent"], data: [budget ? spent / budget : 0] }}
            width={screenWidth - 40}
            height={140}
            strokeWidth={14}
            radius={36}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            hideLegend={true}
          />
        </View>
        {/* Spent Breakdown */}
        <View style={styles.card} ref={spentChartRef} collapsable={false}>
          <Text style={styles.cardTitle}>Spent</Text>
          <Text style={styles.cardValue}>
            {userData.currency}
            {spent}
          </Text>
          <BarChart
            data={{
              labels: ["Needs", "Wants"],
              datasets: [{ data: [categorySpend.Needs, categorySpend.Wants] }],
            }}
            width={screenWidth - 40}
            height={160}
            yAxisLabel={userData.currency}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              barPercentage: 0.5,
            }}
            fromZero={true} // This ensures 0 is represented at baseline
            showValuesOnTopOfBars={true} // Optional: show exact value on top
          />
        </View>
        <View style={styles.card} ref={pendingChartRef} collapsable={false}>
          <Text style={styles.cardTitle}>Pending Expenses</Text>
          <BarChart
            data={{
              labels: ["Needs", "Wants"],
              datasets: [{ data: [pending.Needs, pending.Wants] }],
            }}
            width={screenWidth - 40}
            height={160}
            yAxisLabel={userData.currency}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              barPercentage: 0.5,
            }}
            fromZero={true}
            showValuesOnTopOfBars={true}
          />
        </View>
        {/* Monthly Savings */}
        <View style={styles.card} ref={savingsChartRef} collapsable={false}>
          <Text style={styles.cardTitle}>Monthly Savings</Text>
          <LineChart
            data={{
              labels: [
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
              ],
              datasets: [{ data: monthlySavings }],
            }}
            width={screenWidth - 40}
            height={160}
            yAxisSuffix={userData.currency}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              propsForDots: { r: "3", strokeWidth: "1", stroke: "#6C63FF" },
            }}
            style={{ borderRadius: 16 }}
          />
        </View>
        {/* Yearly Savings */}
        <View style={styles.yearlySavingCard}>
          <Text style={styles.cardTitle}>Yearly Savings</Text>
          <Text style={styles.cardValue}>
            {userData.currency}
            {thisYearSavings}
          </Text>
          <Text style={styles.infoText}>
            Last Year Saved: {userData.currency} {"  "}
            {lastYearSavings}
          </Text>
          <Text style={styles.infoText}>
            To reach last year: {userData.currency}{" "}
            {lastYearSavings - thisYearSavings}
          </Text>
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
};

export default Stats;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DAEFB3", padding: 20 },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C2826",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    alignItems: "center",
  },
  yearlySavingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,

    marginBottom: 100,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C2826",
    marginBottom: 10,
  },
  infoText: { fontSize: 14, color: "#555", marginTop: 4 },
});
