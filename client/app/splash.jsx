import React from "react";
import { View, ActivityIndicator } from "react-native";

export default function Splash() {
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
      <ActivityIndicator size="large" color="#0066CC" />
    </View>
  );
}
