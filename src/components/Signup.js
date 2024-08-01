import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { NativeBaseProvider, Input, Box, Center, Button, Radio, HStack, useToast } from 'native-base';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faEnvelope, faPeopleGroup, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { isEmail } from "validator";
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import config from './config.json';


export default function Signup() {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState(null);
  const [userType, setUserType] = useState("customer");
  const [isSigningIn, setIsSigningIn] = useState(false); // State to track sign-in process
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const apiUrl = config.API_URL;
  console.log("this is url", apiUrl);

  const toast = useToast();
  const navigation = useNavigation();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateName = (name) => {
    // Regular expression for validating the username
    const nameRegex = /^[a-zA-Z0-9_\- ]+$/; // Updated regex to allow alphanumeric characters, underscore (_), hyphen (-), and space ( )
    return name.length >= 2 && nameRegex.test(name); // Updated minimum length to 2 characters
  };

  const handleNameChange = (value) => {
    setName(value);
    if (value.trim() === '') {
      setNameError(''); // Reset error message if input is empty
    } else if (!validateName(value)) {
      setNameError(
        'Username must be at least 2 characters long and contain only letters, numbers, underscore (_), hyphen (-), or space ( )'
      );
    } else {
      setNameError(''); // Reset error message if input is valid
    }
  };
  const handleEmailChange = (value) => {
    setEmail(value);
    if (value.trim() === '') {
      setEmailError(''); // Reset error message if input is empty
    } else if (!isEmail(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };
  const validatePassword = (password) => {
    // Password should be at least 8 characters long with letters
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&,.\/<>?;':"[\]{}\\|\-=+_)(*&^%$#@!`~])[A-Za-z\d@$!%*#?&,.\/<>?;':"[\]{}\\|\-=+_)(*&^%$#@!`~]{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (value.trim() === '') {
      setPasswordError('');
    } else if (!validatePassword(value)) {
      setPasswordError(
        'Password should be at least 8 characters long with letters, symbols, and numbers'
      );
    } else {
      setPasswordError('');
    }
  };

  const handleSignup = async () => {
    if (!name || !email.trim() || !password.trim() || !confirmPassword.trim() || !gender) {
      toast.show({
        description: 'Fill all the required fields',
        placement: "top",
        backgroundColor: "red.500",
        duration: 2000,
      });
      return;
    }

    // Validate name
    if (!validateName(name)) {
      toast.show({
        description: nameError,
        placement: "top",
        backgroundColor: "red.500",
        duration: 2000,
      });
      return;
    }

    // Validate email
    if (!isEmail(email)) {
      toast.show({
        description: 'Invalid email format',
        placement: "top",
        backgroundColor: "red.500",
        duration: 2000,
      });
      return;
    }

    try {
      const apiKey = '98840c6d90f80dd491d6aed7b3372d3d1163b0c4';
      const response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${apiKey}`);
      const data = response.data.data;

      console.log(data)
      // Check if email is deliverable
      if (data.result != 'deliverable') {
        toast.show({
          description: 'This email address does not exist or is not deliverable.',
          placement: "top",
          backgroundColor: "red.500",
          duration: 2000,
          width: "95%"
        });
        return;
      }
    } catch (error) {
      console.error('Error:', error.response.data.error);
      toast.show({
        description: 'An error occurred while verifying the email address.',
        placement: "top",
        backgroundColor: "red.500",
        duration: 2000,
        width: "95%"
      });
      return;
    }

    // Validate password
    if (!validatePassword(password)) {
      toast.show({
        description: 'Password should be at least 8 characters long with letters, symbols, and numbers',
        placement: "top",
        backgroundColor: "red.500",
        duration: 2000,
      });
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      toast.show({
        description: 'Password and Confirm Password do not match',
        placement: "top",
        backgroundColor: "red.500",
        duration: 2000,
      });
      return;
    }

    setIsSigningIn(true); // Set state to indicate sign-in process has started
    setIsOverlayVisible(true); // Show overlay
    try {
      // Make Axios POST request to the backend
      await axios.post(`${apiUrl}/registerCustomer`, {
        username: name,
        email: email,
        password: password,
        gender: gender,
        userType: userType,
      });

      // Notify user of successful submission
      toast.show({
        description: 'Account created successfully! Activate your account using the link sent to your email.',
        placement: "top",
        backgroundColor: "green.500",
        duration: 5000,
      });

      // Navigate to the login screen
      navigation.navigate('Login');
    } catch (error) {
      // Handle error if Axios request fails
      // console.error('Error submitting signup form:', error);

      // Show an alert for different types of errors
      if (error.response && error.response.status === 400) {
        toast.show({
          description: error.response.data.error || 'An error occurred while signing up.',
          placement: "top",
          backgroundColor: "red.500",
          duration: 2000,
        });
      } else {
        toast.show({
          description: 'An error occurred while signing up. Please try again later.',
          placement: "top",
          backgroundColor: "red.500",
          duration: 2000,
        });
      }
    } finally {
      setIsSigningIn(false); // Reset sign-in state when completed (success or failure)
      setIsOverlayVisible(false); // Hide overlay
    }
  };

  return (
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
              <Box style={styles.heading_box}>
                <Text style={styles.heading}>SIGN UP</Text>
              </Box>
              <Center>
                <Box style={styles.input_div}>
                  <Text style={styles.label}>Username</Text>
                  <Input
                    placeholder="asma,agst54"
                    variant="underlined"
                    value={name}
                    style={{ fontSize: 14 }}
                    onChangeText={handleNameChange}
                    InputRightElement={
                      <FontAwesomeIcon
                        icon={faUser}
                        size={18}
                        color="gray"
                        style={{ marginRight: 10 }}
                      />
                    }
                  />
                  {nameError && (
                    <Text style={{ color: "red", display: "block", marginBottom: 11 }}>{nameError}</Text>
                  )}
                </Box>
                <Box style={styles.input_div}>
                  <Text style={styles.label}>Email</Text>
                  <Input
                    placeholder="abc12@gmail.com"
                    variant="underlined"
                    style={{ fontSize: 14 }}
                    value={email}
                    onChangeText={handleEmailChange}
                    InputRightElement={
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        size={18}
                        color="gray"
                        style={{ marginRight: 10 }}
                      />
                    }
                  />
                  {emailError && (
                    <Text style={{ color: "red", display: "block", marginBottom: 9 }}>{emailError}</Text>
                  )}
                </Box>

                <Box style={styles.input_div}>
                  <Text style={styles.label}>Password</Text>
                  <Input
                    placeholder="Password"
                    style={{ fontSize: 14 }}
                    variant="underlined"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    InputRightElement={
                      <Button variant="unstyled" onPress={togglePasswordVisibility}>
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                          size={18}
                          color="gray"
                          style={{ marginRight: 10 }}
                        />
                      </Button>
                    }
                  />
                  {passwordError && (
                    <Text style={{ color: "red", display: "block", marginBottom: 9 }} >{passwordError}</Text>
                  )}
                </Box>

                <Box style={styles.input_div}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <Input
                    placeholder="Confirm Password"
                    variant="underlined"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    InputRightElement={
                      <Button variant="unstyled" onPress={toggleConfirmPasswordVisibility}>
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEye : faEyeSlash}
                          size={18}
                          color="gray"
                          style={{ marginRight: 10 }}
                        />
                      </Button>
                    }
                  />
                </Box>
                <Box style={[styles.input_div, styles.bott_mar]}>
                  <Box style={styles.radio_div}>
                    <Text style={[styles.label]}>Gender</Text>
                    <FontAwesomeIcon
                      icon={faPeopleGroup}
                      size={18}
                      color="gray"
                      style={{ marginRight: 10 }}
                    />
                  </Box>
                  <Radio.Group name="gender" value={gender} onChange={setGender} accessibilityLabel="pick a size">
                    <HStack space={3} display={"flex"} justifyContent={"space-between"} width={"70%"}>
                      <Radio style={{ marginLeft: '2%' }} size="sm" value="male">Male</Radio>
                      <Radio size="sm" value="female">Female</Radio>
                    </HStack>
                  </Radio.Group>
                </Box>
              </Center>
              <Box>
                <Center>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignup}
                  >
                    <Text style={styles.buttonText}>Sign Up</Text>
                  </TouchableOpacity>
                </Center>
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
    </NativeBaseProvider>
  );
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

  heading_box: {
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    marginBottom: "10%",
  },
  heading: {
    fontSize: 40,
    fontWeight: '900',
    color: "#143E56",
    textDecorationLine: "underline"
  },
  formContainer: {
    height: "80%",
    width: "95.5%",
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
  input_div: {
    width: "90%",
  },
  bott_mar: {
    marginBottom: "10%",
    marginTop: "5%"
  },
  radio_div: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5%"
  },
  label: {
    fontSize: 16,
    color: "black",
    fontWeight: "500"
  },
  radio_label: {
    marginBottom: '5%'
  },
  signupButton: {
    backgroundColor: '#FFBF00',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFBF00', // Golden yellow color
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: "4%",
    width: "50%"
  },
  buttonText: {
    color: 'black', // Black text color
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: "center"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
