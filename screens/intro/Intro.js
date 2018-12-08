import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
  Switch,
  Image
} from "react-native";
import { LinearGradient } from "expo";
import { AsyncStorage } from "react-native";
import { prevArrow, nextArrow } from "../../assets";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Detail } from "../detail";
import { Add } from "../add";
import { storageKey } from "../common";

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
    "Sekmadienis",
    "Pirmadienis",
    "Antradienis",
    "Trečiadienis",
    "Ketvirtadienis",
    "Penktadienis",
    "Šeštadienis"
  ],
  dayNamesShort: ["Sek.", "Pir.", "Ant.", "Tre.", "Ket.", "Pen.", "Šeš."]
};

LocaleConfig.defaultLocale = "lt";

export default class Intro extends Component {
  state = {
    date: this.props.date,
    clients: [],
    showCalendar: false,
    reset: false
  };

  static defaultProps = { date: new Date() };

  componentDidMount = () => {
    this.retrieveClients();
  };

  componentWillReceiveProps = nextProps => {
    const { changed } = this.props;

    if (changed !== nextProps.added) this.retrieveClients();
  };

  retrieveClients = async () => {
    const clients = this.sortClients((await this.getClients()) || {});

    this.setState({ clients });
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

  getClients = async () => {
    try {
      const clients = JSON.parse(
        await AsyncStorage.getItem(
          `${storageKey}-${this.state.date.toLocaleDateString("lt-LT")}`
        )
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
        `${storageKey}-${this.state.date.toLocaleDateString("lt-LT")}`,
        JSON.stringify(updatedClients)
      );

      this.setState({ clients: this.sortClients(updatedClients) });
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
        renderItem={({ item, index }) => {
          const { time, name, duration, service, confirmed } = item;
          const marginTop = index === 0 ? 20 : 0;
          const marginBottom = index === clients.length - 1 ? 40 : 5;

          return (
            <TouchableOpacity onPress={this.onClientPress.bind(this, item)}>
              <View style={{ ...styles.listItem, marginTop, marginBottom }}>
                <View>
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    {time}
                  </Text>
                  <Text style={styles.textMargin}>{name}</Text>
                  <Text style={styles.textMargin}>Trukmė: {duration}</Text>
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
          colors={["#22c1c3", "#fdbb2d"]}
          style={styles.container}
        >
          <View style={styles.top}>
            <View style={{ width: "25%", alignItems: "flex-start" }}>
              <TouchableOpacity onPress={this.changeDay}>
                <Image
                  source={prevArrow}
                  resizeMode="contain"
                  style={styles.arrow}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.date} onPress={this.toggleCalendar}>
              <Text style={{ fontWeight: "bold" }}>{localDate}</Text>
            </TouchableOpacity>
            <View style={{ width: "25%", alignItems: "flex-end" }}>
              <TouchableOpacity onPress={this.changeDay.bind(this, "next")}>
                <Image
                  source={nextArrow}
                  resizeMode="contain"
                  style={styles.arrow}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              height: "85%",
              paddingLeft: 10,
              paddingRight: 10
            }}
          >
            {this.renderClients()}
          </View>
          <View style={styles.bottom}>
            <Button title="Pridėti" onPress={this.onAdd} />
          </View>
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
              <Button title="Uždaryti" onPress={this.toggleCalendar} />
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "95%"
  },
  top: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2
  },
  date: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center"
  },
  arrow: {
    height: 20
  },
  listItem: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#fff"
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2
  }
});
