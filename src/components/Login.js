import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { NativeBaseProvider, Box, Center, Input, Button, Modal, ScrollView, useToast } from 'native-base';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config.json';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false); // State to track sign-in process
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const toast = useToast();
  const navigation = useNavigation();
  const apiUrl = config.API_URL;
  console.log("this is url", apiUrl);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.show({
        description: "Please enter both email and password",
        backgroundColor: "red.500",
        duration: 2000,
        placement: "top",
      });
      return;
    }
    setIsSigningIn(true); // Set state to indicate sign-in process has started
    setIsOverlayVisible(true); // Show overlay

    const trimmedEmail = email.trim();
    console.log(email);
    try {
      const userResponse = await axios.post(
        `${apiUrl}/findUserUsingEmail`,
        { email: trimmedEmail }
      );

      console.log("this is data new", userResponse.data);

      if (!userResponse.data) {
        toast.show({
          description: "User not found",
          backgroundColor: "red.500",
          duration: 2000,
          placement: "top",
        });
        return;
      }

      if (!userResponse.data.isVerified) {
        toast.show({
          description:
            "Please verify your email using the link received in your email address! If link is expired, signup using different email.",
          backgroundColor: "blue.300",
          duration: 5000,
          placement: "top",
          isClosable: true,
        });
        return; // Exit the function if the user is not verified
      }

      const { username, userType } = userResponse.data;
      console.log("this is username of login person", username);

      const setCurrentUserResponse = await axios.post(
        `${apiUrl}/setCurrentUser`,
        { username, email: trimmedEmail, password, userType }
      );

      const { message, token } = setCurrentUserResponse.data;
      toast.show({
        description: `Welcome ${username}!`,
        backgroundColor: "green.500",
        duration: 2000,
        placement: "top",
      });
      setEmail("");
      setPassword("");

      // Save credentials to local storage
      // AsyncStorage is used in React Native instead of localStorage
      await AsyncStorage.setItem("currentUser", trimmedEmail);
      await AsyncStorage.setItem("token", token);

      // Redirect based on userType
      if (userType === "customer") {
        navigation.navigate('MainTab', { screen: 'Home' }); // Update to your customer home screen
      } else if (userType === "businessOwner") {
        navigation.navigate("BusinessWelcome"); // Update to your business owner welcome screen
      }
    } catch (error) {
      if (error.response) {
        toast.show({
          description: error.response.data.error,
          backgroundColor: "red.500",
          duration: 2000,
          placement: "top",
        });
      } else if (error.request) {
        toast.show({
          description: "No response received from server",
          backgroundColor: "red.500",
          duration: 2000,
          placement: "top",
        });
      } else {
        toast.show({
          description: "An error occurred: " + error.message,
          backgroundColor: "red.500",
          duration: 2000,
          placement: "top",
        });
      }
      console.log(error);
    }
    finally {
      setIsSigningIn(false); // Reset sign-in state when completed (success or failure)
      setIsOverlayVisible(false); // Hide overlay
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    console.log(email);
    try {
      setIsSigningIn(true); // Set state to indicate sign-in process has started
      setIsOverlayVisible(true); // Show overlay  
      const response = await axios.post(`${apiUrl}/check-email`, {
        email: trimmedEmail,
      });
      toast.show({
        description: "Reset your password now!",
        backgroundColor: "green.500",
        placement: "top",
        duration: 2000,
      });
      // Open the password reset modal (you need to implement this)
      openModal();
    } catch (error) {
      if (error.response) {
        toast.show({
          description: error.response.data.error,
          backgroundColor: "red.500",
          placement: "top",
          duration: 1000,
        });
      } else if (error.request) {
        toast.show({
          description: "No response received from server",
          backgroundColor: "red.500",
          duration: 2000,
          placement: "top",
        });
      } else {
        toast.show({
          description: "An error occurred: " + error.message,
          backgroundColor: "red.500",
          duration: 2000,
          placement: "top",
        });
      }
      console.log(error);
    } finally {
      setIsSigningIn(false); // Reset sign-in state when completed (success or failure)
      setIsOverlayVisible(false); // Hide overlay
    }
  };

  const handleSavePassword = async () => {
    if (newPassword === "" || confirmPassword === "") {
      toast.show({
        description: "Both fields are required.",
        backgroundColor: "red.500",
        placement: "top",
        duration: 2000,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.show({
        description: "Passwords do not match.",
        placement: "top",
        backgroundColor: "red.500",
        duration: 2000,
      });
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&,.\/<>?;':"[\]{}\\|\-=+_)(*&^%$#@!`~])[A-Za-z\d@$!%*#?&,.\/<>?;':"[\]{}\\|\-=+_)(*&^%$#@!`~]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.show({
        description:
          "Password must be at least 8 characters long and contain letters, numbers, and special characters.",
        backgroundColor: "red.500",
        placement: "top",
        duration: 2000,
      });
      return;
    }
    closeModal();
    setIsSigningIn(true); // Set state to indicate sign-in process has started
    setIsOverlayVisible(true); // Show overlay

    const trimmedEmail = email.trim();
    try {
      const response = await axios.put(
        `${apiUrl}/update-password`,
        { email: trimmedEmail, newPassword }
      );

      const userResponse = await axios.post(
        `${apiUrl}/findUserUsingEmail`,
        { email: trimmedEmail }
      );

      const { username, userType } = userResponse.data;
      console.log(userResponse.data);

      const setCurrentUserResponse = await axios.post(
        `${apiUrl}/setCurrentUser`,
        { username, email: trimmedEmail, password: newPassword, userType }
      );

      const { message, token } = setCurrentUserResponse.data;

      await AsyncStorage.setItem("currentUser", email);
      await AsyncStorage.setItem("token", token);
      console.log(await AsyncStorage.getItem("currentUser"));

      toast.show({
        description: `Password updated successfully! Welcome ${username}!`,
        backgroundColor: "green.500",
        placement: "top",
        duration: 2000,
      });

      if (userType === "customer") {
        navigation.navigate('MainTab', { screen: 'Home' }); // Update to your customer home screen
      } else if (userType === "businessOwner") {
        navigation.navigate("BusinessWelcome"); // Update to your business owner welcome screen
      }

      setEmail("");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // setTimeout(() => {
      //   // Close the modal (you need to implement this)
       
      // }, 2000);
    } catch (error) {
      console.log("Error updating password:", error);
      toast.show({
        description:
          "An error occurred while updating password. Please try again later.",
        backgroundColor: "red.500",
        placement: "top",
        duration: 2000,
      });
    } finally {
      setIsSigningIn(false); // Reset sign-in state when completed (success or failure)
      setIsOverlayVisible(false); // Hide overlay
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  GoogleSignin.configure({
    ClientId: '922964996926-jrc2ah7h1s4m83lb9q2mvf8504blckov.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });


  // const signInWithGoogle = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     // Extract user details
  //     const { email, givenName } = userInfo.user;
  //     console.log("User details are:", userInfo);
  //     // Check if the user's email is already in the database
  //     const userResponse = await axios.post(
  //       `${apiUrl}/findUserUsingEmail`,
  //       { email }
  //     );
  //     const { userType, username, user } = userResponse.data;
  //     console.log("USER RESPONSE AFTER USING EMAIL:", userResponse.data);
  //     // Check if the user is verified
  //     if (user) {
  //       const setCurrentUserResponse = await axios.post(
  //         `${apiUrl}/setCurrentUser`,
  //         { username, email, userType }
  //       );
  //       const { message, token } = setCurrentUserResponse.data;
  //       // Display success message
  //       toast.show({
  //         description: `welcome back ${givenName}!`,
  //         backgroundColor: "green.500",
  //         duration: 2000,
  //         placement: "top",
  //       });
  //       // Save credentials to local storage
  //       // AsyncStorage is used in React Native instead of localStorage
  //       await AsyncStorage.setItem("currentUser", email);
  //       await AsyncStorage.setItem("token", token);
  //       console.log("this is before redirect", userType);
  //       if (userType == "customer") {
  //         console.log("hello");
  //         navigation.navigate('MainTab', { screen: 'Home' });
  //       } else if (userType == "businessOwner") {
  //         navigation.navigate("BusinessWelcome");
  //       }
  //     }
  //     else {
  //       console.log("else block in the google login");
  //       // User doesn't exist, redirect to user page for registration
  //       // Make Axios POST request to the backend
  //       await axios.post(`${apiUrl}/googleRegisterCustomer`, {
  //         username: givenName,
  //         email: email,
  //         userType: "customer"
  //       });

  //       const userResponse = await axios.post(`${apiUrl}/setCurrentUser`, {
  //         username: givenName,
  //         email: email,
  //         userType: "customer"
  //       });

  //       const { token } = userResponse.data;
  //       // Save the token to local storage
  //       await AsyncStorage.setItem("token", token);
  //       await AsyncStorage.setItem("currentUser", email);
  //       navigation.navigate('MainTab', { screen: 'Home' });

  //       // Notify user of successful submission
  //       toast.show({
  //         description: "Welcome to Tour Hunt app!",
  //         backgroundColor: "green.500",
  //         duration: 2000,
  //         placement: "top",
  //       });
  //     }
  //   } catch (error) {
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       console.log('Google sign-in cancelled');
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       console.log('Google sign-in in progress');
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       console.log('Google Play Services not available or outdated');
  //     } else {
  //       console.error('Google sign-in error:', error.message);
  //       // Display error message
  //       toast.show({
  //         description: "Sign in error: " + error.message,
  //         backgroundColor: "red.500",
  //         duration: 2000,
  //         placement: "top",
  //       });
  //     }
  //   }
  // };
  const signInWithGoogle = async () => {
    try {
      setIsSigningIn(true); // Set state to indicate sign-in process has started
      setIsOverlayVisible(true); // Show overlay

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { email, givenName } = userInfo.user;

      const userResponse = await axios.post(`${apiUrl}/findUserUsingEmail`, { email });
      const { userType, username, user } = userResponse.data;
    
      console.log("this is curent user",userResponse.data)
      if (userType=="customer") {
        const setCurrentUserResponse = await axios.post(`${apiUrl}/setCurrentUser`, {
          username,
          email,
          userType
        });
        console.log("the username is ",setCurrentUserResponse.data)
        const { message, token } = setCurrentUserResponse.data;

        toast.show({
          description: `Welcome ${username}!`,
          backgroundColor: "green.500",
          duration: 2000,
          placement: "top",
        });

        await AsyncStorage.setItem("currentUser", email);
        await AsyncStorage.setItem("token", token);

        if (userType === "customer") {
          navigation.navigate('MainTab', { screen: 'Home' });
        } else if (userType === "businessOwner") {
          navigation.navigate("BusinessWelcome");
        }
      } else {
        await axios.post(`${apiUrl}/googleRegisterCustomer`, {
          username: givenName,
          email,
          userType: "customer"
        });

        const userResponse = await axios.post(`${apiUrl}/setCurrentUser`, {
          username: givenName,
          email,
          userType: "customer"
        });

        const { token } = userResponse.data;

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("currentUser", email);

        navigation.navigate('MainTab', { screen: 'Home' });

        toast.show({
          description: "Welcome to Tour Hunt app!",
          backgroundColor: "green.500",
          duration: 2000,
          placement: "top",
        });
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google sign-in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google sign-in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services not available or outdated');
      } else {
        console.error('Google sign-in error:', error.message);

        toast.show({
          description: "Sign in error: " + error.message,
          backgroundColor: "red.500",
          duration: 2000,
          placement: "top",
        });
      }
    } finally {
      setIsSigningIn(false); // Reset sign-in state when completed (success or failure)
      setIsOverlayVisible(false); // Hide overlay
    }
  };
  return (
    <>
      <NativeBaseProvider>
        <View style={styles.container}>
          <Box style={styles.imageContainer}>
            <Image
              source={require('../../assets/Image/oic.png')}
              style={styles.image}
            />
          </Box>
          <Box style={styles.formContainer}>
            <ScrollView>
              <Box style={{ paddingBottom: "5%", paddingTop: '5%' }}>
                <Box style={styles.heading_div}>
                  <Center>
                    <Text style={styles.heading}>LOGIN</Text>
                    <Text style={styles.welcome}>welcome back you have</Text>
                    <Text style={styles.missed_text}>been missed !</Text>
                  </Center>
                </Box>
                <Center>
                  <Box style={styles.input_divs}>
                    <Text style={styles.label}>Email:</Text>
                    <Input
                      placeholder="Enter email"
                      variant="underlined"
                      style={{ fontSize: 14 }}
                      value={email}
                      onChangeText={setEmail}
                      InputRightElement={
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          size={18}
                          color="gray"
                          style={{ marginRight: 10 }}
                        />
                      }
                    />
                  </Box>
                  <Box style={[styles.password_box, styles.input_divs]}>
                    <Text style={styles.label}>Password:</Text>
                    <Input
                      placeholder="Enter your password"
                      variant="underlined"
                      style={{ fontSize: 14 }}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      InputRightElement={
                        <Button
                          variant="unstyled"
                          onPress={togglePasswordVisibility}
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEye : faEyeSlash}
                            size={18}
                            color="gray"
                            style={{ marginRight: 10 }}
                          />
                        </Button>
                      }
                    />
                    <TouchableOpacity onPress={handleForgotPassword}>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </Box>
                </Center>

                <Center>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                  >
                    <Text style={styles.buttonText}>Log In</Text>
                  </TouchableOpacity>
                </Center>
                <Box style={styles.orContainer}>
                  <Box style={styles.line}> </Box>
                  <Text style={styles.orText}>OR</Text>
                  <Box style={styles.line}></Box>
                </Box>

                <Box>
                  <Box style={styles.google_box}>
                    <TouchableOpacity
                      style={[styles.googleButton, isSigningIn && styles.disabledButton]}
                      onPress={signInWithGoogle}
                      disabled={isSigningIn}
                    >
                      <Image
                        source={require('../../assets/Image/google.png')}
                        style={styles.googleLogo}
                      />
                      <Text style={styles.buttonText}>Sign in with Google</Text>

                    </TouchableOpacity>
                  </Box>
                </Box>
              </Box>
            </ScrollView>
          </Box>
        </View>
        {isOverlayVisible && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        <Modal isOpen={isModalOpen} onClose={closeModal} backdropCloseBehavior="none">
          <Modal.Content width={'90%'}>
            <Modal.Header>Change Password</Modal.Header>
            <Modal.Body>
              <Text style={styles.newlabel}>New Password:</Text>
              <Input
                placeholder="Enter new password"
                variant="underlined"
                style={{ fontSize: 14 }}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                mb={6}
                InputRightElement={
                  <Button
                    variant="unstyled"
                    onPress={toggleNewPasswordVisibility}
                  >
                    <FontAwesomeIcon
                      icon={showNewPassword ? faEye : faEyeSlash}
                      size={18}
                      color="gray"
                      style={{ marginRight: 10 }}
                    />
                  </Button>
                }
              />
              <Text style={styles.newlabel}>Confirm Password:</Text>
              <Input
                placeholder="Confirm new password"
                variant="underlined"
                style={{ fontSize: 14 }}
                mb={5}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                InputRightElement={
                  <Button
                    variant="unstyled"
                    onPress={toggleConfirmPasswordVisibility}
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEye : faEyeSlash}
                      size={18}
                      color="gray"
                      style={{ marginRight: 10 }}
                    />
                  </Button>
                }
              />
            </Modal.Body>
            <Modal.Footer>
              <Button style={styles.close} onPress={closeModal}>Cancel</Button>
              <Button style={styles.save} onPress={handleSavePassword}>Save</Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </NativeBaseProvider>
    </>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b1d0d2',
    position: "relative",
  },
  imageContainer: {
    width: '100%',
    height: '65%',
    position: "relative",
  },
  image: {
    width: '100%',
    height: "100%",
    position: "relative",
    top: -35
  },
  formContainer: {
    height: "80%",
    width: "95%",
    marginTop: '2%',
    position: "absolute",
    backgroundColor: "white",
    bottom: 0,
    left: 9,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -24
    },
    shadowOpacity: 1,
    shadowRadius: 9.11,
    elevation: 55,
  },
  heading: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 20,
    color: "#143E56",
    textDecorationLine: "underline",
    width: "auto",
    textAlign: "center",
    marginBottom: "7%"
  },
  welcome: {
    fontSize: 17,
    color: 'black',
    fontWeight: "700",
  },
  missed_text: {
    fontSize: 19,
    color: 'black',
    fontWeight: "700",
    marginBottom: "12%",
  },
  label: {
    fontSize: 15,
    marginBottom: 10,
    color: "black",
    fontWeight: "500"
  },
  password_box: {
    marginTop: "7%"
  },
  input_divs: {
    width: "90%"
  },
  button: {
    backgroundColor: '#FFBF00', // Golden yellow color
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: "9%",
    width: "50%"
  },
  buttonText: {
    color: 'black', // Black text color
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: "center"
  },
  forgotPasswordText: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
    color: 'red',
  },
  save: {
    backgroundColor: '#FFBF00',
    color: "black",
    width: "35%"
  },
  close: {
    backgroundColor: 'grey',
    width: "35%",
    marginRight: "29%"
  },
  newlabel: {
    color: "black"
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'grey',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "grey",
    fontWeight: 'bold',
  },
  googleLogo: {
    width: 20, // Adjust the width of the Google logo
    height: 25, // Adjust the height of the Google logo
    marginRight: 15, // Add margin between the logo and the text
  },
  google_box: {
    alignItems: 'center', // Center items vertically
    justifyContent: 'center',
  },
  googleButton: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'center', // Center items horizontally
    backgroundColor: '#FFBF00', // Google Red color
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    width: "70%"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});