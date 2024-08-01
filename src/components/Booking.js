import React, { useState, useEffect, useCallback } from 'react';
import { NativeBaseProvider, Box, Text, useToast, Heading, FlatList, Modal, Button } from 'native-base';
import { StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Touchable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import config from './config.json';
import { addDays } from "date-fns";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBoxOpen, faUser, faPhone, faClock, faCalendar, faLocation, faBed, faChair, faPeopleGroup, faBus } from '@fortawesome/free-solid-svg-icons';

const BookingScreen = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState();
  const [showModal, setShowModal] = useState(false);
  const [buyerId, setBuyerId] = useState();
  const [serviceId, setServiceId] = useState();
  const [serviceType, setServiceType] = useState();
  const [dialogTitle, setDialogTitle] = useState();
  const [buyerName, setBuyerName] = useState();
  const [buyerEmail, setBuyerEmail] = useState();
  const [serviceName, setServiceName] = useState();
  const [refresh, setRefresh] = useState(false);
  const [bookingItem, setBookingItem] = useState(null);

  const toast = useToast();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = config.API_URL;


  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const currentUser = await AsyncStorage.getItem('currentUser');
        if (!currentUser) {
          navigation.navigate('Login');
        } else {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking user login status:', error);
      }
    };
    checkLoggedIn();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const email = await AsyncStorage.getItem('currentUser');
          if (!email) {
            console.log('User email not found in AsyncStorage');
            setIsLoading(false); // Stop loading as there's no user email
            return;
          }

          const userResponse = await axios.post(
            `${apiUrl}/findUserUsingEmail`,
            { email }
          );

          const userId = userResponse.data._id;

          const bookingsResponse = await axios.post(
            `${apiUrl}/getTourPackageBookings`,
            { userId }
          );
          console.log("changed the data")
          console.log("this is the booking resposne---------",bookingsResponse.data)
          setData(bookingsResponse.data);
          setIsLoading(false); // Stop loading after data fetch
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsLoading(false); // Stop loading on error
          toast.show({
            title: 'Error fetching data',
            status: 'error',
          });
        }
      };

      if (isLoggedIn) {
        fetchData();
      }
    }, [isLoggedIn])
  );

  // console.log("------------data--------",data[1])


  // useEffect(() => {
  //   const fetchData = async () => {
  //     let data;
  //     const email = await AsyncStorage.getItem('currentUser');
  //     const userResponse = await axios.post(
  //       `${apiUrl}/findUserUsingEmail`,
  //       { email: email }
  //     );
  //     try {
  //       const bookingsResponse = await axios.post(
  //         `${apiUrl}/getTourPackageBookings`,
  //         { userId: userResponse.data._id }
  //       );
  //       data = bookingsResponse.data;
  //       console.log(bookingsResponse.data);
  //     } catch (error) {
  //       data = null;
  //       restaurants = null;
  //       transports = null;
  //       accommodations = null;
  //       console.log(error);
  //     }
  //     setData(data);
  //   };
  //   isLoggedIn && fetchData();
  // }, [isLoggedIn]);


  const formatTimeToAMPM = (createdAt) => {
    try {
      const date = new Date(createdAt);

      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      const hours = date.getHours();
      const minutes = date.getMinutes();

      // Format hours to 12-hour format
      let formattedHours = hours % 12;
      if (formattedHours === 0) {
        formattedHours = 12; // Midnight should be 12 AM
      }

      // Format minutes with leading zero if needed
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      // Determine AM/PM
      const ampm = hours >= 12 ? 'PM' : 'AM';

      // Construct the formatted time string
      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

      return formattedTime;
    } catch (error) {
      console.error(`Error formatting time: ${error.message}`);
      return "Invalid time";
    }
  };


  const openDialog = (item) => {
    setBuyerId(item.buyerId);
    setServiceId(item.serviceId);
    setServiceType('Tour Package'); // Assuming 'Tour Package' is a constant value
    setBuyerName(item.buyerName);
    setServiceName(item.serviceName);
    setBuyerEmail(item.buyerEmail);
    setDialogTitle(item.serviceName); // Assuming d.serviceName is the title for the dialog
    setBookingItem(item);
    setShowModal(true);
  };


  const closeDialog = () => {
    setShowModal(false);
  };


  const handleAvailAccomodation = async (item) => {
    console.log("*****inside the accomomdataion****");
    try {
      await AsyncStorage.setItem(
        'paymentPrice',
        (parseFloat(item.numberOfPeople) * parseFloat(item.hotelRoomExpensePerPerson)).toString()
      );

      await AsyncStorage.setItem(
        'updateTpBooking',
        JSON.stringify({
          action: 'Avail Hotel',
          serviceId: item.serviceId,
          buyerId: item.buyerId,
          id: item._id,
          numberOfPeople: item.numberOfPeople,
          previousAmount: item.amountPaid,
        })
      );

      await AsyncStorage.setItem(
        'currentService',
        JSON.stringify({
          service: item,
          serviceType: 'Tour Package',
          serviceName: item.serviceName,
        })
      );

      navigation.navigate('Payment');
    } catch (error) {
      console.error('Error setting data in AsyncStorage:', error);
    }
  };

  const handleAvailTransport = async (item) => {
    console.log("*****inside the transport****");
    try {
      await AsyncStorage.setItem(
        'paymentPrice',
        (parseFloat(item.numberOfPeople) * parseFloat(item.transportExpensePerPerson)).toString()
      );

      await AsyncStorage.setItem(
        'updateTpBooking',
        JSON.stringify({
          action: "Avail Transport",
          serviceId: item.serviceId,
          buyerId: item.buyerId,
          id: item._id,
          numberOfPeople: item.numberOfPeople,
          previousAmount: item.amountPaid,
        })
      );

      await AsyncStorage.setItem(
        'currentService',
        JSON.stringify({
          service: item,
          serviceType: 'Tour Package',
          serviceName: item.serviceName,
        })
      );

      navigation.navigate('Payment');
    } catch (error) {
      console.error('Error setting data in AsyncStorage:', error);
    }
  };

  const handleCancelBooking = async () => {
    try {
      console.log("the id going to server", bookingItem._id)
      await axios.post(`${apiUrl}/cancelTourPackageBooking`, {
        id: bookingItem._id
      });

      // // Filter out the cancelled booking from the data state
      // const filteredTourPackages = data.filter((d) => !(d._id === bookingItem));
      // setData(filteredTourPackages);
      closeDialog(); // Close the modal after successful cancellation
      const filteredTourPackages = data.filter((d) => d._id !== bookingItem._id);
      setData(filteredTourPackages);
      console.log("near payment")
      await axios.post(`${apiUrl}/deletePayment`, {
        userId: buyerId,
        serviceId,
      });
      console.log("payment deleted")
      setRefresh(!refresh);
      // Show toast notification for successful cancellation
      toast.show({
        title: "Booking cancelled successfully.You will recieve an email shortly !",
        placement: "top",
        backgroundColor: "green.500",
        duration: 2000,
      });

    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };


  console.log("this is after dleted data" , data)

  return (
    <NativeBaseProvider>
      <Box flex={1} style={styles.book}>
        <Heading size={'xl'} fontWeight={'800'} textAlign={'center'}>Bookings</Heading>
        <Heading size={'md'} fontWeight={'800'} marginTop={'4%'}>Tour Packages</Heading>
        <Box style={{ paddingTop: '5%' }}>
          {isLoading ? (
            <Box flex={1} justifyContent="center" alignItems="center">
              <ActivityIndicator size="large" color="#0000ff" />
            </Box>
          )
            : (

              data.length === 0 ? (
                <Box>
                  {console.log("data is 0 ")}
                  <Text color={'black'} textAlign={"center"} top={200} fontSize={20}>No Bookings</Text>
                </Box>
              )
                : (
                  <FlatList
                    data={data}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.flatlistContainer}
                    renderItem={({ item }) => (

                      <Box width={'100%'} marginBottom={'5%'} paddingTop={'3%'} paddingBottom={'6%'} style={styles.shadow}>
                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Booking Type:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}>
                            <FontAwesomeIcon
                              icon={faBoxOpen}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>Tour Package</Text>
                          </Box>
                        </Box>
                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Service Name:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}>
                            <Image
                              source={require('../../assets/Image/name.png')} // Replace with your image path
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.serviceName}</Text>
                          </Box>
                        </Box>
                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Seller Name:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}>
                            <FontAwesomeIcon
                              icon={faUser}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.sellerName}</Text>
                          </Box>
                        </Box>
                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Seller Contact:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}  >
                            <FontAwesomeIcon
                              icon={faPhone}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.sellerContact}</Text>
                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Amount Paid:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <Image
                              source={require('../../assets/Image/money.png')} // Replace with your image path
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.amountPaid}</Text>
                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Purchase Date:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <FontAwesomeIcon
                              icon={faCalendar}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.createdAt.split("T")[0]}</Text>
                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Purchase Time:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <FontAwesomeIcon
                              icon={faClock}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{formatTimeToAMPM(item.createdAt)}</Text>

                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Departure Date:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}   >
                            <FontAwesomeIcon
                              icon={faCalendar}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>  {item.departureDate}</Text>
                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Tour Duration:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <FontAwesomeIcon
                              icon={faClock}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.tourDuration} days</Text>
                          </Box>
                        </Box>
                        {item.isAccommodationAvailed && (
                          <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                            <Text style={styles.sertext}>Hotel name:</Text>
                            <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}  >
                              <FontAwesomeIcon
                                icon={faLocation}
                                size={18}
                                color="gray"
                                style={styles.image}
                              />
                              <Text style={styles.answer}>{item.hotelCompanyName}</Text>
                            </Box>
                          </Box>
                        )}

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Destination:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <FontAwesomeIcon
                              icon={faLocation}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.destination}</Text>
                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Departure City:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <FontAwesomeIcon
                              icon={faLocation}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.departureCity}</Text>
                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Transport:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <FontAwesomeIcon
                              icon={faBus}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.transportType}</Text>
                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Number of people:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <FontAwesomeIcon
                              icon={faPeopleGroup}
                              size={18}
                              color="gray"
                              style={styles.image}
                            />
                            <Text style={styles.answer}>{item.numberOfPeople}</Text>
                          </Box>
                        </Box>

                        {!item.isAccommodationAvailed &&
                          new Date() <
                          addDays(
                            new Date(item.createdAt.split("T")[0]),
                            1
                          ) && (
                            <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                              <Text style={styles.sertext}> Hotel: </Text>
                              <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                                <TouchableOpacity
                                  style={styles.availbutton}
                                  activeOpacity={0.5}
                                  onPress={() => handleAvailAccomodation(item)}
                                >
                                  <Text style={styles.cancelText}>Avail Hotel Now</Text>
                                </TouchableOpacity>
                              </Box>
                            </Box>
                          )}

                        {!item.isTransportAvailed &&
                          new Date() <
                          addDays(
                            new Date(item.createdAt.split("T")[0]),
                            1
                          ) && (
                            <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                              <Text style={styles.sertext}> Transport: </Text>
                              <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                                <TouchableOpacity
                                  style={styles.tavailbutton}
                                  activeOpacity={0.5}
                                  onPress={() => handleAvailTransport(item)}
                                >
                                  <Text style={styles.cancelText}>Avail Transport Now</Text>
                                </TouchableOpacity>
                              </Box>
                            </Box>
                          )}

                        {item.isAccommodationAvailed && (
                          <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                            <Text style={styles.sertext}>Number of rooms:</Text>
                            <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}  >
                              <FontAwesomeIcon
                                icon={faBed}
                                size={18}
                                color="gray"
                                style={styles.image}
                              />
                              <Text style={styles.answer}>{item.numberOfRooms}</Text>
                            </Box>
                          </Box>
                        )}

                        {item.isTransportAvailed && (
                          <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                            <Text style={styles.sertext}>Number of seats:</Text>
                            <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}  >
                              <FontAwesomeIcon
                                icon={faChair}
                                size={18}
                                color="gray"
                                style={styles.image}
                              />
                              <Text style={styles.answer}>{item.numberOfSeats}</Text>
                            </Box>
                          </Box>
                        )}

                        {item.isAccommodationAvailed && (
                          <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                            <Text style={styles.sertext}>Room price per person:</Text>
                            <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}  >
                              <Image
                                source={require('../../assets/Image/money.png')} // Replace with your image path
                                style={styles.image}
                              />
                              <Text style={styles.answer}>Rs.{item.hotelRoomExpensePerPerson}</Text>
                            </Box>
                          </Box>
                        )}

                        {item.isTransportAvailed && (
                          <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                            <Text style={styles.sertext}>Seat price per person:</Text>
                            <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer}  >
                              <Image
                                source={require('../../assets/Image/money.png')} // Replace with your image path
                                style={styles.image}
                              />
                              <Text style={styles.answer}>Rs.{item.transportExpensePerPerson}</Text>
                            </Box>
                          </Box>
                        )}

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Food price per person:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <Image
                              source={require('../../assets/Image/money.png')} // Replace with your image path
                              style={styles.image}
                            />
                            <Text style={styles.answer}>Rs.{item.foodPricePerPerson}</Text>
                          </Box>
                        </Box>

                        <Box flexDirection={'row'} alignItems={'center'} padding={1} style={styles.container}>
                          <Text style={styles.sertext}>Total Bill:</Text>
                          <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} padding={1} style={styles.innerContainer} >
                            <Image
                              source={require('../../assets/Image/money.png')} // Replace with your image path
                              style={styles.image}
                            />
                            <Text style={styles.answer}>Rs.{item.amountPaid}</Text>
                          </Box>
                        </Box>


                        {new Date() <
                          addDays(new Date(item.createdAt.split("T")[0]), 1) && (
                            <TouchableOpacity
                              style={styles.cancelButton}
                              onPress={() => {
                                openDialog(item);
                              }}
                            >
                              <Text style={styles.cancelText}>Cancel Booking</Text>
                            </TouchableOpacity>
                          )}


                      </Box>
                    )}
                  />
                ))}

        </Box>
      </Box>

      {/* Modal for cancel confirmation */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content width={'90%'} height={'30%'}>
          <Modal.Header>Cancel Booking</Modal.Header>
          <Modal.Body>
            <Text>Do you want to cancel your booking?</Text>
          </Modal.Body>
          <Modal.Footer>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.button} >
              <Text color={'white'} fontSize={16}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelBooking} style={styles.Cancelbutton} >
              <Text color={'white'} fontSize={16}>Yes</Text>
            </TouchableOpacity>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </NativeBaseProvider>
  );
};
export default BookingScreen;
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    flexWrap: 'wrap'
  },

  flatlistContainer: {
    paddingHorizontal: 5,
    paddingBottom: "25%",
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: '5%'
  },
  book: {
    // backgroundColor: "blue",
    paddingTop: '5%',
    paddingLeft: '3%',
    paddingRight: '3%'
  },
  sertext: {
    fontWeight: "800",
    fontSize: 15,
    marginBottom: "1%",
    // backgroundColor: "lightblue",
    width: '40%',
    flexWrap: 'wrap'
  },
  answer: {
    fontSize: 16,
    color: 'black',
    marginLeft: 10,
    flex: 1,
    textAlign: 'left',
    flexWrap: 'wrap'
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain',
  },
  cancelButton: {
    width: "80%",
    height: 60,
    backgroundColor: "#143E56",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    marginTop: '2%',
    marginLeft: "10%"
  },
  cancelText: {
    color: "white",
    fontSize: 17
  },
  shadow: {
    backgroundColor: '#EEEDED',
    borderRadius: 10,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingLeft: '2%'
  },
  button: {
    backgroundColor: "grey",
    width: "30%",
    height: 45,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    right: 120,
  },
  Cancelbutton: {
    backgroundColor: '#143E56',
    width: "30%",
    height: 45,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  availbutton: {
    backgroundColor: '#FFBF00',
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    paddingRight: "4%",
    paddingLeft: "4%",
  },
  tavailbutton: {
    backgroundColor: '#FFBF00',
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 55,
    paddingRight: "4%",
    paddingLeft: "4%",
  }

})