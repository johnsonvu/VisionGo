import React from 'react';
import { Text, View, TouchableOpacity, ToastAndroid } from 'react-native';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { Dialogflow_V2 } from "react-native-dialogflow"
import * as FileSystem from 'expo-file-system';
import * as Google from 'expo-google-app-auth';


export default class App extends React.Component {
  recordingOptions = {
    android: {
      extension: '.3gp',
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_WB,
      sampleRate: 16000,
      numberOfChannels: 2,
      bitRate: 128000
    },
    ios: {
      extension: '.caf',
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false
    },
  };
  recording = null;
  constructor(props) {
    super(props);
    // this.recording = null;
    // this.client = new Speech.SpeechClient();

    Dialogflow_V2.setConfiguration(
        "dev-704@optimum-legacy-264900.iam.gserviceaccount.com",
        '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnR6ORxiTbTf5H\nbl2gmH1FXwHS4n7R/jpZCCxheIfyz/BbP2+/CIVEpcdu/lWufGBUysFM8t/tMJVE\nQSpnBXTVdmCinFDKhO/ifNHwURYNesDiDzDupCemRvLWYnNf0mQMHz/hfrhR0Khf\nQLIoY2GvQHdUqkiklnBPoFX5LbdzLlObI0rZVWHNSNYim3EQ6lE7EykJj5hCBqvc\n0X5mJttUeLCbqLt2bP32BsjnNUDhODRc0wOt9oTd+xmS4qPRdS2T+R7ERoZAll5i\nqK5thtXWgjhB1bRaDFk1y8AlFdXIylFPx4u0K22PMQfOkv9nmdaEhX9/1ZlAMx5K\nr9kRUuwfAgMBAAECggEAAXjrHXqEfYeotXaTuA5Pip+aSQG5rbMn+VD4mbJcDqI6\nPTCy6kKyxZa99CH58sC2f63kg1RfQzEFHKYu2jGdRHm3wlv6MWYiebhb3Vp2sA9a\nCO4ATMFrdeu0RyMeXS62tw1EByyR27/TPjoNYgyfN1HWcGDVUIQ1yzBKlsMKanxE\nv2Z6rNmu1RlZTUQNiTHqoYVyjBV+j8LH4RrWn6r5k+8mogl6T4WuwDWaYkkX7ldU\nPhcL4w6yy9xQH1JoZfpqmnjnEcQviJopcXJGASExFypdLIh5qHXL1f/FoLz1jtRO\nlldLzUEPL54gZJ8rgKI4glX/wVdYqnqs2fmCHZ2mrQKBgQDelhgT4ctLYHqhnWtB\nNm0xPz3CG5t4Tc0+nRWsYR/2Gedadw4h/cgrFZ08ab9TG4krbQGBCNE9dnMxnYKX\nqlrplV1vhqcMnNpjqBqqkkVgSjF0uyH/RGVwXqNmVhrJuAmb1hZCuVaU15Qhliyo\n2lGegM8aAmmHgaQliFodd8p2NQKBgQDAZCOEMLR2rdDpd36uFEc0y8tP6WxUpzh6\nGJUbsCSYV+ezQhFPbiS9U371M/KKiZS9TeyXrfvZKtRSVlUmiR4AcCUYymrAX01N\n97QOVC3CnHXkfLlkV1rjT05jMqZMJAtOAPTA7p1S5/8fb0Fflsx7hXJ0R8A9nDv7\nWv2+8niTgwKBgQCkVQoHu788skk3gqJJ7iXlovw0j+9TfZVXceAreTWAm5VMG/PK\nMrSS4o1IqgYAFKdL8VmX62uXxhi7+78LvFEMfSMTkMVKMY+m3dh6MC2aLoye0v4B\nmXyO3sAicNWsMfyeGgwrTOxYTWTm+xmTvENgE1dTq44/5f3LXAS0FtnaNQKBgGLR\njKSTV741nT6tz/WeGMz3eGB9ZtU8ZvfftIbaPJG7ZRlf8AA6dMiCII3VttiNvkZV\nxhZKmTd8lj4MdgQrHavf7k4Dej2BNfW8K1HIzxBMyQkpPxhY/igPThYJp/0n7l6M\ngyqt5UT2QMZmoM92Z2Vyr80mJYn/u5dprzfq1x/9AoGAZUDWKolMc+Clq/zGdYPi\nDzWNGSvidwJgOMyyOvcIhwSZBkW0+M1MVwefPK1GixVYOQdqfA4H+RxAxgy9m9uP\nQsX5O2lOpoipVebNBnTjOepkHUFsRadxTfPC9uwjWySKUQAetuLX9TwG+tFcQe9A\n4ZnaFDx0gpZqluKU3EsbY7k=\n-----END PRIVATE KEY-----\n',
        Dialogflow_V2.LANG_ENGLISH,
        'optimum-legacy-264900'
    );

}

