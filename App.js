import React, { Component } from "react";
import { Intro, Add, Detail } from "./screens";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

const AppNavigator = createStackNavigator(
  { Intro, Add, Detail },
  { initialRouteName: "Intro" }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {
  render() {
    return <AppContainer />;
  }
}
