import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  PickerIOS,
  AsyncStorage,
  Button,
  Modal,
  Text
} from "react-native";
import { LinearGradient } from "expo";
import Communications from "react-native-communications";
import { Intro } from "../intro";

export default class Detail extends Component {
  constructor(props) {
    super(props);

    const { name, phone, service, date, time, confirmed } = props;

    this.state = {
      name,
      phone,
      service,
      date,
      time,
      confirmed,
      serviceFocused: false,
      dateFocused: false,
      modalVisible: false
    };
  }

  redirectToRoot = () => {
    this.props.navigator.push({
      component: Intro,
      title: "Klientai",
      passProps: { date: this.state.date }
    });
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
    const { date, time, phone, name, service, confirmed } = this.state;
    const clients = JSON.parse(await this.getClients()) || {};

    delete clients[this.props.time];

    try {
      await AsyncStorage.setItem(
        date.toLocaleDateString("lt-LT"),
        JSON.stringify({
          ...clients,
          [time]: { key: time, time, phone, name, service, confirmed }
        })
      );

      this.redirectToRoot();
    } catch (e) {
      console.log("error", e);
    }
  };

  removeClient = async () => {
    const clients = JSON.parse(await this.getClients()) || {};

    delete clients[this.props.time];

    try {
      await AsyncStorage.setItem(
        this.state.date.toLocaleDateString("lt-LT"),
        JSON.stringify(clients)
      );

      this.toggleModal();

      this.redirectToRoot();
    } catch (e) {}
  };

  toggleModal = () => {
    this.setState(prevState => ({ modalVisible: !prevState.modalVisible }));
  };

  sendReminder = () => {
    const { phone, date, time } = this.state;

    Communications.text(
      phone,
      `Message related to an appointment at ${date} ${time}`
    );
  };

  render() {
    const {
      name,
      phone,
      service,
      date,
      time,
      serviceFocused,
      dateFocused,
      modalVisible
    } = this.state;

    return (
      <View>
        <LinearGradient
          colors={["#4CA1AF", "#C4E0E5"]}
          style={styles.container}
        >
          <View>
            <View style={{ alignItems: "flex-end" }}>
              <Button title="Atnaujinti" onPress={this.onSubmit} />
            </View>
            <TextInput
              onChangeText={this.onChange.bind(this, "name")}
              value={name}
              autoCapitalize="words"
              style={styles.input}
              placeholder="Vardas"
            />
            <TextInput
              onChangeText={this.onChange.bind(this, "phone")}
              value={phone}
              keyboardType="numbers-and-punctuation"
              style={styles.input}
              placeholder="Telefonas"
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
                  onPress={this.onFocusToggle.bind(this, "service")}
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
                  onPress={this.onFocusToggle.bind(this, "date")}
                />
              </View>
            </View>
            <View style={{ marginTop: 10 }}>
              <Button
                title="Siųsti priminimą"
                onPress={this.sendReminder}
                color="yellow"
              />
            </View>
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
                <PickerIOS.Item label="Manikiūras" value="Manikiūras" />
                <PickerIOS.Item label="Pedikiūras" value="Pedikiūras" />
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
    paddingTop: 100,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 20,
    height: "100%",
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
