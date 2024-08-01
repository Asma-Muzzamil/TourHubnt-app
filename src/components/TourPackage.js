import React, { useRef, useState, useEffect } from 'react';
import { NativeBaseProvider, Box, Modal } from 'native-base';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSearch, faBed, faCar, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import config from './config.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TourPackage = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tourPackage, setTourPackage] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredTourPackage, setFilteredTourPackage] = useState([]);
  const [error, setError] = useState('');
  const isFocused = useIsFocused(); // Add this line
  const [lastFilteredLocation, setLastFilteredLocation] = useState('');
  const isInitialMount = useRef(true);
  const [showLoader, setShowLoader] = useState(false);
  const [noDataTimer, setNoDataTimer] = useState(null);
  // const navigation = useNavigation();
  const apiUrl = config.API_URL;
  useEffect(() => {
    // console.log("in first fetching use effect")
    if (isInitialMount.current) {
      loadTourPackages();
      isInitialMount.current = false;
    }
  }, []);
  // const loadTourPackages = async () => {
  //   console.log("hihi")
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`${apiUrl}/tourpackages?page=1&pageSize=20`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch tour packages');
  //     }
  //     const data = await response.json();
  //     setTourPackage(data);
  //     setFilteredTourPackage(data); // Initially set to all packages
  //   } catch (error) {
  //     console.error('Error fetching tour packages:', error);
  //     setError('Failed to fetch tour packages. Please try again later.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  useEffect(() => {
    if (!searchQuery.trim()) {
      // setFilteredTourPackage(tourPackage);
      clearSearch();
    } else {
      handleSearch();
    }
  }, [searchQuery]);
  useEffect(() => {
    if (isFocused) {
      if (route.params?.location && route.params.location !== lastFilteredLocation) {
        filterTourPackages(route.params.location);
        setLastFilteredLocation(route.params.location);
        navigation.setParams({ location: null });
      } else {
        setFilteredTourPackage(tourPackage);
        setLastFilteredLocation('');
      }
    }
  }, [isFocused]);
  // console.log("the last location was", lastFilteredLocation)
  //  const loadTourPackages = async (page = 1, pageSize = 20) => {
  //   if (loading) return;
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`${apiUrl}/tourpackages?page=${page}&pageSize=${pageSize}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch tour packages');
  //     }
  //     const data = await response.json();
  //     // Append new data to tourPackage without duplicates
  //     const updatedPackages = page === 1 ? data : [...tourPackage, ...data.filter(item => !tourPackage.find(existing => existing.id === item.id))];
  //     console.log(" i came here")
  //     setTourPackage(updatedPackages);
  //     filterAndSetPackages(updatedPackages);
  //   } catch (error) {
  //     console.error('Error fetching tour packages:', error);
  //     setError('Failed to fetch tour packages. Please try again later.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const loadTourPackages = async (page = 1, pageSize = 20, append = false) => {
  //   if (loading) return;
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`${apiUrl}/tourpackages?page=${page}&pageSize=${pageSize}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch tour packages');
  //     }
  //     const data = await response.json();
  //     let updatedPackages = [];
  //     if (append) {
  //       updatedPackages = [...tourPackage, ...data.filter(item => !tourPackage.find(existing => existing.id === item.id))];
  //     } else {
  //       updatedPackages = data;
  //     }
  //     setTourPackage(updatedPackages);
  //     if (!lastFilteredLocation) {
  //       filterAndSetPackages(updatedPackages);
  //     } else {
  //       filterTourPackages(lastFilteredLocation); // Apply location filter if it exists
  //     }
  //   } catch (error) {
  //     console.error('Error fetching tour packages:', error);
  //     setError('Failed to fetch tour packages. Please try again later.');
  //   } finally {
  //     setLoading(false);
  //     startNoDataTimer();
  //   }
  // };

  const loadTourPackages = async (page = 1, pageSize = 20, append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/tourpackages?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tour packages');
      }
      const data = await response.json();
      let updatedPackages = [];
      if (append) {
        updatedPackages = [...tourPackage, ...data.filter(item => !tourPackage.find(existing => existing.id === item.id))];
      } else {
        updatedPackages = data;
      }
      setTourPackage(updatedPackages);
      if (!lastFilteredLocation) {
        filterAndSetPackages(updatedPackages);
      } else {
        filterTourPackages(lastFilteredLocation); // Apply location filter if it exists
      }
      startNoDataTimer(); // Start timer after fetching data
    } catch (error) {
      console.error('Error fetching tour packages:', error);
      setError('Failed to fetch tour packages. Please try again later.');
      setLoading(false); // Set loading to false on error
    }
  };
  const filterAndSetPackages = (packages) => {
    const filteredPackages = filterPackages(packages);
    setFilteredTourPackage(filteredPackages);
  };

  const filterPackages = (packages) => {
    if (!searchQuery.trim()) {
      return packages;
    }
    const trimmedQuery = searchQuery.trim().toLowerCase();
    return packages.filter(item =>
      item.departureCity.toLowerCase().startsWith(trimmedQuery) ||
      item.destination.toLowerCase().startsWith(trimmedQuery)
    );
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredTourPackage(tourPackage);
      return;
    }
    const filteredPackages = filterPackages(tourPackage);
    setFilteredTourPackage(filteredPackages);
    startNoDataTimer(); // Start the timer on search
  };

  const filterTourPackages = (location) => {
    if (!location) {
      console.log("filter tour packages")
      setFilteredTourPackage(tourPackage);
      return;
    }
    const filteredPackages = tourPackage.filter(item =>
      item.city.toLowerCase() === location.toLowerCase() ||
      item.province.toLowerCase() === location.toLowerCase()
    );
    setFilteredTourPackage(filteredPackages);
  };


  const startNoDataTimer = () => {
    clearTimeout(noDataTimer); // Clear previous timer
    setShowLoader(true); // Show loader initially
    setNoDataTimer(setTimeout(() => {
      setShowLoader(false); // Hide loader after 5 seconds
      if (filteredTourPackage.length === 0 && searchQuery.trim()) {
        setError('No results found.'); // Set error if no results found and search query exists
      } else {
        setError(''); // Clear any existing error if results are found
      }
    }, 5000)); // 5 seconds
  };


  const openDetailsModal = (packageData) => {
    setSelectedPackage(packageData);
    setModalVisible(true);
  };
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredTourPackage(tourPackage);
    setError('');
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  const renderItem = ({ item }) => (
    <View style={styles.tourPackageCard} onPress={openDetailsModal}>
      <View style={styles.imageContainer}>
        {item?.imageUrls?.length > 0 ? (
          <Image source={{ uri: item.imageUrls[0] }} style={styles.image} />
        ) : (
          <Image source={require('../../assets/Image/default.jpg')} style={styles.image} />
        )}
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.packageName}>{item.name}</Text>
        <View style={styles.iconContainer}>
          <Box flexDirection={"column"} marginRight={7}>
            <FontAwesomeIcon icon={faBed} size={20} color='grey' />
            <Text style={styles.iconText}>Hotel</Text>
          </Box>
          <Box flexDirection={"column"} marginRight={7}>
            <FontAwesomeIcon icon={faCar} size={20} color='grey' />
            <Text style={styles.iconText}>Transport</Text>
          </Box>
          <Box flexDirection={"column"} marginRight={7}>
            <FontAwesomeIcon icon={faUtensils} size={20} color='grey' />
            <Text style={styles.iconText}>Meal</Text>
          </Box>
        </View>
        <Box flexDirection={'row'} justifyContent={"space-between"}>
          <TouchableOpacity style={styles.detailsButton} onPress={() => openDetailsModal(item)}>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
          <Text style={{ color: "black", marginRight: "7%", fontWeight: '500', fontSize: 18 }}>Rs.{item.price}</Text>
        </Box>
      </View>
    </View>
  );
  // const handleEndReached = () => {
  //   if (!loading) {
  //     setCurrentPage(prevPage => prevPage + 1);
  //     loadTourPackages(currentPage + 1);
  //   }
  // };
  const handleEndReached = () => {
    if (!loading) {
      console.log("calling next 20 ")
      setCurrentPage(prevPage => prevPage + 1);
      loadTourPackages(currentPage + 1, 20, true);
    }
  };

  const handleBookNow = async () => {
    if (selectedPackage) {
      // Store selected package details in AsyncStorage
      try {
        await AsyncStorage.setItem(
          "currentService",
          JSON.stringify({
            serviceId: selectedPackage._id,
            serviceType: "Tour Package",
            serviceName: selectedPackage.name,
            service: selectedPackage,
          })
        );
        console.log("Stored selected package in AsyncStorage:",  selectedPackage._id);

        // Navigate to Process screen with package details
        navigation.navigate('Process', { packageDetails: selectedPackage });
        closeModal(); // Assuming closeModal function is defined somewhere to close the modal or navigate back
      } catch (error) {
        console.error('Error storing selected package:', error);
      }
    }
  };
  return (
    <NativeBaseProvider>
      <Box style={styles.main_box}>
        <Box style={{ marginTop: 20, paddingLeft: 15, paddingRight: 15 }}>
          <Box style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: "#2A656D", paddingLeft: 20, borderRadius: 15 }}>
            <TextInput
              placeholder="Search by departure or destination"
              placeholderTextColor="white"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && searchQuery === '') {
                  clearSearch();
                }
              }}
              style={{ color: 'white', flex: 1 }}
            />
            <TouchableOpacity onPress={handleSearch}>
              <FontAwesomeIcon icon={faSearch} color="white" size={15} style={{ marginRight: '10%' }} />
            </TouchableOpacity>
          </Box>
        </Box>
        {showLoader ? (
          <Box alignItems={"center"} justifyContent={"center"} height={"50%"}>
            <ActivityIndicator size="large" color="#0000ff" />
          </Box>
        ) :
          error ? (
            <Box alignItems={"center"} marginLeft={"20%"} textAlign={"center"} width={"60%"} height={"50%"} justifyContent={"center"}>
              <Text style={{ fontSize: 20, color: "black" }}>{error}</Text>
            </Box>
          ) :
            (<FlatList
              data={filteredTourPackage}
              renderItem={renderItem}
              style={styles.flat}
              keyExtractor={(item, index) => index.toString()}
              onEndReachedThreshold={0.1}
              onEndReached={handleEndReached}
              contentContainerStyle={{ alignItems: 'center' }}
              ListFooterComponent={showLoader && filteredTourPackage.length > 0 ? <ActivityIndicator size="large" color="#0000ff" /> : null}
            />
            )}
        <Modal isOpen={modalVisible} onClose={closeModal}>
          <Modal.Content style={styles.modalContent}>
            <View style={styles.modalContainer}>
              <ScrollView>
                {selectedPackage && (
                  <Box p={4}>
                    <Text style={styles.modalHeading}>Details</Text>
                    <Text style={styles.modalText}>Name: {selectedPackage.name}</Text>
                    {selectedPackage.hotelCompanyName && <Text style={styles.modalText}>Hotel Company Name: {selectedPackage.hotelCompanyName}</Text>}
                    {selectedPackage.hotelRoomExpensePerPerson && <Text style={styles.modalText}>Hotel Expense per Person: Rs.{selectedPackage.hotelRoomExpensePerPerson}</Text>}
                    {selectedPackage.destination && <Text style={styles.modalText}>Destination: {selectedPackage.destination}</Text>}
                    {selectedPackage.province && <Text style={styles.modalText}>Province: {selectedPackage.province}</Text>}
                    {selectedPackage.country && <Text style={styles.modalText}>Country: {selectedPackage.country}</Text>}
                    {selectedPackage.departureCity && <Text style={styles.modalText}>Departure City: {selectedPackage.departureCity}</Text>}
                    {selectedPackage.breakfast && selectedPackage.breakfast.length > 0 && (
                      <Text style={styles.modalText}>Breakfast: {selectedPackage.breakfast.join(', ')}</Text>
                    )}
                    {selectedPackage.lunch && selectedPackage.lunch.length > 0 && (
                      <Text style={styles.modalText}>Lunch: {selectedPackage.lunch.join(', ')}</Text>
                    )}
                    {selectedPackage.dinner && selectedPackage.dinner.length > 0 && (
                      <Text style={styles.modalText}>Dinner: {selectedPackage.dinner.join(', ')}</Text>
                    )}
                    {selectedPackage.foodPrice && <Text style={styles.modalText}>Food Price: {selectedPackage.foodPrice}</Text>}
                    {selectedPackage.transportType && <Text style={styles.modalText}>Transport Type: {selectedPackage.transportType}</Text>}
                    {selectedPackage.transportExpensePerPerson && <Text style={styles.modalText}>Transport Expense per Person: Rs.{selectedPackage.transportExpensePerPerson}</Text>}
                    {selectedPackage.status && <Text style={styles.modalText}>Status: {selectedPackage.status}</Text>}
                    {selectedPackage.city && <Text style={styles.modalText}>City: {selectedPackage.city}</Text>}
                    {selectedPackage.tourDuration && <Text style={styles.modalText}>Tour Duration: {selectedPackage.tourDuration} days</Text>}
                    {selectedPackage.businessName && <Text style={styles.modalText}>Business Name: {selectedPackage.businessName}</Text>}
                    {selectedPackage.departureDate && <Text style={styles.modalText}>Departure Date: {selectedPackage.departureDate}</Text>}
                    {selectedPackage.arrivalDate && <Text style={styles.modalText}>Arrival Date: {selectedPackage.arrivalDate}</Text>}
                    {selectedPackage.contact && <Text style={styles.modalText}>Contact: {selectedPackage.contact}</Text>}
                    {selectedPackage.price && <Text style={styles.modalText}>Total Price: Rs.{selectedPackage.price}</Text>}
                    {selectedPackage.summary && selectedPackage.summary.length > 0 && (
                      <View>
                        <Text style={styles.modalSubHeading}>Summary:</Text>
                        {selectedPackage.summary.map((item, index) => (
                          <Text key={index} style={styles.modalText}>- {item}</Text>
                        ))}
                      </View>
                    )}
                    {selectedPackage.inclusions && selectedPackage.inclusions.length > 0 && (
                      <View>
                        <Text style={styles.modalSubHeading}>Inclusions:</Text>
                        {selectedPackage.inclusions.map((item, index) => (
                          <Text key={index} style={styles.modalText}>- {item}</Text>
                        ))}
                      </View>
                    )}
                    {selectedPackage.exclusions && selectedPackage.exclusions.length > 0 && (
                      <View>
                        <Text style={styles.modalSubHeading}>Exclusions:</Text>
                        {selectedPackage.exclusions.map((item, index) => (
                          <Text key={index} style={styles.modalText}>- {item}</Text>
                        ))}
                      </View>
                    )}
                  </Box>
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.modalButton, styles.bookButton]} onPress={handleBookNow}>
                    <Text style={styles.modalButtonText}>Book Now</Text>
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
    </NativeBaseProvider >
  );
};

export default TourPackage;

const styles = StyleSheet.create({
  main_box: {
    flex: 1,
    backgroundColor: "#EEEDED",
    position: "relative"
  },
  flat: {
    height: "100%",
    marginTop: '10%'
  },
  tourPackageCard: {
    flexDirection: 'row',
    display: "flex",
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    height: 215,
    width: '95%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    width: '33%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 3,
    color: "black"
  },
  iconContainer: {
    flexDirection: 'row',
    marginBottom: 7,
    alignItems: "center",
    height: "40%"
  },
  iconText: {
    color: "grey",
    fontWeight: "500"
  },
  detailsButton: {
    backgroundColor: '#143E56',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContent: {
    position: "absolute",
    bottom: 72,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: "90%",
    height: "50%"
  },
  modalContainer: {
    // backgroundColor:"red",
    padding: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: "black"
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: "black",
    fontWeight: "500"
  },
  modalSubHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
    color: "black"
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  bookButton: {
    backgroundColor: '#FFBF00'
  },
  closeButton: {
    backgroundColor: 'grey',
  },
  modalButtonText: {
    fontSize: 16,
    color: "black"
  },
})
