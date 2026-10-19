import React from "react";
import { StatusBar } from "react-native";
import DashboardScreen from "./src/screens/DashboardScreen";

const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
      <DashboardScreen />
    </>
  );
};

export default App;
