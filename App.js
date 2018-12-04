import React, { Component } from "react";
import { NavigatorIOS } from "react-native";
import { Intro } from "./screens/intro";

export default class App extends Component {
  render() {
    return (
      <NavigatorIOS
        translucent={false}
        initialRoute={{
          component: Intro,
          title: "Klientai"
        }}
        style={{ flex: 1 }}
      />
    );
  }
}
