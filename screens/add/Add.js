import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  PickerIOS,
  Button,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storageKey, workingHours } from "../common";
import { backgroundImage } from "../../assets";

export default class Add extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      phone: "+3706",
      service: "Korekcija",
      date: props.route.params.date,
      duration: "01:00",
      hours: props.route.params.hours || "07",
      minutes: "00",
      serviceFocused: false,
      durationFocused: false,
      dateFocused: false,
    };
  }

  static navigationOptions = {
    title: "Pridėti",
  };

  inputs = [];

  onChange = (key, value) => {
    this.setState({ [key]: value });
  };

  togglePicker = (key) => {
    const { serviceFocused, durationFocused, dateFocused } = this.state;

    this.inputs.forEach((input) => input && input.blur());

    switch (key) {
      case "service":
        this.setState(() => ({
          serviceFocused: !serviceFocused,
          durationFocused: false,
          dateFocused: false,
        }));
        break;
      case "duration":
        this.setState(() => ({
          durationFocused: !durationFocused,
          serviceFocused: false,
          dateFocused: false,
        }));
        break;
      case "date":
        this.setState(() => ({
          dateFocused: !dateFocused,
          serviceFocused: false,
          durationFocused: false,
        }));
        break;
      default:
        return;
    }
  };

  renderPickerItems = (values) => {
    return values.map((value) => (
      <PickerIOS.Item key={value} label={value} value={value} />
    ));
  };

  renderServices = () => {
    return this.renderPickerItems([
      "Korekcija",
      "Ilgalaikis lakavimas",
      "Nagų priauginimas",
      "Pedikiūras",
      "Kojų ilgalaikis lakavimas",
    ]);
  };

  renderDurations = () => {
    return this.renderPickerItems([
      "01:00",
      "01:30",
      "02:00",
      "02:30",
      "03:00",
    ]);
  };

  renderHours = () => {
    return this.renderPickerItems(workingHours);
  };

  renderMinutes = () => {
    return this.renderPickerItems([
      "00",
      "05",
      "10",
      "15",
      "20",
      "25",
      "30",
      "35",
      "40",
      "45",
      "50",
      "55",
    ]);
  };

  getClients = async () => {
    try {
      const clients = await AsyncStorage.getItem(
        `${storageKey}-${this.state.date.toLocaleDateString("lt-LT")}`
      );

      return clients;
    } catch (e) {}
  };

  getTime = () => {
    const { hours, minutes } = this.state;

    return `${hours}:${minutes}`;
  };

  onFocus = () => {
    const { serviceFocused, durationFocused, dateFocused } = this.state;

    if (serviceFocused) this.setState({ serviceFocused: false });

    if (durationFocused) this.setState({ durationFocused: false });

    if (dateFocused) this.setState({ dateFocused: false });
  };

  onSubmit = async () => {
    const { date, phone, name, duration, service } = this.state;
    const time = this.getTime();
    const clients = JSON.parse(await this.getClients()) || {};

    try {
      await AsyncStorage.setItem(
        `${storageKey}-${date.toLocaleDateString("lt-LT")}`,
        JSON.stringify({
          ...clients,
          [time]: {
            key: time,
            time,
            phone,
            name,
            duration,
            service,
            confirmed: false,
          },
        })
      );

      this.props.navigation.goBack();
    } catch (e) {}
  };

  render() {
    const {
      name,
      phone,
      duration,
      hours,
      minutes,
      service,
      date,
      serviceFocused,
      durationFocused,
      dateFocused,
    } = this.state;
    const time = this.getTime();

    return (
      <View>
        <Image
          style={styles.background}
          source={backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.container}>
          <View style={{ alignItems: "flex-end" }}>
            <Button title="Išsaugoti" onPress={this.onSubmit} />
          </View>
          <TextInput
            onChangeText={this.onChange.bind(this, "name")}
            onFocus={this.onFocus}
            value={name}
            autoFocus={true}
            autoCapitalize="words"
            style={styles.input}
            placeholder="Vardas"
            ref={(component) => (this.inputs = [...this.inputs, component])}
          />
          <TextInput
            onChangeText={this.onChange.bind(this, "phone")}
            onFocus={this.onFocus}
            value={phone}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
            placeholder="Telefonas"
            ref={(component) => (this.inputs = [...this.inputs, component])}
          />
          <View style={{ position: "relative" }}>
            <TextInput
              value={service}
              autoCapitalize="sentences"
              style={styles.input}
              placeholder="Paslauga"
              editable={false}
            />
            <View style={styles.inputButton}>
              <Button
                title={serviceFocused ? "Uždaryti" : "Keisti"}
                onPress={this.togglePicker.bind(this, "service")}
              />
            </View>
          </View>
          <View style={{ position: "relative" }}>
            <TextInput
              value={`Trukmė ${duration}`}
              style={styles.input}
              placeholder="Trukmė"
              editable={false}
            />
            <View style={styles.inputButton}>
              <Button
                title={durationFocused ? "Uždaryti" : "Keisti"}
                onPress={this.togglePicker.bind(this, "duration")}
              />
            </View>
          </View>
          <View style={{ position: "relative" }}>
            <TextInput
              value={`${date.toLocaleDateString("lt-LT")} - ${time}`}
              style={styles.input}
              placeholder="Data"
              editable={false}
            />
            <View style={styles.inputButton}>
              <Button
                title={dateFocused ? "Uždaryti" : "Keisti"}
                onPress={this.togglePicker.bind(this, "date")}
              />
            </View>
          </View>
          {serviceFocused && (
            <PickerIOS
              selectedValue={service}
              onValueChange={this.onChange.bind(this, "service")}
              style={{ width: "100%" }}
            >
              {this.renderServices()}
            </PickerIOS>
          )}
          {durationFocused && (
            <PickerIOS
              selectedValue={duration}
              onValueChange={this.onChange.bind(this, "duration")}
              style={{ width: "100%" }}
            >
              {this.renderDurations()}
            </PickerIOS>
          )}
          {dateFocused && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <PickerIOS
                selectedValue={hours}
                onValueChange={this.onChange.bind(this, "hours")}
                style={{ width: "50%" }}
              >
                {this.renderHours()}
              </PickerIOS>
              <PickerIOS
                selectedValue={minutes}
                onValueChange={this.onChange.bind(this, "minutes")}
                style={{ width: "50%" }}
              >
                {this.renderMinutes()}
              </PickerIOS>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  container: {
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    height: "100%",
  },
  input: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 10,
    borderRadius: 4,
  },
  inputButton: {
    position: "absolute",
    top: -4,
    right: 20,
  },
});
