import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const categoryColors = {
  Needs: "#c8e6c9",
  Wants: "#ffe0b2",
};

const Recents = ({ page = "" }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [expandedId, setExpandedId] = useState(null); 

  const loadExpenses = async () => {
    const appData = await AsyncStorage.getItem("appData");
    if (appData) {
      const parsedData = JSON.parse(appData);
      setAllExpenses(parsedData.expenses || []);
    }
  };

  const filterForMonth = () => {
    const filtered = allExpenses.filter((exp) => {
      const d = new Date(exp.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    setFilteredExpenses(filtered);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterForMonth();
  }, [allExpenses, selectedMonth, selectedYear]);

  const markReimbursed = async (id) => {
    const appData = await AsyncStorage.getItem("appData");
    if (!appData) return;

    const parsedData = JSON.parse(appData);
    parsedData.expenses = parsedData.expenses.map((exp) =>
      exp.id === id ? { ...exp, reimbursed: true } : exp
    );

    await AsyncStorage.setItem("appData", JSON.stringify(parsedData));
    setExpandedId(null);
    loadExpenses();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 15 }}>
        Recents
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {filteredExpenses.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            No expenses for this month.
          </Text>
        )}

        {filteredExpenses.map((expense) => {
          const isExpandable = expense.reimbursable === true;
          const isExpanded = expandedId === expense.id;

          return (
            <TouchableOpacity
              key={expense.id}
              activeOpacity={0.9}
              onPress={() =>
                isExpandable
                  ? setExpandedId(isExpanded ? null : expense.id)
                  : null
              }
              style={{
                backgroundColor: "#fff",
                padding: 18,
                borderRadius: 16,
                marginBottom: 14,
                elevation: 3,
              }}
            >
              {/* Title + Amount */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {expense.title}
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#2e7d32" }}
                >
                  ₹{expense.amount.toFixed(2)}
                </Text>
              </View>

              {/* Category + Date */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: categoryColors[expense.category],
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>
                    {expense.category}
                  </Text>
                </View>

                <Text style={{ fontSize: 12, color: "#777" }}>
                  {new Date(expense.date).toLocaleDateString()}
                </Text>
              </View>

              {/* ⭐ Reimbursable Badge */}
              {expense.reimbursable && (
                <View
                  style={{
                    marginTop: 8,
                    alignSelf: "flex-start",
                    backgroundColor: expense.reimbursed
                      ? "#9ce29eff"
                      : "#6298bfff",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>
                    {expense.reimbursed ? "Reimbursed" : "💼 Reimbursable"}
                  </Text>
                </View>
              )}

              {/* ⭐ Expanded Action */}
              {isExpanded && !expense.reimbursed && (
                <TouchableOpacity
                  onPress={() => markReimbursed(expense.id)}
                  style={{
                    marginTop: 14,
                    backgroundColor: "#1C2826",
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Mark as Reimbursed
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Recents;
