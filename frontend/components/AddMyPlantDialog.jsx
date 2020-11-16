/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Alert, Text, View } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';
import {
  Select,
  SelectItem,
  Button,
  Spinner,
} from '@ui-kitten/components';
import Prompt from 'react-native-input-prompt';
import { PropTypes } from 'prop-types';
import { SERVER_ADDR } from '../server';

const { authFetch } = require('../auth');

class AddMyPlantDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCustomLocationPrompt: false,
      locations: undefined, // Initialized from fetch
      locationIndex: 0,
    };

    this.updateLocations = this.updateLocations.bind(this);
    this.prevVisible = false;
  }

  componentDidMount() {
    this.updateLocations();
  }

  componentDidUpdate() {
    const { visible } = this.props;
    if (visible !== this.prevVisible) {
      this.updateLocations();
      this.prevVisible = visible;
    }
  }

  updateLocations() {
    const distinctFilter = (cur, idx, arr) => arr.indexOf(cur) === idx;

    const listDialog = this;
    authFetch(`${SERVER_ADDR}/myplants/`) // TODO: Would like to do this fetch upon each dialog opening, so new data for locations can be updated
      .then((data) => {
        listDialog.setState({
          locations: data.map((cur) => cur.location).filter(distinctFilter),
        });
      }, (error) => {
        Alert.alert(
          'Network Error',
          'Failed to load plant location data',
          [
            { text: 'OK', onPress: listDialog.onCancel },
          ],
        );
        console.log(`Failed to find plant locations. Reason: ${error}`);
      });
  }

  submit() {
    const { plant, onSubmit, onCancel } = this.props;
    const { locations, locationIndex } = this.state;

    authFetch(`${SERVER_ADDR}/myplants`, 'POST', {
      plantID: plant.plantID,
      location: locations[locationIndex - 1],
      image: plant.image, // TODO: Use custom image if provided
    }).then(() => {
      onSubmit();
    }).catch((error) => {
      Alert.alert(
        'Network Error',
        'Failed to add this plant',
        [
          { text: 'OK', onPress: onCancel },
        ],
      );
      console.error(`Failed to add a plant due to an error: ${error}`);
    });
  }

  render() {
    const { locationIndex, locations, showCustomLocationPrompt } = this.state;
    const { visible, plant, onCancel } = this.props;

    const locationSelection = locations !== undefined ? (
      <Select
        placeholder="Select location..."
        value={locationIndex <= locations.length ? locations[locationIndex - 1] : 'Select location...'}
        selectedIndex={locationIndex}
        onSelect={(newIndex) => {
          if (Number(newIndex) === locations.length + 1) {
            this.setState({ showCustomLocationPrompt: true });
          } else {
            this.setState({ locationIndex: newIndex });
          }
        }}
      >
        { locations.map((loc) => (<SelectItem title={loc} key={loc} />)) }
        <SelectItem title="New Location..." />
      </Select>
    ) : <Spinner />;

    const customLocationPrompt = (
      <Prompt
        visible={showCustomLocationPrompt}
        title="Enter the new location name"
        placeholder="ex: Bedroom"
        onCancel={() => this.setState({ showCustomLocationPrompt: false })}
        onSubmit={(loc) => {
          locations.push(loc);
          this.setState({
            locations,
            locationIndex: locations.length,
            showCustomLocationPrompt: false,
          });
        }}
      />
    );

    return (
      <View>
        <Portal>
          {customLocationPrompt}
          <Dialog visible={visible} onDismiss={() => onCancel()}>
            <Dialog.Title>{`Add ${plant.plantName}`}</Dialog.Title>
            <Dialog.Content>
              <Text>Location</Text>
              {locationSelection}
              <Text />
              { /* TODO: Put 'custom image' form stuff here */ }
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => this.submit()}
                disabled={locationIndex < 1 || locationIndex > locations.length}
              >
                Add
              </Button>
              <Button onPress={() => onCancel()}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    );
  }
}

AddMyPlantDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  plant: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default AddMyPlantDialog;
