import React, { useRef, useState, useEffect } from 'react';
import { Box, NativeBaseProvider, Text, Switch, HStack, Center, Input, useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import config from './config.json';

export default function Process({ route }) {
    const { packageDetails } = route.params;
    const [isTransportSwitchOn, setIsTransportSwitchOn] = useState(true);
    const [isAccommodationSwitchOn, setIsAccommodationSwitchOn] = useState(true);
    const [count, setCount] = useState(1);
    const [contact, setContact] = useState('');
    const [numberOfRooms, setNumberOfRooms] = useState(1); // State for number of rooms
    const [numberOfSeats, setNumberOfSeats] = useState(1); // State for number of seats
    const [totalPrice, setTotalPrice] = useState(0);
    const toast = useToast();
    const navigation = useNavigation();
    const apiUrl = config.API_URL;

    useEffect(() => {
        calculateTotalPrice();
        updateRoomsAndSeats();
    }, [count, isTransportSwitchOn, isAccommodationSwitchOn]);
    console.log("in process");
    console.log(packageDetails)

    // Function to calculate total price
    const calculateTotalPrice = () => {
        const numberOfPersons = count;
        const averageFoodRate = Number(packageDetails.foodPrice);
        const hotelRoomExpensePerPerson = Number(packageDetails.hotelRoomExpensePerPerson);
        const transportExpensePerPerson = Number(packageDetails.transportExpensePerPerson);

        let price = (averageFoodRate * numberOfPersons);

        if (isAccommodationSwitchOn) {
            price += (hotelRoomExpensePerPerson * numberOfPersons);
        }

        if (isTransportSwitchOn) {
            price += (transportExpensePerPerson * numberOfPersons);
        }

        setTotalPrice(price);
    };

    // Function to update rooms and seats based on number of people
    const updateRoomsAndSeats = () => {
        setNumberOfRooms(count); // Example logic to update rooms based on count
        setNumberOfSeats(count); // Example logic to update seats based on count
    };


    // Function to handle toggling Transport Switch
    const toggleTransportSwitch = () => {
        setIsTransportSwitchOn(!isTransportSwitchOn);
    };

    // Function to handle toggling Accommodation Switch
    const toggleAccommodationSwitch = () => {
        setIsAccommodationSwitchOn(!isAccommodationSwitchOn);
    };

    const incrementCount = () => {
        setCount(count + 1);
    };

    const decrementCount = () => {
        if (count > 1) {
            setCount(count - 1);
        }
    };

    // Function to navigate to Payment screen
    const handleBookNow = async () => {
        if (contact.trim() === ""  || contact.includes(" ") ) {
            toast.show({
                description: 'Please enter a valid contact number',
                placement: "top",
                backgroundColor: "red.500",
                duration: 2000,
            });
            return;
        }        
        if (contact.length < 11) {
            toast.show({
                description: "Contact number must be 11 digits.",
                placement: "top",
                backgroundColor: "red.500",
                duration: 2000,
            });
            return;
        }

        try {
            const email = await AsyncStorage.getItem("currentUser"); // Await the AsyncStorage call
            console.log("Stored email:", email);
            const userResponse = await axios.post(
                `${apiUrl}/findUserUsingEmail`,
                { email: email }
            );
            const userId = userResponse.data._id;
            const userName = userResponse.data.username;
            console.log("User ID:", userId);
            console.log("User name:", userName);
            await AsyncStorage.setItem("paymentPrice", totalPrice.toString());
            await AsyncStorage.setItem("customerContact", contact);
            await AsyncStorage.setItem("numberOfSeats", numberOfSeats.toString());
            await AsyncStorage.setItem("numberOfRooms", numberOfRooms.toString());
            await AsyncStorage.setItem("isAccommodationAvailed", JSON.stringify(isAccommodationSwitchOn));
            await AsyncStorage.setItem("isTransportAvailed", JSON.stringify(isTransportSwitchOn));
            await AsyncStorage.setItem("numberOfPeople", count.toString());

            // After setting all AsyncStorage values, navigate to Payment screen
            navigation.navigate('Payment', {
                totalPrice,
                packageDetails, // Pass packageDetails here
                userId,
                userName,
            });

        } catch (error) {
            console.error('Error handling book now:', error);
        }
    };

    return (
        <NativeBaseProvider>
            <Box style={styles.main}>
                <Box style={styles.shadow}>
                    <ScrollView>
                        <Box style={{ paddingBottom: "5%", paddingTop: '5%', flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Box style={styles.imageContainer}>
                                {packageDetails?.imageUrls?.length > 0 ? (
                                    <Image source={{ uri: packageDetails.imageUrls[0] }} style={styles.image} />
                                ) : (
                                    <Image source={require('../../assets/Image/default.jpg')} style={styles.image} />
                                )}
                            </Box>
                            <Box style={{ justifyContent: "center" }}>
                                <Text style={styles.text}>Company: {packageDetails.businessName} </Text>
                                <Text style={styles.text}>Package Name: {packageDetails.name} </Text>
                                <Text style={styles.text}>Departure City: {packageDetails.departureCity} </Text>
                                <Text style={styles.text}>Destination: {packageDetails.destination} </Text>
                                <Text style={styles.text}>Tour Duration: {packageDetails.tourDuration} days </Text>
                                <Text style={styles.text}>Price: Rs.{packageDetails.price} </Text>
                                <Text style={styles.text}>Contact: {packageDetails.contact} </Text>
                                {packageDetails.summary && packageDetails.summary.length > 0 && (
                                    <Box>
                                        <Text style={styles.text}>Summary:</Text>
                                        {packageDetails.summary.map((item, index) => (
                                            <Text key={index} style={styles.text}>- {item}</Text>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                            <Box style={styles.serviceContainer}>
                                <Text style={styles.heading}>Services</Text>
                                <Box marginTop={'4%'} width={'100%'} >
                                    <Box padding={2} backgroundColor={'#2A656D'} borderRadius={6}>
                                        <Text style={styles.inheading}>Food</Text>
                                    </Box>
                                    <Box width={'100%'} backgroundColor={"#1F516D"} borderRadius={6} >
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Breakfast:</Text>
                                            <Text style={styles.sertext}>{packageDetails.breakfast}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Lunch:</Text>
                                            <Text style={styles.sertext}>{packageDetails.lunch}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Dinner:</Text>
                                            <Text style={styles.sertext}>{packageDetails.dinner}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>FoodPrice:</Text>
                                            <Text style={styles.sertext}>Rs.{packageDetails.foodPrice}</Text>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box marginTop={'5%'} width={'100%'} >
                                    <Box padding={2} backgroundColor={'#2A656D'} borderRadius={6}>
                                        <Text style={styles.inheading}>Transport</Text>
                                    </Box>
                                    <Box width={'100%'} backgroundColor={"#1F516D"} borderRadius={6} >
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Charges:</Text>
                                            <Text style={styles.sertext}>Rs.{packageDetails.transportExpensePerPerson}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Number of seats:</Text>
                                            <Text style={styles.sertext}>{numberOfSeats}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Transport Type:</Text>
                                            <Text style={styles.sertext}>{packageDetails.transportType}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Avail :</Text>
                                            <Switch
                                                isChecked={isTransportSwitchOn}
                                                onToggle={toggleTransportSwitch}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                <Box marginTop={'5%'} width={'100%'} >
                                    <Box padding={2} backgroundColor={'#2A656D'} borderRadius={6}>
                                        <Text style={styles.inheading}>Accomodation</Text>
                                    </Box>
                                    <Box width={'100%'} backgroundColor={"#1F516D"} borderRadius={6}>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Name:</Text>
                                            <Text style={styles.sertext}>{packageDetails.hotelCompanyName}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Number of rooms:</Text>
                                            <Text style={styles.sertext}>{numberOfRooms}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Charges:</Text>
                                            <Text style={styles.sertext}>Rs.{packageDetails.hotelRoomExpensePerPerson}</Text>
                                        </Box>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Avail:</Text>
                                            <Switch
                                                isChecked={isAccommodationSwitchOn}
                                                onToggle={toggleAccommodationSwitch}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                {packageDetails.inclusions && packageDetails.inclusions.length > 0 && (
                                    <Box marginTop={'4%'} width={'100%'} >
                                        <Box padding={2} backgroundColor={'#2A656D'} borderRadius={6}>
                                            <Text style={styles.inheading}>Inclusions</Text>
                                        </Box>
                                        <Box width={'100%'} backgroundColor={"#1F516D"} borderRadius={6} paddingLeft={5} paddingBottom={3} paddingTop={3}>
                                            {packageDetails.inclusions.map((item, index) => (
                                                <Text key={index} style={styles.sertext}>- {item}</Text>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                {packageDetails.exclusions && packageDetails.exclusions.length > 0 && (
                                    <Box marginTop={'4%'} width={'100%'} >
                                        <Box padding={2} backgroundColor={'#2A656D'} borderRadius={6}>
                                            <Text style={styles.inheading}>Exclusions</Text>
                                        </Box>
                                        <Box width={'100%'} backgroundColor={"#1F516D"} borderRadius={6} paddingLeft={5} paddingBottom={3} paddingTop={3}>
                                            {packageDetails.exclusions.map((item, index) => (
                                                <Text key={index} style={styles.sertext}>- {item}</Text>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                <Box marginTop={'5%'} width={'100%'} marginBottom={'7%'}>
                                    <Box padding={2} backgroundColor={'#2A656D'} borderRadius={6}>
                                        <Text style={styles.inheading}>Bill</Text>
                                    </Box>
                                    <Box width={'100%'} backgroundColor={"#1F516D"} borderRadius={6}>
                                        <Box justifyContent="space-between" padding={2} flexDirection={'row'}>
                                            <Text style={styles.sertext}>Number of People:</Text>
                                            <HStack width={'20%'} justifyContent={'center'}>
                                                <TouchableOpacity onPress={decrementCount} style={[styles.marginL, styles.counterbutton]} >
                                                    <Text fontSize={20} color={'white'}>-</Text>
                                                </TouchableOpacity>
                                                <Center width={15}>
                                                    <Text color={'white'}>{count}</Text>
                                                </Center>
                                                <TouchableOpacity onPress={incrementCount} style={[styles.marginR, styles.counterbutton,]}>
                                                    <Text color={'white'} fontSize={20}>+</Text>
                                                </TouchableOpacity>
                                            </HStack>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box marginBottom={'11%'} width={'90%'}>
                                <Text style={{ fontSize: 20, fontWeight: "800" }}>Contact <Text color={'red.500'}>*</Text> </Text>
                                <Input
                                    variant="outline"
                                    placeholder="12345678901"
                                    maxLength={11}
                                    value={contact}
                                    onChangeText={setContact}
                                    height={9}
                                    marginTop={2}
                                />
                            </Box>
                        </Box>
                    </ScrollView>
                </Box>

                <Box style={styles.priceBox}>
                    <Box justifyContent="space-between" padding={3} flexDirection={'row'}>
                        <Text style={styles.sertext}>Total: Rs.{totalPrice}</Text>
                        <TouchableOpacity style={styles.payButton} onPress={handleBookNow}>
                            <Text style={styles.sertext}>Book Now</Text>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </Box>
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'lightgrey',
        position: "relative",
    },
    shadow: {
        height: "95%",
        width: "95.5%",
        marginTop: '0%',
        position: "absolute",
        backgroundColor: "white",
        bottom: 20,
        left: 9,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -24
        },
        shadowOpacity: 1,
        shadowRadius: 9.11,
        elevation: 55,
    },
    imageContainer: {
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "5%"
    },
    image: {
        width: '90%',
        height: 200,
        borderRadius: 7
    },
    text: {
        color: "black",
        fontWeight: "800",
        fontSize: 15,
        marginBottom: "1%"
    },
    sertext: {
        color: "white",
        fontWeight: "800",
        fontSize: 15,
        marginBottom: "1%"
    },
    serviceContainer: {
        marginTop: "6%",
        alignItems: "flex-start",
        width: "89%",
    },
    heading: {
        color: "black",
        fontSize: 23,
        fontWeight: "800",
    },
    inheading: {
        color: "white",
        fontSize: 21,
        fontWeight: "800",
    },
    counterbutton: {
        alignItems: "center",
        justifyContent: "center",
    },
    marginR: {
        left: "11%"
    },
    marginL: {
        right: "11%"
    },
    priceBox: {
        backgroundColor: "#143E56",
        position: "absolute",
        width: "100%",
        bottom: 0,
        height: 50,
        justifyContent: "center"
    },
    payButton: {
        backgroundColor: "#2A656D",
        width: '35%',
        height: "125%",
        alignItems: "center",
        justifyContent: "center",
        top: -4,
        borderRadius: 6
    },
   

})
