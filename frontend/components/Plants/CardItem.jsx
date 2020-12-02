/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import {
  Alert,
  ViewPropTypes,
  View,
} from 'react-native';
import { PropTypes } from 'prop-types';
import {
  Button, Card, Icon, Layout, Spinner, Text,
} from '@ui-kitten/components';
import * as ImagePicker from 'expo-image-picker';
import AddMyPlantDialog from './AddMyPlantDialog';
import PlantImage from './PlantImage';

const { getMyPlants, updateMyPlant, removeFromMyPlants } = require('../../api/myplants');
const { isFavorite, addToFavorites, removeFromFavorites } = require('../../api/favoritePlants');

class CardItem extends React.Component {
  constructor(props) {
    super(props);
    const { styles } = props;

    if (styles.image === undefined) {
      styles.image = CardItem.defaultProps.styles.image;
    }
    if (styles.cardFooter === undefined) {
      styles.cardFooter = CardItem.defaultProps.styles.cardFooter;
    }
    if (styles.button === undefined) {
      styles.button = CardItem.defaultProps.styles.button;
    }
    if (styles.card === undefined) {
      styles.card = CardItem.defaultProps.styles.card;
    }

    this.state = {
      favorited: undefined,
      owned: undefined,
      showAddDialog: false,
      imageRefreshCounter: 0,
      imageUploading: false,
    };

    this.startChangePicture = this.startChangePicture.bind(this);
    this.toggleOwned = this.toggleOwned.bind(this);
    this.toggleFavorited = this.toggleFavorited.bind(this);
  }

  componentDidMount() {
    const { plant } = this.props;
    const itemThis = this;
    isFavorite(plant.plantID)
      .then((isFavResult) => {
        itemThis.setState({ favorited: isFavResult });
      }).catch((error) => {
        console.error(`Failed to determine favorite status of plant ID ${plant.plantID} due to an error: ${error}.`);
      });

    getMyPlants()
      .then((myPlants) => {
        itemThis.setState({
          owned: myPlants.filter((cur) => cur.plantID === plant.plantID).length,
        });
      }).catch((error) => {
        console.error(`Failed to determine ownership status of plant ID ${plant.plantID} due to an error: ${error}.`);
      });
  }

