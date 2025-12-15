import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

const HeroHeader = () => {
  const [userName, setUserName] = useState("");
  const [budget, setBudget] = useState(0);
  const [currency, setCurrency] = useState("₹");
  const [spent, setSpent] = useState(0);

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    const data = await AsyncStorage.getItem("appData");
    if (!data) return;
    console.log("Loaded app data:", data);
    const parsed = JSON.parse(data);

    const currentMonth = moment().month(); 
    const currentYear = moment().year();

    const monthlyExpenses = parsed.expenses.filter((exp) => {
      const date = moment(exp.date);

      return (
        date.month() === currentMonth &&
        date.year() === currentYear &&
        !exp.reimbursed 
      );
    });

    console.log(monthlyExpenses);
    const totalSpent = monthlyExpenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    setUserName(parsed.userName);
    setBudget(Number(parsed.monthlyBudget));
    setCurrency(parsed.currency.split(" ")[0]);
    setSpent(totalSpent);
  };

  const percentSpent = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: "#EEF4D4",
        margin: 10,
        borderColor: "#1C2826",
        borderWidth: 1,
        borderRadius: 10,
      }}
    >
      {/* Greeting */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>Hi</Text>
        <Text style={{ fontSize: 18, marginLeft: 5 }}>{userName} 👋</Text>
      </View>

      {/* Budget */}
      <View>
        <Text style={{ fontSize: 10, fontWeight: "100" }}>Monthly Budget</Text>
        <Text style={{ fontSize: 20, color: "#555", marginTop: 5 }}>
          {currency} {budget.toFixed(2)}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 10,
          backgroundColor: "#D3D3D3",
          borderRadius: 5,
          marginTop: 10,
        }}
      >
        <View
          style={{
            height: 10,
            width: `${percentSpent}%`,
            backgroundColor: "#635BFF",
            borderRadius: 5,
          }}
        ></View>
      </View>

      {/* Footer */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 10, marginTop: 5 }}>
          {currency} {spent.toFixed(2)} spent
        </Text>
        <Text style={{ fontSize: 10, marginTop: 5 }}>
          {currency} {(budget - spent).toFixed(2)} left
        </Text>
      </View>
    </View>
  );
};

export default HeroHeader;
