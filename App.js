import React, { Component } from "react";
import { Intro, Add, Detail } from "./screens";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

// const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Intro" component={Intro} />
          <Stack.Screen name="Add" component={Add} />
          <Stack.Screen name="Detail" component={Detail} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
