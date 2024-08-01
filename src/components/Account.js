import React, { useEffect, useState } from 'react';
import { NativeBaseProvider, Box, Modal, Input, Radio, VStack, Button, useToast, Heading } from 'native-base';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faEnvelope, faVenusMars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,ActivityIndicator } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config.json';
import { useNavigation } from '@react-navigation/native'; // Assuming you're using React Navigation
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const UserAccountScreen = () => {
  const [userAccount, setUserAccount] = useState({
    _id: "",
    name: "",
    email: "",
    gender: "",
    image: null
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setuserName] = useState();
  const [userId, setUserId] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState();
  const [gender, setGender] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const toast = useToast();
  const apiUrl = config.API_URL;
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // TO GET USER DATA AND PROFILE PIC IF ANY 
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true); // Show loader overlay
      const currentUser = await AsyncStorage.getItem("currentUser");
      console.log("starting the fetching of user")
      const userResponse = await axios.post(
        `${apiUrl}/findUserUsingEmail`,
        { email: currentUser }
      );
      console.log("found the user")
      try {
        console.log("starting the fetching of profile pic ")
        const profilePictureResponse = await axios.post(
          `${apiUrl}/getProfilePicture`,
          { userId: userResponse.data._id }
        );
        setSelectedImage(profilePictureResponse.data.profilePicture);
        console.log("the profile picture is this in get data", selectedImage)
      } catch (error) {
        console.log("cant found profile pic", error)
      }
      console.log("userResponse", userResponse.data)
      setUserId(userResponse.data._id);
      setuserName(userResponse.data.username);
      setEmail(userResponse.data.email);
      setGender(userResponse.data.user?.gender || userResponse.data.gender || null);
      setIsLoaded(true);
      setIsLoading(false); // Hide loader overlay
    };
    getData();
  }, []);

  console.log("this is gender after  it ", gender)

  const openDetailsModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // SIGNOUT 
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("currentUser");

      // setCurrentUser(null);
      // setEmail(null);
      // setIsLoggedIn(false);
      await GoogleSignin.signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // ERROR FROM THE LIBARARY
  const handleImagePickerError = (error) => {
    toast.show({
      title: "Error",
      description: "Failed to pick image",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  };

  // PICTURE TAKING FROM LIBARARY 
  const choosePhotoFromLibrary = () => {
    console.log("in library")
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7
    }).then(image => {
      console.log("this is going in update", image.path);
      setSelectedImage(image.path);
      updateImage(image.path); // Pass the image path to updateImage
    }).catch(handleImagePickerError);
  };

  // SUBMITTING FOR UPDATING USERINFO
  const handleSubmit = async () => {
    console.log("inside submit")
    try {
      console.log("this is the user data before the updation", email, userId, username, gender)
      await axios.post(`${apiUrl}/updateAccount`, {
        userId,
        username,
        email,
        gender,
      });
      closeModal();
      toast.show({
        description: 'Information updated succesfully',
        placement: "top",
        backgroundColor: "green.500",
        duration: 2000,
      })
      await AsyncStorage.setItem("currentUser", email);
      console.log("done")
    } catch (error) {
      console.error(error)
    }
  };


  // UPDATING IMAGE TO UPLOAD ON DATABASE
  const updateImage = async (imagePath) => {
    try {
      console.log("Starting image upload...", userId);
      console.log("Starting image upload... and this is img", imagePath);

      const response = await axios.post(
        `${apiUrl}/uploadProfilePicture`,
        {
          userId: userId,
          profilePicture: imagePath,
        }
      );

      console.log("Image upload successful:", response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.message);
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message);
        }
      } else {
        // Non-Axios error
        console.error("Non-Axios Error:", error);
      }
    }
  };


  return (
    <NativeBaseProvider>
      <Box style={styles.main_box}>
        <Box style={{ marginTop: 20, paddingLeft: 15, paddingRight: 15, paddingTop: 25, marginBottom: 20 }}>
          <Heading size={'xl'} marginBottom={'2%'} bottom={'10%'}>User Information</Heading>
          <TouchableOpacity onPress={handleLogout} style={styles.signOutButton}>
            <Text style={{ color: "white", fontSize: 16 }}>Signout</Text>
          </TouchableOpacity>
        </Box>
        {/* {isLoading ? ( // Show ActivityIndicator while loading
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        ) :
          <View style={styles.userAccountCard}>

            <View style={styles.imageContainer}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.image} />
              ) : (
                <Image source={require('../../assets/Image/profile-logo.png')} style={styles.image} />
              )}
            </View>
            <Button onPress={choosePhotoFromLibrary} style={styles.uploadButton}>
              Change Profile Picture
            </Button>
            <View style={styles.detailsContainer}>
              <Box style={styles.iconTextContainer}>
                <FontAwesomeIcon icon={faUser} size={20} color='grey' style={styles.icon} />
                <Text style={styles.iconText}>Name: {username}</Text>
              </Box>
              <Box style={styles.iconTextContainer}>
                <FontAwesomeIcon icon={faEnvelope} size={20} color='grey' style={styles.icon} />
                <Text style={styles.iconText}>Email: {email}</Text>
              </Box>
              {console.log("gender is ", gender)}
              {gender ? (
                <Box style={styles.iconTextContainer}>
                  <FontAwesomeIcon icon={faVenusMars} size={20} color='grey' style={styles.icon} />
                  <Text style={styles.iconText}>Gender: {gender}</Text>
                </Box>
              ) : null}

              <TouchableOpacity style={styles.detailsButton} onPress={openDetailsModal}>
                <Text style={styles.detailsButtonText}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          </View>
                  )} */}
        {isLoading ? (
           <View style={styles.overlay}>
           <ActivityIndicator size="large" color="#ffffff" />
         </View>
        ) : (
          <View style={styles.userAccountCard}>
            <View style={styles.imageContainer}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.image} />
              ) : (
                <Image source={require('../../assets/Image/profile-logo.png')} style={styles.image} />
              )}
            </View>
            <Button onPress={choosePhotoFromLibrary} style={styles.uploadButton}>
              Change Profile Picture
            </Button>
            <View style={styles.detailsContainer}>
              <Box style={styles.iconTextContainer}>
                <FontAwesomeIcon icon={faUser} size={20} color='grey' style={styles.icon} />
                <Text style={styles.iconText}>Name: {username}</Text>
              </Box>
              <Box style={styles.iconTextContainer}>
                <FontAwesomeIcon icon={faEnvelope} size={20} color='grey' style={styles.icon} />
                <Text style={styles.iconText}>Email: {email}</Text>
              </Box>
              {console.log("gender is ", gender)}
              {gender ? (
                <Box style={styles.iconTextContainer}>
                  <FontAwesomeIcon icon={faVenusMars} size={20} color='grey' style={styles.icon} />
                  <Text style={styles.iconText}>Gender: {gender}</Text>
                </Box>
              ) : null}

              <TouchableOpacity style={styles.detailsButton} onPress={openDetailsModal}>
                <Text style={styles.detailsButtonText}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          </View>
       )} 
        <Modal isOpen={modalVisible} onClose={closeModal}>
          <Modal.Content style={styles.modalContent}>
            <View style={styles.modalContainer}>
              <ScrollView>
                <Box p={5} height={'70%'} >
                  <Text style={styles.modalHeading}>Details</Text>
                  <Text style={styles.modalLabelText}>Username</Text>
                  <Input
                    variant="outline"
                    placeholder="Name"
                    value={username}
                    onChangeText={setuserName}
                    height={10}

                  />
                  <VStack style={styles.radioContainer}>
                    <Text style={styles.radioLabel}>Gender</Text>
                    <Radio.Group name="gender" value={gender} onChange={setGender}>
                      <Radio value="Male" my={1} size={"sm"}>
                        Male
                      </Radio>
                      <Radio value="Female" my={1} size={"sm"}>
                        Female
                      </Radio>
                    </Radio.Group>
                  </VStack>
                </Box>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.modalButton, styles.bookButton]} onPress={handleSubmit}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.closeButton]} onPress={closeModal}>
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal.Content>
        </Modal>
      </Box>
    </NativeBaseProvider>
  );
};

export default UserAccountScreen;

const styles = StyleSheet.create({
  main_box: {
    flex: 1,
    backgroundColor: "white",
    position: "relative"
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'black'
  },
  userAccountCard: {
    flexDirection: 'column',
    display: "flex",
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  detailsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  iconText: {
    color: "grey",
    fontWeight: "500",
    fontSize: 16,
    textAlign: 'center',
  },
  detailsButton: {
    backgroundColor: '#143E56',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContent: {
    width: "90%",
    height: "50%",
  },
  modalContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeading: {
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 20,
    color: "black",
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: "black",
    fontWeight: "500",
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  radioContainer: {
    marginBottom: 15,
    marginTop: 15
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    marginBottom: 5,
  },
  uploadButton: {
    backgroundColor: '#FFBF00',
    borderRadius: 5,
    paddingVertical: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  bookButton: {
    backgroundColor: '#FFBF00',
  },
  closeButton: {
    backgroundColor: 'grey',
  },
  modalButtonText: {
    fontSize: 16,
    color: "black",
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: "#143E56",
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 6
  },
  modalLabelText: {
    color: "black",
    fontSize: 16,
    marginBottom: '3%',
    fontWeight: '700'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});