  startChangePicture() {
    const { plant } = this.props;
    const { imageRefreshCounter } = this.state;
    ImagePicker.requestCameraPermissionsAsync().then((permissionResult) => {
      if (permissionResult.status !== 'granted') {
        Alert.alert('Sorry, you need to grant permissions before capturing a custom picture.');
      } else {
        ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
          base64: true,
        }).then((imageResult) => {
          if (!imageResult.cancelled) {
            this.setState({ imageUploading: true });
            updateMyPlant(plant.instanceID, { image: { base64: imageResult.base64 } })
              .then(() => {
                this.setState({
                  imageUploading: false,
                  imageRefreshCounter: imageRefreshCounter + 1,
                });
              }).catch((error) => {
                Alert.alert(
                  'Error',
                  'Failed to change this plant\'s picture.',
                  [
                    { text: 'OK' },
                  ],
                );
                console.error(`Failed to add a plant due to an error: ${error}`);
                this.setState({ imageUploading: false });
              });
          }
        }).catch((error) => {
          console.error(`Failed to select image from camera due to error: ${error}`);
          this.setState({ imageUploading: false });
        });
      }
    }).catch((error) => {
      console.error(`Failed to request permissions for camera due to error: ${error}`);
      this.setState({ imageUploading: false });
    });
  }

  toggleFavorited() {
    const { favorited } = this.state;
    const { plant, onRemoveFromFavorites } = this.props;
    if (!favorited) {
      addToFavorites(plant)
        .then(() => {
          this.setState({
            favorited: true,
          });
        }).catch((error) => {
          Alert.alert(
            'Network Error',
            'Failed to favorite this plant',
            [
              { text: 'OK' },
            ],
          );
          console.error(`Failed to favorite a plant due to an error: ${error}`);
        });
    } else {
      removeFromFavorites()
        .then(() => {
          this.setState({
            favorited: false,
          });
          if (onRemoveFromFavorites) {
            onRemoveFromFavorites(plant);
          }
        }).catch((error) => {
          Alert.alert(
            'Network Error',
            'Failed to remove this plant',
            [
              { text: 'OK' },
            ],
          );
          console.error(`Failed to remove a plant from favorites due to an error: ${error}`);
        });
    }
  }

  toggleOwned() {
    const { owned } = this.state;
    const { plant, onRemoveFromOwned } = this.props;
    if (!owned || onRemoveFromOwned === undefined) {
      this.setState({ showAddDialog: true });
    } else {
      removeFromMyPlants(plant.instanceID)
        .then(() => {
          this.setState({
            owned: owned - 1,
          });
          onRemoveFromOwned(plant);
        }).catch((error) => {
          Alert.alert(
            'Network Error',
            'Failed to remove this plant',
            [
              { text: 'OK' },
            ],
          );
          console.error(`Failed to remove a plant due to an error: ${error}`);
        });
    }
  }

  render() {
    const {
      plant,
      styles,
      onPressItem,
      allowChangePicture,
      onRemoveFromOwned,
    } = this.props;
    const {
      favorited,
      owned,
      showAddDialog,
      imageUploading,
      imageRefreshCounter,
    } = this.state;

    const saveIcon = (info) => (
      <Icon {...info} name={favorited ? 'heart' : 'heart-outline'} />
    );

    const collectionIcon = (info) => (
      <Icon {...info} name={onRemoveFromOwned === undefined ? 'plus-outline' : 'trash-outline'} />
    );

    const cameraIcon = (info) => (
      <Icon {...info} name="camera-outline" />
    );

    const renderItemHeader = (headerProps, info) => (
      <Layout {...headerProps}>
        <Text category="h6">
          {info}
        </Text>
      </Layout>
    );

    const cameraButton = allowChangePicture ? (
      <Button
        style={styles.button}
        status="primary"
        appearance="outline"
        accessoryLeft={cameraIcon}
        onPress={this.startChangePicture}
      />
    ) : undefined;

    const renderItemFooter = (footerProps) => (
      <Layout
        {...footerProps}
        style={styles.cardFooter}
      >
        <Button
          style={styles.button}
          status="primary"
          appearance={favorited ? 'filled' : 'outline'}
          accessoryLeft={saveIcon}
          onPress={this.toggleFavorited}
        />
        <Button
          style={styles.button}
          status="primary"
          appearance={(owned && onRemoveFromOwned === undefined) ? 'filled' : 'outline'}
          accessoryLeft={collectionIcon}
          onPress={this.toggleOwned}
        />
        {cameraButton}
      </Layout>
    );

    return (
      <View>
        <AddMyPlantDialog
          visible={showAddDialog}
          plant={plant}
          name={plant.name}
          plantID={plant.plantID}
          onSubmit={() => this.setState({ showAddDialog: false })}
          onCancel={() => this.setState({ showAddDialog: false })}
        />
        <Card
          key={plant.plantID}
          style={styles.card}
          status="success"
          header={(headerProps) => renderItemHeader(headerProps, plant.name)}
          footer={renderItemFooter}
          onPress={() => { onPressItem(plant); }}
        >
          {imageUploading
            ? (<Spinner />)
            : (
              <PlantImage
                sourceURL={plant.image.sourceURL}
                authenticationRequired={plant.image.authenticationRequired}
                style={styles.image}
                imageRefreshCounter={imageRefreshCounter}
              />
            )}
        </Card>
      </View>
    );
  }
}

CardItem.propTypes = {
  plant: PropTypes.object.isRequired,
  onPressItem: PropTypes.func.isRequired,
  onRemoveFromOwned: PropTypes.func,
  onRemoveFromFavorites: PropTypes.func,
  allowChangePicture: PropTypes.bool,
  styles: PropTypes.objectOf(ViewPropTypes.style),
};

CardItem.defaultProps = {
  styles: {
    card: {
      marginVertical: 10,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    button: {
      margin: 3,
      width: 1,
      height: 3,
      flex: 0.5,
    },
    image: {
      height: 300,
    },
  },
  onRemoveFromOwned: undefined,
  onRemoveFromFavorites: undefined,
  allowChangePicture: false,
};

export default CardItem;
