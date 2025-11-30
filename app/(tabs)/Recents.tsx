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

  // Load expenses from storage
  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem("expenses");
      const parsed = stored ? JSON.parse(stored) : [];
      setAllExpenses(parsed);
    } catch (err) {
      console.log("Error loading expenses:", err);
    }
  };

  // Filter based on month + year
  const filterForMonth = () => {
    const filtered = allExpenses.filter((exp) => {
      const d = new Date(exp.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    setFilteredExpenses(filtered);
  };

  // Load expenses once
  useEffect(() => {
    loadExpenses();
  }, []);

  // Re-filter whenever month or year changes OR expenses change
  useEffect(() => {
    filterForMonth();
  }, [allExpenses, selectedMonth, selectedYear]);

  const goLeft = () => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goRight = () => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Title */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 15,
          color: "#3A4742",
        }}
      >
        Recents
      </Text>

      {/* Month + Year Slider */}
      {page === "list" && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity onPress={goLeft}>
            <Text style={{ fontSize: 22, color: "#3A4742" }}>◀</Text>
          </TouchableOpacity>

          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#3A4742",
              }}
            >
              {months[selectedMonth]}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#3A4742",
              }}
            >
              {selectedYear}
            </Text>
          </View>

          <TouchableOpacity onPress={goRight}>
            <Text style={{ fontSize: 22, color: "#3A4742" }}>▶</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expenses List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {filteredExpenses.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            No expenses for this month.
          </Text>
        )}

        {filteredExpenses.map((expense) => (
          <View
            key={expense.id}
            style={{
              backgroundColor: "#ffffff",
              padding: 18,
              borderRadius: 16,
              marginBottom: 14,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
          >
            {/* Title + Amount */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
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
                marginTop: 4,
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
                {expense.date}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Recents;
