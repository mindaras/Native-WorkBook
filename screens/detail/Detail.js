import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  PickerIOS,
  Button,
  Modal,
  Text,
  TouchableHighlight,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Communications from "react-native-communications";
import { storageKey, workingHours } from "../common";
import { backgroundImage } from "../../assets";

export default class Detail extends Component {
  constructor(props) {
    super(props);

    const [hours, minutes] = props.route.params.time.split(":");

    this.state = {
      hours,
      minutes,
      name: this.props.route.params.name,
      phone: this.props.route.params.phone,
      service: this.props.route.params.service,
      date: new Date(this.props.route.params.date),
      duration: this.props.route.params.duration,
      confirmed: this.props.route.params.confirmed,
      serviceFocused: false,
      durationFocused: false,
      dateFocused: false,
      modalVisible: false,
    };
  }

  static navigationOptions = {
    title: "Detalės",
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
    const { date, phone, name, duration, service, confirmed } = this.state;
    const time = this.getTime();
    const clients = JSON.parse(await this.getClients()) || {};

    delete clients[this.props.route.params.time];

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
            confirmed,
          },
        })
      );

      this.props.navigation.goBack();
    } catch (e) {}
  };

  removeClient = async () => {
    const time = this.props.route.params.time;
    const clients = JSON.parse(await this.getClients()) || {};

    delete clients[time];

    try {
      await AsyncStorage.setItem(
        `${storageKey}-${this.state.date.toLocaleDateString("lt-LT")}`,
        JSON.stringify(clients)
      );

      this.toggleModal();
      this.props.navigation.goBack();
    } catch (e) {}
  };

  toggleModal = () => {
    this.setState((prevState) => ({ modalVisible: !prevState.modalVisible }));
  };

  sendReminder = () => {
    const { phone, date } = this.state;
    const time = this.getTime();

    Communications.text(phone, `message realted to ${date} and ${time}`);
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
      modalVisible,
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
          <View>
            <View style={{ alignItems: "flex-end" }}>
              <Button title="Atnaujinti" onPress={this.onSubmit} />
            </View>
            <TextInput
              onChangeText={this.onChange.bind(this, "name")}
              onFocus={this.onFocus}
              value={name}
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
            <TouchableHighlight
              onPress={this.sendReminder}
              style={styles.reminderButton}
              underlayColor="#2f63b7"
            >
              <Text style={{ color: "#fff" }}>Siųsti priminimą</Text>
            </TouchableHighlight>
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
          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
          >
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                Ar tikrai norite pašalinti {name}?
              </Text>
              <View style={styles.modalButtons}>
                <View style={{ marginRight: 20 }}>
                  <Button
                    title="Atšaukti"
                    onPress={this.toggleModal}
                    color="red"
                  />
                </View>
                <Button
                  title="Patvirtinti"
                  onPress={this.removeClient}
                  color="green"
                />
              </View>
            </View>
          </Modal>
          <Button title="Pašalinti" onPress={this.toggleModal} color="red" />
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
    paddingBottom: 20,
    height: "100%",
    justifyContent: "space-between",
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
  reminderButton: {
    marginTop: 20,
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
  modal: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
