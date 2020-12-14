import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  Button,
  Switch,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { prevArrow, nextArrow, plusIcon, backgroundImage } from "../../assets";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { storageKey, markedDatesKey, workingHours } from "../common";

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
    "Gruodis",
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
    "Gruod.",
  ],
  dayNames: [
    "Sekmadienis",
    "Pirmadienis",
    "Antradienis",
    "Trečiadienis",
    "Ketvirtadienis",
    "Penktadienis",
    "Šeštadienis",
  ],
  dayNamesShort: ["Sek.", "Pir.", "Ant.", "Tre.", "Ket.", "Pen.", "Šeš."],
};

LocaleConfig.defaultLocale = "lt";

class Intro extends Component {
  state = {
    date: this.props.date,
    clients: [],
    markedDates: {},
    showWorkCalendar: false,
    showHolidayCalendar: false,
    reset: false,
  };

  static defaultProps = { date: new Date() };

  static navigationOptions = {
    title: "Klientai",
  };

  componentDidMount = () => {
    this.retrieveClients();
    this.retrieveMarkedDates();
    this.props.navigation.addListener("focus", this.retrieveClients);
  };

  retrieveClients = async () => {
    const clients = this.sortClients((await this.getClients()) || {});

    this.setState({ clients });
  };

  sortClients = (clients) => {
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

  onClientPress = (client) => {
    this.props.navigation.navigate("Detail", {
      ...client,
      date: this.state.date,
    });
  };

  onConfirm = async (time, value) => {
    const clients = (await this.getClients()) || {};
    const updatedClients = {
      ...clients,
      [time]: { ...clients[time], confirmed: value },
    };

    try {
      await AsyncStorage.setItem(
        `${storageKey}-${this.state.date.toLocaleDateString("lt-LT")}`,
        JSON.stringify(updatedClients)
      );

      this.setState({ clients: this.sortClients(updatedClients) });
    } catch (e) {}
  };

  onAdd = (props) => {
    this.props.navigation.navigate("Add", {
      date: this.state.date,
      ...props,
    });
  };

  renderWorkingHours = () => {
    return workingHours.map((hour, index) => {
      const isFirst = index === 0;
      const isLast = index === workingHours.length - 1;

      return (
        <View
          key={hour}
          style={{
            borderTopLeftRadius: isFirst ? 4 : 0,
            borderTopRightRadius: isFirst ? 4 : 0,
            borderBottomLeftRadius: isLast ? 4 : 0,
            borderBottomRightRadius: isLast ? 4 : 0,
            ...styles.hourContainer,
          }}
        >
          <Text style={styles.hourText}>{hour}</Text>
          <View style={styles.hourMidLine} />
          <TouchableOpacity
            style={styles.hourButton}
            onPress={this.onAdd.bind(this, { hours: hour })}
          >
            <Image style={styles.hourButtonIcon} source={plusIcon} />
          </TouchableOpacity>
        </View>
      );
    });
  };

  getItemOffset = (hours, minutes) => {
    const firstWorkingHour = parseInt(workingHours[0].split(":"), 10);
    const hourHeight = 100;
    const borderHeight = 1;
    return (
      (hours - firstWorkingHour) * hourHeight +
      (minutes * hourHeight) / 60 +
      borderHeight
    );
  };

  renderClients = () => {
    const lastItem = { hours: 0, minutes: 0, height: 0 };

    return this.state.clients.map((item, i) => {
      const { time, name, duration, service, confirmed } = item;
      const [hours, minutes] = time.split(":").map((t) => parseInt(t, 10));

      let marginTop = 0;

      if (i === 0) marginTop = this.getItemOffset(hours, minutes);
      else {
        const totalNeededOffset = this.getItemOffset(hours, minutes);
        const lastItemOffset = this.getItemOffset(
          lastItem.hours,
          lastItem.minutes
        );
        marginTop = totalNeededOffset - lastItemOffset - lastItem.height;
      }

      const [durationHours, durationMinutes] = duration
        .split(":")
        .map((d) => parseInt(d, 10));
      const height = durationHours * 100 + (durationMinutes * 100) / 60 - 2;
      lastItem.hours = hours;
      lastItem.minutes = minutes;
      lastItem.height = height;

      return (
        <TouchableOpacity
          key={time}
          onPress={this.onClientPress.bind(this, item)}
        >
          <View
            style={{
              ...styles.listItem,
              height,
              marginTop,
            }}
          >
            <View style={styles.listItemContainer}>
              <View>
                <Text style={styles.listItemTime}>{time}</Text>
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
          </View>
        </TouchableOpacity>
      );
    });
  };

  updateDate = (timestamp) => {
    this.setState({ date: new Date(timestamp) }, this.retrieveClients);
  };

  changeDay = (direction) => {
    const { date } = this.state;
    const newDate =
      direction === "next" ? date.getDate() + 1 : date.getDate() - 1;

    this.updateDate(date.setDate(newDate));
  };

  toggleCalendar = (calendar) => {
    this.setState((prevState) => ({ [calendar]: !prevState[calendar] }));
  };

  switchToHolidayCalendar = () => {
    this.setState({ showWorkCalendar: false, showHolidayCalendar: true });
  };

  onDayPress = ({ timestamp }) => {
    this.updateDate(timestamp);
    this.toggleCalendar("showWorkCalendar");
  };

  onHolidayPress = async ({ timestamp }) => {
    const { markedDates } = this.state;
    const localDate = new Date(timestamp).toLocaleDateString("lt-LT");
    const isMarked = markedDates[localDate];
    const updatedMarkedDates = { ...markedDates };

    if (isMarked) {
      delete updatedMarkedDates[localDate];
    } else {
      updatedMarkedDates[localDate] = {
        marked: true,
        dotColor: "red",
        selectedColor: "blue",
      };
    }

    try {
      await AsyncStorage.setItem(
        `${storageKey}-${markedDatesKey}`,
        JSON.stringify(updatedMarkedDates)
      );

      this.setState({ markedDates: updatedMarkedDates });
    } catch (e) {}
  };

  retrieveMarkedDates = async () => {
    try {
      const markedDates = JSON.parse(
        await AsyncStorage.getItem(`${storageKey}-${markedDatesKey}`)
      );

      if (markedDates !== null) {
        this.setState({ markedDates });
      }
    } catch (e) {}
  };

  render() {
    const {
      date,
      markedDates,
      showWorkCalendar,
      showHolidayCalendar,
    } = this.state;
    const localDate = date.toLocaleDateString("lt-LT");

    return (
      <View style={styles.container}>
        <Image
          style={styles.background}
          source={backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.top}>
          <View style={{ width: "25%", alignItems: "flex-start" }}>
            <TouchableOpacity
              onPress={this.changeDay}
              style={styles.arrowContainer}
            >
              <Image
                source={prevArrow}
                resizeMode="contain"
                style={styles.arrow}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.date}
            onPress={this.toggleCalendar.bind(this, "showWorkCalendar")}
          >
            <Text style={{ fontWeight: "bold" }}>{localDate}</Text>
          </TouchableOpacity>
          <View style={{ width: "25%", alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={this.changeDay.bind(this, "next")}
              style={styles.arrowContainer}
            >
              <Image
                source={nextArrow}
                resizeMode="contain"
                style={styles.arrow}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.itemContainer}>
          <View style={{ height: workingHours.length * 100 + 40 }}>
            {this.renderWorkingHours()}
            <View style={styles.clientContainer}>{this.renderClients()}</View>
          </View>
        </ScrollView>
        <View style={styles.bottom}>
          <Button title="Pridėti" onPress={this.onAdd} />
        </View>
        {showWorkCalendar && (
          <View style={styles.calendar}>
            <Calendar
              onDayPress={this.onDayPress}
              markedDates={{
                ...markedDates,
                [localDate]: {
                  ...markedDates[localDate],
                  selected: true,
                  selectedColor: "blue",
                },
              }}
            />
            <TouchableHighlight
              onPress={this.switchToHolidayCalendar}
              style={styles.switchCalendarButton}
              underlayColor="#2f63b7"
            >
              <Text style={{ color: "#fff" }}>Nedarbo dienų kalendorius</Text>
            </TouchableHighlight>
            <Button
              title="Uždaryti"
              onPress={this.toggleCalendar.bind(this, "showWorkCalendar")}
            />
          </View>
        )}
        {showHolidayCalendar && (
          <View style={{ ...styles.calendar, backgroundColor: "#333248" }}>
            <Calendar
              onDayPress={this.onHolidayPress}
              markedDates={{
                ...markedDates,
                [localDate]: {
                  ...markedDates[localDate],
                  selected: true,
                  selectedColor: "blue",
                },
              }}
              theme={{
                calendarBackground: "#333248",
                monthTextColor: "#fff",
                dayTextColor: "#fff",
              }}
            />
            <Button
              title="Uždaryti"
              onPress={this.toggleCalendar.bind(this, "showHolidayCalendar")}
            />
          </View>
        )}
      </View>
    );
  }
}

export default Intro;

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  container: {
    height: "100%",
  },
  top: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 15,
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
  },
  date: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  arrowContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  arrow: {
    height: 20,
  },
  listItem: {
    position: "relative",
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#f4f4f4",
    borderRadius: 4,
    opacity: 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
  },
  listItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemTime: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  textMargin: {
    marginBottom: 2,
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
    backgroundColor: "#fff",
  },
  switchCalendarButton: {
    backgroundColor: "#4286f4",
    alignSelf: "center",
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 25,
    paddingRight: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
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
    shadowOpacity: 0.2,
  },
  hourContainer: {
    borderWidth: 1,
    borderColor: "#333",
    height: 100,
  },
  hourText: {
    fontWeight: "bold",
    color: "#333",
    padding: 5,
  },
  hourMidLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: "100%",
    height: 1,
    backgroundColor: "#333",
  },
  hourButton: {
    position: "absolute",
    left: 5,
    bottom: 5,
    width: 20,
    height: 20,
  },
  hourButtonIcon: {
    width: "100%",
    height: "100%",
  },
  itemContainer: {
    flexGrow: 0,
    height: "85%",
    paddingTop: 20,
    paddingBottom: 200,
  },
  clientContainer: {
    position: "absolute",
    left: "20%",
    width: "80%",
  },
});
