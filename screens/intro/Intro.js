import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
  Switch
} from "react-native";
import { LinearGradient } from "expo";
import { AsyncStorage } from "react-native";
import { Detail } from "../detail";
import { Add } from "../add";
import { createSecureServer } from "http2";

export default class Intro extends Component {
  state = {
    date: new Date(),
    clients: []
  };

  componentDidMount = async () => {
    const clients = this.filterAndSortClients((await this.getClients()) || {});

    this.setState({ clients });
  };

  filterClients = clients => {
    const filteredClients = { ...clients };

    Object.keys(filteredClients).forEach(key => {
      if (key[0] === "_") delete filteredClients[key];
    });

    return filteredClients;
  };

  sortClients = clients => {
    let sortedClients = Object.values(clients);

    sortedClients.sort((a, b) => {
      return (
        parseInt(a.time.split(":").join(""), 10) -
        parseInt(b.time.split(":").join(""), 10)
      );
    });

    return sortedClients;
  };

  filterAndSortClients = clients => {
    const filteredClients = this.filterClients(clients);

    return this.sortClients(filteredClients);
  };

  getClients = async () => {
    try {
      const clients = JSON.parse(
        await AsyncStorage.getItem(this.state.date.toLocaleDateString("lt-LT"))
      );

      if (clients !== null) {
        return clients;
      }
    } catch (e) {}
  };

  onClientPress = client => {
    this.props.navigator.push({
      component: Detail,
      title: client.name,
      passProps: { ...client, date: this.state.date }
    });
  };

  onConfirm = async (time, value) => {
    const clients = (await this.getClients()) || {};
    const updatedClients = {
      ...clients,
      [time]: { ...clients[time], confirmed: value }
    };

    try {
      await AsyncStorage.setItem(
        this.state.date.toLocaleDateString("lt-LT"),
        JSON.stringify(updatedClients)
      );

      this.setState({ clients: this.filterAndSortClients(updatedClients) });
    } catch (e) {}
  };

  onAdd = () => {
    this.props.navigator.push({
      component: Add,
      title: "Pridėti",
      passProps: { date: this.state.date }
    });
  };

  renderClients = () => {
    const { clients } = this.state;

    return (
      <FlatList
        data={clients}
        renderItem={({ item }) => {
          const { name, time, service, confirmed } = item;

          return (
            <TouchableOpacity onPress={this.onClientPress.bind(this, item)}>
              <View style={styles.listItem}>
                <View>
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    {time}
                  </Text>
                  <Text style={styles.textMargin}>{name}</Text>
                  <Text style={styles.textMargin}>{service}</Text>
                </View>
                <View>
                  <Text style={{ marginBottom: 4 }}>Patvirtinta:</Text>
                  <Switch
                    value={confirmed}
                    onValueChange={this.onConfirm.bind(this, time)}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  nextDay = () => {};

  render() {
    return (
      <View>
        <LinearGradient
          colors={["#4CA1AF", "#C4E0E5"]}
          style={styles.container}
        >
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <Button title="Prev" onPress={() => {}} />
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              {new Date(this.state.date).toLocaleDateString("lt-LT")}
            </Text>
            <Button title="Next" onPress={this.nextDay} />
          </View>
          {this.renderClients()}
          <Button title="Add" onPress={this.onAdd} />
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 20,
    minHeight: "100%"
  },
  listItem: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    marginBottom: 5,
    borderRadius: 4,
    opacity: 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2
  },
  textMargin: {
    marginBottom: 2
  }
});