  state = {
    hasPermission: null,
    cameraType: Camera.Constants.Type.back,
    isRecording: false,
    goodToken: null,
  }

  async componentDidMount() {
    const { type, accessToken, user } = await Google.logInAsync({
      androidClientId: `211095085143-tshkqcvbua02lt0687k1msmk4kpv5tpt.apps.googleusercontent.com`,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/dialogflow'
      ]
    });

    if (type === 'success') {
      console.log(user);
      console.log(accessToken);
      this.setState({goodToken: accessToken });
    }

    this.getPermissionAsync()
    MediaLibrary.requestPermissionsAsync();
  }

  getPermissionAsync = async () => {
    // Camera Permission
    const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING);
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
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
    }
  }

  onPictureSaved = photo => {
    // console.log(photo.uri);
    MediaLibrary.createAssetAsync(photo.uri);
  }

  startRecording = async () => {
    console.log("RECORDING");
    this.setState({ isRecording: true });

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: true,
    });

    const recording = new Audio.Recording();
    try {
      await recording.prepareToRecordAsync(this.recordingOptions);
      
      console.log("RECORDING2");
      await recording.startAsync();
    } catch (error) {
      console.log(error);
      this.stopRecording();
    }

    this.recording = recording;
  }

  stopRecording = async () => {
    this.setState({ isRecording: false });
    try {
      await this.recording.stopAndUnloadAsync();

      // copy to gallery
      // MediaLibrary.createAssetAsync(this.recording.getURI());

      let file = await FileSystem.readAsStringAsync(this.recording.getURI(), { encoding: FileSystem.EncodingType.Base64 });

      // const audioConverted = { content: file };
      console.log("My audio file: ");
      console.log(JSON.stringify(file));

      const request = {
        queryInput: {
          audioConfig: {
            languageCode: "en-us",
            audioEncoding: "AUDIO_ENCODING_AMR_WB",
            sampleRateHertz: 16000
          }
        },
        inputAudio: file
      };
      
      // let response = await fetch('https://dialogflow.googleapis.com/v2/projects/optimum-legacy-264900/agent/sessions/123456789:detectIntent', {
      let response = await fetch('https://dialogflow.googleapis.com/v2beta1/projects/nwhacks2020-264900/agent/sessions/123456789:detectIntent', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.state.goodToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log("response:");
      console.log(JSON.stringify(response));
      let responseJson = await response.json();

      console.log("Done");
      console.log("Response: ");
      console.log(JSON.stringify(responseJson));


      // .then((res) => {
      //   console.log("SUCCESS");
      //   res.json()
      //   .then((data) => {
      //     console.log(data);
      //   })
      // })
      // .catch((err) => {
      //   console.log(err);
      // });

      // RNFS.readFile(this.recording.getURI(), 'base64')
      // .then(async (convertedFile) =>{
      //   // console.log(res);

      //   const audioConverted = {content: convertedFile };

      //   const config = {
      //     encoding: encoding,
      //     sampleRateHertz: sampleRateHertz,
      //     languageCode: languageCode,
      //     model: model,
      //   };

      //   const request = {
      //     config: config,
      //     audio: audioConverted,
      //   };

      //   // Detects speech in the audio file
      //   // const [response] = await this.client.recognize(request);
      //   // const transcription = response.results
      //   //   .map(result => result.alternatives[0].transcript)
      //   //   .join('\n');
      //   // console.log(`Transcription: `, transcription);
      // });

    } catch (error) {
      console.log(error);
    }
  }

  render(){
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
        <Text>
          {this.state.isRecording ? 'Recording...' : 'Start recording'}
        </Text>
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

              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}

                onPressIn={this.startRecording}
                onPressOut={this.stopRecording}

                >
                <Text>
                  {this.state.isRecording ? 'Recording...' : 'Start recording'}
                </Text>
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

module.exports = App;