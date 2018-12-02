import React, { Component } from "react";
import { View, StyleSheet, TextInput, PickerIOS, Button } from "react-native";
import { LinearGradient } from "expo";
import { AsyncStorage } from "react-native";
import { Intro } from "../intro";

export default class Add extends Component {
  state = {
    name: "",
    phone: "+3706",
    service: "Ilgalaikis nagų lakavimas",
    date: this.props.date,
    time: "08:00",
    serviceFocused: false,
    dateFocused: false
  };

  onChange = (key, value) => {
    this.setState({ [key]: value });
  };

  onFocusToggle = key => {
    const { serviceFocused, dateFocused } = this.state;

    switch (key) {
      case "service":
        this.setState(() => ({ serviceFocused: !serviceFocused }));
        break;
      case "date":
        this.setState(() => ({ dateFocused: !dateFocused }));
        break;
      default:
        return;
    }
  };

  renderTimeItems = () => {
    const values = [];
    let i = 0;

    while (i < 24) {
      let j = 0;

      while (j <= 55) {
        const hour = i.toString().length < 2 ? `0${i}` : i;
        const second = j.toString().length < 2 ? `0${j}` : j;

        values.push(`${hour}:${second}`);

        j += 5;
      }

      i++;
    }

    return values.map(value => (
      <PickerIOS.Item key={value} label={value} value={value} />
    ));
  };

  getClients = async () => {
    try {
      const clients = await AsyncStorage.getItem(
        this.state.date.toLocaleDateString("lt-LT")
      );

      return clients;
    } catch (e) {}
  };

  onSubmit = async () => {
    const { date, time, phone, name, service } = this.state;
    const clients = JSON.parse(await this.getClients()) || {};

    try {
      await AsyncStorage.setItem(
        date.toLocaleDateString("lt-LT"),
        JSON.stringify({
          ...clients,
          [time]: { key: time, time, phone, name, service, confirmed: false }
        })
      );

      this.props.navigator.push({
        component: Intro,
        title: "Klientai"
      });
    } catch (error) {}
  };

  render() {
    const {
      name,
      phone,
      service,
      date,
      time,
      serviceFocused,
      dateFocused
    } = this.state;

    return (
      <View>
        <LinearGradient
          colors={["#4CA1AF", "#C4E0E5"]}
          style={styles.container}
        >
          <View style={{ alignItems: "flex-end" }}>
            <Button title="Save" onPress={this.onSubmit} />
          </View>
          <TextInput
            onChangeText={this.onChange.bind(this, "name")}
            value={name}
            autoFocus={true}
            autoCapitalize="words"
            style={styles.input}
            placeholder="Telefonas"
          />
          <TextInput
            onChangeText={this.onChange.bind(this, "phone")}
            value={phone}
            style={styles.input}
            placeholder="Vardas"
          />
          <TextInput
            onFocus={this.onFocusToggle.bind(this, "service")}
            onBlur={this.onFocusToggle.bind(this, "service")}
            value={service}
            autoCapitalize="sentences"
            style={styles.input}
            placeholder="Paslauga"
          />
          <TextInput
            onFocus={this.onFocusToggle.bind(this, "date")}
            onBlur={this.onFocusToggle.bind(this, "date")}
            value={`${date.toLocaleDateString("lt-LT")} - ${time}`}
            style={styles.input}
            placeholder="Data"
          />
          {serviceFocused && (
            <PickerIOS
              selectedValue={service}
              onValueChange={this.onChange.bind(this, "service")}
              style={{ width: "100%" }}
            >
              <PickerIOS.Item
                label="Ilgalaikis nagų lakavimas"
                value="Ilgalaikis nagų lakavimas"
              />
              <PickerIOS.Item label="Manikiuras" value="Manikiuras" />
              <PickerIOS.Item label="Pedikiuras" value="Pedikiuras" />
            </PickerIOS>
          )}
          {dateFocused && (
            <PickerIOS
              selectedValue={time}
              onValueChange={this.onChange.bind(this, "time")}
              style={{ width: "100%" }}
            >
              {this.renderTimeItems()}
            </PickerIOS>
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
    height: "100%"
  },
  input: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 10,
    borderRadius: 4
  }
});
