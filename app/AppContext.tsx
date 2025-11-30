// AppContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: string;
}

export interface ShoppingItem {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: string;
}

export interface AppData {
  userName: string;
  monthlyBudget: number;
  currency: string;
  shoppingList: ShoppingItem[];
  expenses: Expense[];
}

interface AppContextType {
  appData: AppData | null;
  setAppData: (data: AppData) => void;
  saveAppData: (data: AppData) => void;
}

const defaultData: AppData = {
  userName: "",
  monthlyBudget: 0,
  currency: "$",
  shoppingList: [],
  expenses: [],
};

const AppContext = createContext<AppContextType>({
  appData: null,
  setAppData: () => {},
  saveAppData: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [appData, setAppDataState] = useState<AppData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const json = await AsyncStorage.getItem("appData");
      if (json) {
        setAppDataState(JSON.parse(json));
      }
    };
    loadData();
  }, []);

  const saveAppData = async (data: AppData) => {
    setAppDataState(data);
    await AsyncStorage.setItem("appData", JSON.stringify(data));
  };

  const setAppData = (data: AppData) => {
    setAppDataState(data);
  };

  return (
    <AppContext.Provider value={{ appData, setAppData, saveAppData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => useContext(AppContext);
