import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  PickerIOS,
  AsyncStorage,
  Button,
  Modal,
  Text,
  TouchableOpacity
} from "react-native";
import { LinearGradient } from "expo";
import Communications from "react-native-communications";
import { Intro } from "../intro";
import { storageKey } from "../common";

export default class Detail extends Component {
  constructor(props) {
    super(props);

    const { name, phone, service, date, duration, time, confirmed } = props;
    const [hours, minutes] = time.split(":");

    this.state = {
      name,
      phone,
      service,
      date,
      duration,
      hours,
      minutes,
      confirmed,
      serviceFocused: false,
      durationFocused: false,
      dateFocused: false,
      modalVisible: false
    };
  }

  inputs = [];

  onChange = (key, value) => {
    this.setState({ [key]: value });
  };

  togglePicker = key => {
    const { serviceFocused, durationFocused, dateFocused } = this.state;

    this.inputs.forEach(input => input && input.blur());

    switch (key) {
      case "service":
        this.setState(() => ({
          serviceFocused: !serviceFocused,
          durationFocused: false,
          dateFocused: false
        }));
        break;
      case "duration":
        this.setState(() => ({
          durationFocused: !durationFocused,
          serviceFocused: false,
          dateFocused: false
        }));
        break;
      case "date":
        this.setState(() => ({
          dateFocused: !dateFocused,
          serviceFocused: false,
          durationFocused: false
        }));
        break;
      default:
        return;
    }
  };

  renderPickerItems = values => {
    return values.map(value => (
      <PickerIOS.Item key={value} label={value} value={value} />
    ));
  };

  renderServices = () => {
    return this.renderPickerItems([
      "Korekcija",
      "Ilgalaikis lakavimas",
      "Nagų priauginimas",
      "Pedikiūras",
      "Kojų ilgalaikis lakavimas"
    ]);
  };

  renderDurations = () => {
    return this.renderPickerItems([
      "01:00",
      "01:30",
      "02:00",
      "02:30",
      "03:00"
    ]);
  };

  renderHours = () => {
    return this.renderPickerItems([
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22"
    ]);
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
      "55"
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

    delete clients[this.props.time];

    try {
      await AsyncStorage.setItem(
        `${storageKey}-${date.toLocaleDateString("lt-LT")}`,
        JSON.stringify({
          ...clients,
          [time]: { key: time, time, phone, name, duration, service, confirmed }
        })
      );

      this.props.navigator.push({
        component: Intro,
        title: "Klientai",
        passProps: { date: this.state.date }
      });
    } catch (e) {}
  };

  removeClient = async () => {
    const { date, time } = this.props;
    const clients = JSON.parse(await this.getClients()) || {};

    delete clients[time];

    try {
      await AsyncStorage.setItem(
        `${storageKey}-${this.state.date.toLocaleDateString("lt-LT")}`,
        JSON.stringify(clients)
      );

      this.toggleModal();

      this.props.navigator.resetTo({
        component: Intro,
        title: "Klientai",
        passProps: {
          date: this.state.date,
          changed: `${date.toLocaleDateString("lt-LT")}-${time}`
        }
      });
    } catch (e) {}
  };

  toggleModal = () => {
    this.setState(prevState => ({ modalVisible: !prevState.modalVisible }));
  };

  sendReminder = () => {
    const { phone, date } = this.state;
    const time = this.getTime();

    Communications.text(
      phone,
      `Message related to an appointment at ${date} ${time}`
    );
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
      modalVisible
    } = this.state;
    const time = this.getTime();

    return (
      <View>
        <LinearGradient
          colors={["#22c1c3", "#fdbb2d"]}
          style={styles.container}
        >
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
              ref={component => (this.inputs = [...this.inputs, component])}
            />
            <TextInput
              onChangeText={this.onChange.bind(this, "phone")}
              onFocus={this.onFocus}
              value={phone}
              keyboardType="numbers-and-punctuation"
              style={styles.input}
              placeholder="Telefonas"
              ref={component => (this.inputs = [...this.inputs, component])}
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
            <TouchableOpacity
              onPress={this.sendReminder}
              style={styles.reminderButton}
            >
              <Text style={{ color: "#fff" }}>Siųsti priminimą</Text>
            </TouchableOpacity>
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
                  alignItems: "center"
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
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 20,
    height: "95%",
    justifyContent: "space-between"
  },
  input: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 10,
    borderRadius: 4
  },
  inputButton: {
    position: "absolute",
    top: -4,
    right: 20
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
    shadowOpacity: 0.2
  },
  modal: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  }
});
