import React, { Component } from 'react';
import './App.css';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imageLinkForm/ImageLinkForm';
import Rank from './components/rank/Rank';
import ParticlesBg from 'particles-bg'
import FaceRecognition from './components/faceRecognition/FaceRecognition';
import SignIn from './components/signIn/SignIn';
import Register from './components/register/Register';

const initialState = {
  input: '',
  imageURL: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() { // allows you to use states
    super();
    this.state = initialState;
  }

loadUser = (data) => {
  this.setState({user: {
    id: data.id,
    name: data.name,
    email: data.email,
    entries: data.entries,
    joined: data.joined
  }})
}

  calculateFaceLocation = (data) => {
    const clarafaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height)
    return {
      leftCol: clarafaiFace.left_col * width,
      topRow: clarafaiFace.top_row * height,
      rightCol: width - (clarafaiFace.right_col * width),
      bottomRow: height - (clarafaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box })
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {
    this.setState({ imageURL: this.state.input })

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // In this section, we set the user authentication, user and app ID, model details, and the URL
    // of the image we want as an input. Change these strings to run your own example.
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const url1 = 'https://smart-brain-server-q0yc.onrender.com/api-data';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON'
      }
    }

    fetch(url1, options)
    .then(res => res.json())
    .then(data => {
      const PAT = data.pat;
      const USER_ID = data.userID;
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const APP_ID = "my-first-application";
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
    const IMAGE_URL = this.state.input;

    ///////////////////////////////////////////////////////////////////////////////////
    // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
    ///////////////////////////////////////////////////////////////////////////////////

    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": IMAGE_URL
            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
      },
      body: raw
    };

    //console.log(raw);

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id
    // https://samples.clarifai.com/face-det.jpg
    // https://mcosmeticsurgery.com/wp-content/uploads/2022/06/what-is-the-golden-ratio-of-facial-aesthetics.jpeg

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result) {
          fetch('https://smart-brain-server-q0yc.onrender.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(res => res.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count }))
          })
          .catch(console.log);
        }
        this.displayFaceBox(this.calculateFaceLocation(result))
      })
      .catch(error => console.log('error', error));
    })
  }
  

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({initialState})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }


  render() {
    const { isSignedIn, imageURL, route, box } = this.state
    return (
      <div className="App">
        <ParticlesBg type="cobweb" bg={true} num={150} color={"#FFFFFF"} className="particles" />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {this.state.route === 'home' 
        ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries ={this.state.user.entries}/>
            <ImageLinkForm
            onInputChange={this.onInputChange}
            onButtonSubmit={this.onButtonSubmit}
            /> 
            <FaceRecognition imageURL={imageURL} box={box} />
          </div>
          : (
            route === 'signin' 
            ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/> 
            : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
          )
        }
      </div>
    );
  }
}

export default App;



/*
IMPORTANT
PAT: db53c70a285a4bdc921b3271456fde47
USER ID: adrian_tomin69
APP ID: my-first-application
*/

// // Old Way:
// // app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)

// // New Way:
// app.models
//   .predict(
//     {
//       id: 'face-detection',
//       name: 'face-detection',
//       version: '6dc7e46bc9124c5c8824be4822abe105',
//       type: 'visual-detector',
//     }, this.state.input)