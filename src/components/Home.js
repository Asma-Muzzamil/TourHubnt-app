import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Animated, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { NativeBaseProvider, Box, Avatar, Input, Icon } from 'native-base';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Swiper from 'react-native-swiper';
import img1 from "../../assets/Image/cityNight.jpg";
import img2 from "../../assets/Image/beach.jpg";
import img3 from "../../assets/Image/Onvacation.jpg";
import img4 from "../../assets/Image/plane.jpg";
import img5 from "../../assets/Image/Islamabad.jpg"
import img6 from "../../assets/Image/punjab.jpg"
import img7 from "../../assets/Image/sindh.jpg"
import img8 from "../../assets/Image/balochistan.jpg"
import img9 from "../../assets/Image/azad.jpg"
import img10 from "../../assets/Image/khyber.jpg"
import img11 from "../../assets/Image/gilgit.jpg"
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config.json';
import axios from "axios";
import { useFocusEffect } from '@react-navigation/native'; 


const Home = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const apiUrl = config.API_URL;
  const [email, setEmail] = useState();
  const [selectedImage, setSelectedImage] = useState(null);
  const [username, setuserName] = useState();
  const [userId, setUserId] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [gender, setGender] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("going to see if there any ")
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser !== null) {
          setCurrentUser(storedUser);
          setIsLoggedIn(true);
          console.log("user found")
        }
      } catch (error) {
        console.log("Failed to fetch the user from storage..can't find it ");
      }
    };

    checkUser();
  }, []);

  const getData = async () => {
    const currentUser = await AsyncStorage.getItem("currentUser");
    console.log("starting the fetching of user");
    const userResponse = await axios.post(
      `${apiUrl}/findUserUsingEmail`,
      { email: currentUser }
    );
    console.log("found the user");
    try {
      console.log("starting the fetching of profile pic ");
      const profilePictureResponse = await axios.post(
        `${apiUrl}/getProfilePicture`,
        { userId: userResponse.data._id }
      );
      setSelectedImage(profilePictureResponse.data.profilePicture);
    } catch (error) {
      console.log("can't find profile pic", error);
    }
    console.log("userResponse", userResponse.data);
    // setUserId(userResponse.data._id);
    // setUserName(userResponse.data.username);
    setEmail(userResponse.data.email);
    // setGender(userResponse.data.user.gender || userResponse.data.gender || null);
    setIsLoaded(true);
  };

  //  check if image is updated when focus on the screen comes
  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  // const getUser = async () => {
  //   const storedUser = await AsyncStorage.getItem('currentUser');
  //   const userResponse = await axios.post(
  //     `${apiUrl}/findUserUsingEmail`,
  //     { email: storedUser }
  //   );

  //   setEmail(userResponse.data.email);
  //   console.log(userResponse.data.userType);
  // };

  // if (currentUser) {
  //   console.log("going to get user")
  //   getUser();
  // }


  //  FOR FADE-IN ANIMATION
  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    startFadeInAnimation();
  }, []);

  const startFadeInAnimation = () => {
    fadeIn.setValue(0);
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const navigateToTourPackages = (locationName) => {
    navigation.navigate('TourPackages', { location: locationName });
  };

  return (
    <NativeBaseProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box style={styles.main_box}>
          <Box style={{ paddingLeft: 20, paddingBottom: 10 }}>
            <Box style={{ paddingTop: 20, display: "flex", flexDirection: "row", justifyContent: "space-between", paddingRight: 20 }}>
              <Text style={styles.text_style}>Discover the </Text>
              {selectedImage ? (
                <Avatar size="md" source={{ uri: selectedImage }} style={{ alignSelf: 'center' }} />
              ) : (
                <Avatar size="md" source={require('../../assets/Image/profile-logo.png')} style={{ alignSelf: 'center' }} />
              )}
            </Box>
            <Text style={styles.main_text}>beauty of the world</Text>
          </Box>
          <Box style={{
            height: 200, backgroundColor: "rgb(192, 192, 192)", marginTop: 20, marginRight: 10, marginLeft: 10, shadowColor: "#000",
            borderRadius: 20,
            shadowOffset: {
              width: 0,
              height: 7,
            },
            shadowOpacity: 0.41,
            shadowRadius: 9.11,
            elevation: 14,
          }}>
            <Swiper
              style={styles.wrapper}
              loop={true}
              showsPagination={true}
              autoplay={true}
              autoplayTimeout={3}
              onIndexChanged={startFadeInAnimation}
            >
              <Animated.View style={[styles.slide, { opacity: fadeIn }]}>
                <Image source={img1} style={styles.img} resizeMode="cover" />
              </Animated.View>
              <Animated.View style={[styles.slide, { opacity: fadeIn }]}>
                <Image source={img2} style={styles.img} resizeMode="cover" />
              </Animated.View>
              <Animated.View style={[styles.slide, { opacity: fadeIn }]}>
                <Image source={img3} style={styles.img} resizeMode="cover" />
              </Animated.View>
              <Animated.View style={[styles.slide, { opacity: fadeIn }]}>
                <Image source={img4} style={styles.img} resizeMode="cover" />
              </Animated.View>
            </Swiper>
          </Box>
          <Box style={{ marginTop: 25, paddingLeft: 20, height: "100%" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "black" }}>Places to go in Pakistan </Text>
            <TouchableOpacity style={styles.card} onPress={() => navigateToTourPackages('punjab')}>
              <Image source={img6} style={styles.cardImg} />
              <Box style={styles.card_text_box}>
                <Text style={styles.cardText}>Punjab</Text>
                <Text style={styles.card_secText}>Largest province in area and rich in culture  and history </Text>
              </Box>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigateToTourPackages('sindh')}>
              <Image source={img7} style={styles.cardImg} />
              <Box style={styles.card_text_box}>
                <Text style={styles.cardText}>Sindh</Text>
                <Text style={styles.card_secText}>Pakistan second-largest economy with provincial city Karachi, largest city and financial hub </Text>
              </Box>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigateToTourPackages('balochistan')}>
              <Image source={img8} style={styles.cardImg} />
              <Box style={styles.card_text_box}>
                <Text style={styles.cardText}>Balochistan</Text>
                <Text style={styles.card_secText}>Largest province in land area forming a south western region of the country  </Text>
              </Box>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.card_margin]} onPress={() => navigateToTourPackages('khyber pakhtunkhwa')}>
              <Image source={img10} style={styles.cardImg} />
              <Box style={styles.card_text_box}>
                <Text style={styles.cardText}>Khyber Pakhtunkhwa</Text>
                <Text style={styles.card_secText}>Located in the northwestern region of the country along the international border with the Afghanistan  </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>
      </ScrollView>
    </NativeBaseProvider>
  );
};


const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  main_box: {
    flex: 1,
    backgroundColor: "white"
  },
  text_style: {
    fontSize: 20,
    color: "black",
    fontWeight: "600"
  },
  main_text: {
    position: "relative",
    top: "4%",
    fontWeight: "900",
    fontSize: 30,
    color: "#143E56"
  },
  card: {
    height: 200,
    position: "relative",
    marginRight: 20,
    marginTop: 20
  },
  cardImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 15,
  },
  card_text_box: {
    top: "55%",
    marginLeft: 15,
  },
  cardText: {
    color: 'white',
    fontSize: 26,
    fontWeight: "700"
  },
  card_secText: {
    fontSize: 14,
    fontWeight: "700"
  },
  card_margin: {
    marginBottom: 20
  }
})

export default Home;
