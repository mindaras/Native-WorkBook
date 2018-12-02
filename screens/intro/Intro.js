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
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Detail } from "../detail";
import { Add } from "../add";
import { timingSafeEqual } from "crypto";

LocaleConfig.locales["lt"] = {
  monthNames: [
    "Sausis",
    "Vasaris",
    "Kovas",
    "Balandis",
    "Gegužė",
    "Birželis",
    "Liepa",
    "Rugpjūtis",
    "Rugsėjis",
    "Spalis",
    "Lapkritis",
    "Gruodis"
  ],
  monthNamesShort: [
    "Saus.",
    "Vas.",
    "Kov.",
    "Bal.",
    "Geg.",
    "Birž",
    "Liep.",
    "Rugp.",
    "Rugs.",
    "Spal.",
    "Lap.",
    "Gruod."
  ],
  dayNames: [
    "Pirmadienis",
    "Antradienis",
    "Trečiadienis",
    "Ketvirtadienis",
    "Penktadienis",
    "Šeštadienis",
    "Sekmadienis"
  ],
  dayNamesShort: ["Pir.", "Ant.", "Tre.", "Ket.", "Pen.", "Šeš.", "Sek."]
};

LocaleConfig.defaultLocale = "lt";

export default class Intro extends Component {
  state = {
    date: this.props.date,
    clients: [],
    showCalendar: false
  };

  static defaultProps = { date: new Date() };

  componentDidMount = () => {
    this.retrieveClients();
  };

  retrieveClients = async () => {
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

  updateDate = timestamp => {
    this.setState({ date: new Date(timestamp) }, this.retrieveClients);
  };

  changeDay = direction => {
    const { date } = this.state;
    const newDate =
      direction === "next" ? date.getDate() + 1 : date.getDate() - 1;

    this.updateDate(date.setDate(newDate));
  };

  toggleCalendar = () => {
    this.setState(prevState => ({ showCalendar: !prevState.showCalendar }));
  };

  onDayPress = ({ timestamp }) => {
    this.updateDate(timestamp);
    this.toggleCalendar();
  };

  render() {
    const { date } = this.state;
    const localDate = date.toLocaleDateString("lt-LT");

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
            <Button title="Prev" onPress={this.changeDay} />
            <Text
              style={{ textAlign: "center", fontWeight: "bold" }}
              onPress={this.toggleCalendar}
            >
              {localDate}
            </Text>
            <Button title="Next" onPress={this.changeDay.bind(this, "next")} />
          </View>
          {this.renderClients()}
          <Button title="Add" onPress={this.onAdd} />
          {this.state.showCalendar && (
            <View style={styles.calendar}>
              <Calendar
                onDayPress={this.onDayPress}
                markedDates={{
                  [localDate]: {
                    selected: true,
                    selectedColor: "blue"
                  }
                }}
              />
              <Button title="Close" onPress={this.toggleCalendar} />
            </View>
          )}
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
  },
  calendar: {
    position: "absolute",
    top: 88,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    paddingBottom: 20,
    backgroundColor: "#fff"
  }
});
