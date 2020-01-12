import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';


export default class App extends React.Component {
  baseURL = 'https://vision.googleapis.com';

  state = {
    hasPermission: null,
    cameraType: Camera.Constants.Type.back,
    photoTaken: false,
    googleResults: []
  }

  async componentDidMount() {
    this.getPermissionAsync()
    MediaLibrary.requestPermissionsAsync();
  }

  getPermissionAsync = async () => {
    // Camera Permission
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasPermission: status === 'granted' });
  }

  handleCameraType=()=>{
    const { cameraType } = this.state;

    this.setState({cameraType:
      cameraType === Camera.Constants.Type.back
      ? Camera.Constants.Type.front
      : Camera.Constants.Type.back
    });
  }

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved, base64: true });
    }
  }

  onPictureSaved = photo => {
    // console.log(photo.uri);
    MediaLibrary.createAssetAsync(photo.uri);
    // this.sendToGoogle()
    //   .then((response) => {
    //     this.setState({ googleResults: response });
    //     this.setState({ photoTaken: true });
    //   });
    console.log(JSON.stringify(photo.base64.substring(0,200)));
    this.sendToGoogle(photo.base64)
    .then((response) => {
      this.setState({ googleResults: response });
      this.setState({ photoTaken: true });
    });
  }

  sendToGoogle = async function(base64Image) {
    try {
      console.log("THE URL IS: " + this.baseURL);
      let response = await fetch(this.baseURL + '/v1/images:annotate?key=AIzaSyC8xIFVpW4OKIP_cMlWYLK7VlL_SQqx1Dw', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "requests": [
              {
                "image": {
                  "content": base64Image
                },
                "features": [
                  // {
                  //   "maxResults": 10,
                  //   "type": "TYPE_UNSPECIFIED"
                  // },
                  // {
                  //   "maxResults": 10,
                  //   "type": "PRODUCT_SEARCH"
                  // },
                  {
                    "maxResults": 10,
                    "type": "OBJECT_LOCALIZATION"
                  }
                ]
              }
            ]
        })
      });
      console.log("waiting...");
      let responseJson = await response.json();
      console.log("RESPONSE JSON IS: ");
      console.log(JSON.stringify(responseJson));
      return responseJson.responses[0].localizedObjectAnnotations;
    } catch (error) {
      console.error(error);
    }
  }

  render(){
    if(this.state.photoTaken){
      return (
        <View>
          <Text>We found:</Text>
          { this.state.googleResults.map((annotation, index) => { return (<Text key={index} >{annotation.name}</Text>);}) }
        </View>
      );
    }
    // check permissions
    const { hasPermission } = this.state;
    if (hasPermission === null) {
      return <View />;
    } else if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    // render app
    return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} type={this.state.cameraType}  ref={ref => {this.camera = ref}}>
            <View style={{flex:1, flexDirection:"row",justifyContent:"space-between",margin:30}}>
              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
                onPress={()=>this.takePicture()}
                >
                <Text>Take Photo</Text>
              </TouchableOpacity>

              {/* Switch camera */}
              {/* <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
                onPress={()=>this.handleCameraType()}
                >
                <Text>Switch Camera</Text>
              </TouchableOpacity> */}
            </View>
          </Camera>
      </View>
    );
  }
}
