import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";
import BottomNav from "./bottomNav";

const screenWidth = Dimensions.get("window").width;

// ---------------- AddForm Component ----------------
const AddForm = ({
  titleInput,
  setTitleInput,
  amountInput,
  setAmountInput,
  category,
  setCategory,
  handleAdd,
  setMode,
  mode,
}: any) => {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {mode === "expense" ? "Add Expense" : "Add to Shopping List"}
      </Text>

      <TextInput
        placeholder="Item Name"
        style={styles.input}
        value={titleInput}
        onChangeText={setTitleInput}
      />
      <TextInput
        placeholder="Price"
        keyboardType="numeric"
        style={styles.input}
        value={amountInput}
        onChangeText={setAmountInput}
      />

      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === "Needs" && styles.categorySelected,
          ]}
          onPress={() => setCategory("Needs")}
        >
          <Text
            style={[
              styles.categoryText,
              category === "Needs" && { color: "#fff" },
            ]}
          >
            Needs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === "Wants" && styles.categorySelected,
          ]}
          onPress={() => setCategory("Wants")}
        >
          <Text
            style={[
              styles.categoryText,
              category === "Wants" && { color: "#fff" },
            ]}
          >
            Wants
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setMode("none")}
      >
        <Text style={{ color: "#333" }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

// ---------------- ListCard Component ----------------
const ListCard = ({ title, items, bgColor, toggleCheck, deleteItem }: any) => {
  const total = items.reduce((acc: number, item: any) => acc + item.amount, 0);

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Text style={styles.cardTitle}>
        {title} ({items.length} items)
      </Text>
      {items.map((item: any) => (
        <View key={item.id} style={styles.listItem}>
          <TouchableOpacity
            onPress={() => toggleCheck(title.toLowerCase(), item.id)}
            style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
          >
            <View
              style={[
                styles.checkbox,
                { backgroundColor: item.completed ? "#02A9EA" : "#fff" },
              ]}
            />
            <Text
              style={[
                styles.itemName,
                item.completed && {
                  textDecorationLine: "line-through",
                  opacity: 0.6,
                },
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.itemPrice,
              item.completed && {
                textDecorationLine: "line-through",
                opacity: 0.6,
              },
            ]}
          >
            ${item.amount.toFixed(2)}
          </Text>

          {!item.completed && (
            <TouchableOpacity
              onPress={() => deleteItem(title.toLowerCase(), item.id)}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <Text style={styles.totalText}>Estimated Total: ${total.toFixed(2)}</Text>
    </View>
  );
};

// ---------------- Main AddScreen Component ----------------
const AddScreen = () => {
  const [mode, setMode] = useState<"none" | "expense" | "list">("none");
  const [needs, setNeeds] = useState<any[]>([]);
  const [wants, setWants] = useState<any[]>([]);

  const [titleInput, setTitleInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState<"Needs" | "Wants">("Needs");
  const loadData = async () => {
    try {
      const appData = await AsyncStorage.getItem("appData");
      if (appData) {
        const parsedData = JSON.parse(appData);
        setNeeds(
          parsedData.shoppingList.filter(
            (item: any) => item.category === "Needs"
          )
        );
        setWants(
          parsedData.shoppingList.filter(
            (item: any) => item.category === "Wants"
          )
        );
      }
    } catch (e) {
      console.log("Error loading data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCheck = async (type: "needs" | "wants", id: string) => {
    const appData = await AsyncStorage.getItem("appData");
    const parsedData = JSON.parse(appData);
    const item = parsedData.shoppingList.find((item: any) => item.id === id);
    if (!item) return;
    if (!item.completed) {
      parsedData.expenses.push({ ...item, completed: true });
      parsedData.shoppingList = parsedData.shoppingList.filter(
        (item: any) => item.id !== id
      );
      await AsyncStorage.setItem("appData", JSON.stringify(parsedData));
      loadData();
      return;
    }
  };

  const deleteItem = async (type: "needs" | "wants", id: string) => {
    const appData = await AsyncStorage.getItem("appData");
    const parsedData = JSON.parse(appData);
    parsedData.shoppingList = parsedData.shoppingList.filter(
      (item: any) => item.id !== id
    );
    AsyncStorage.setItem("appData", JSON.stringify(parsedData));
    loadData();
    return;
  };

  const handleAdd = async () => {
    if (!titleInput || !amountInput) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (mode === "expense") {
      Alert.alert(
        "Warning",
        "Adding an expense cannot be undone",
        [{ text: "OK", onPress: () => {} }],
        { cancelable: false }
      );
    }

    const newId = uuid.v4() as string;
    const newItem = {
      id: newId,
      title: titleInput,
      amount: parseFloat(amountInput),
      date: new Date().toISOString(),
      category,
      completed: mode === "expense",
    };
    const appData = await AsyncStorage.getItem("appData");
    let parsedData = JSON.parse(appData);
    if (!parsedData) {
      parsedData = { shoppingList: [], expenses: [] };
    }
    if (mode === "expense") {
      parsedData.expenses.push(newItem);
    } else {
      parsedData.shoppingList.push(newItem);
    }
    await AsyncStorage.setItem("appData", JSON.stringify(parsedData));
    setTitleInput("");
    setAmountInput("");
    setCategory("Needs");
    setMode("none");
    loadData();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#DAEFB3" }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#DAEFB3", padding: 20 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {mode === "none" ? (
          <>
            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setMode("expense")}
              >
                <Text style={styles.actionText}>Add Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setMode("list")}
              >
                <Text style={styles.actionText}>Add to List</Text>
              </TouchableOpacity>
            </View>

            {/* List Cards */}
            <ListCard
              title="Needs"
              items={needs}
              bgColor="#D64550"
              toggleCheck={toggleCheck}
              deleteItem={deleteItem}
            />
            <ListCard
              title="Wants"
              items={wants}
              bgColor="#380036"
              toggleCheck={toggleCheck}
              deleteItem={deleteItem}
            />
          </>
        ) : (
          // Show form only when mode is "expense" or "list"
          <AddForm
            titleInput={titleInput}
            setTitleInput={setTitleInput}
            amountInput={amountInput}
            setAmountInput={setAmountInput}
            category={category}
            setCategory={setCategory}
            handleAdd={handleAdd}
            setMode={setMode}
            mode={mode}
          />
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
};

export default AddScreen;

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    backgroundColor: "#1C2826",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "700" },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  formTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#1C2826",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  categoryContainer: { flexDirection: "row", marginBottom: 15 },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    marginHorizontal: 5,
    alignItems: "center",
  },
  categorySelected: { backgroundColor: "#1C2826" },
  categoryText: { color: "#000", fontWeight: "600" },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fff",
    marginRight: 12,
  },
  itemName: { flex: 1, color: "#fff" },
  itemPrice: { color: "#fff", fontWeight: "600" },
  totalText: {
    marginTop: 10,
    fontWeight: "700",
    color: "#fff",
    alignSelf: "flex-end",
  },
});
