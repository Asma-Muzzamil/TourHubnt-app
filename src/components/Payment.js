import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeBaseProvider, Box, Text, Heading, Divider, Input, Button, useToast } from 'native-base';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useStripe, useElements, CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from './config.json';
import { useNavigation } from '@react-navigation/native';


const Payment = ({ route }) => {
    const [paymentPrice, setPaymentPrice] = useState(null);
    const [cardHolderName, setCardHolderName] = useState('');
    const [cardDetails, setCardDetails] = useState({});
    const stripe = useStripe();
    const toast = useToast();
    const [userId, setUserId] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [sellerName, setSellerName] = useState('');
    const [sellerEmail, setSellerEmail] = useState('');
    const [sellerId, setSellerId] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation(); // Navigation hook
    const apiUrl = config.API_URL;
    // const { totalPrice } = route.params;

    useEffect(() => {
        const getPaymentPrice = async () => {
            try {
                const storedPaymentPrice = await AsyncStorage.getItem('paymentPrice');
                if (storedPaymentPrice !== null) {
                    setPaymentPrice(storedPaymentPrice);
                }
            } catch (error) {
                console.error('Error retrieving paymentPrice from AsyncStorage:', error);
            }
        };

        getPaymentPrice();
    }, []);

    const handleCardHolderNameChange = (text) => {
        setCardHolderName(text);
    };

    const validateCardName = (name) => {
        const nameRegex = /^[A-Za-z\s-]+$/;
        return nameRegex.test(name);
    };

    const handleCardChange = (cardDetails) => {
        setCardDetails(cardDetails);
    };


    useEffect(() => {
        console.log("---------inside the use effect------------")
        const getData = async () => {
            try {
                const email = await AsyncStorage.getItem('currentUser');
                const response = await axios.post(
                    `${apiUrl}/findUserUsingEmail`,
                    { email }
                );
                const currentUser = response.data;

                console.log("thi is going ot give error")
                const currentServiceStr = await AsyncStorage.getItem('currentService');
                console.log('Retrieved currentService from AsyncStorage:', currentServiceStr);

                if (!currentServiceStr) {
                    throw new Error('No currentService found in AsyncStorage');
                }

                const currentService = JSON.parse(currentServiceStr);
                const serviceUserId = currentService.service.userId || currentService.service.sellerId;

                const sellerResponse = await axios.post(
                    `${apiUrl}/getUserDetails`,
                    { userId: serviceUserId }
                );
                const sellerUser = sellerResponse.data;

                console.log('Current User:', currentUser);
                console.log('Seller User:', sellerUser);
                setUserId(currentUser._id);
                setBuyerName(currentUser.username);
                setBuyerEmail(currentUser.email);
                setSellerName(sellerUser.username);
                setSellerEmail(sellerUser.email);
                setSellerId(serviceUserId);
                setServiceId(currentService.service._id);
                setServiceType(currentService.serviceType);
                setServiceName(currentService.serviceName);
                setAmount(await AsyncStorage.getItem('paymentPrice'));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        const checkLoggedIn = async () => {
            try {
                const currentUser = await AsyncStorage.getItem('currentUser');
                if (!currentUser) {
                    navigation.navigate('Login');
                } else {
                    setIsLoggedIn(true);
                    getData();
                }
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        };
        checkLoggedIn();
    }, [navigation]);


    const handlePayNow = async () => {
        if (!stripe || !cardDetails.complete || !cardHolderName) {
            console.log('card details are incomplete.');
            toast.show({
                description: `card details are incomplete.`,
                placement: "top",
                backgroundColor: "red.500",
                duration: 2000,
            });
            return;
        }
        if (!validateCardName(cardHolderName)) {
            toast.show({
                description: 'Kindly give your card name (only alphabets).',
                placement: 'top',
                backgroundColor: 'red.500',
                duration: 2000,
            });
            return;
        }

        setIsLoading(true); // Show loader overlay
        const billingDetails = {
            name: cardHolderName,
        }

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                paymentMethodType: 'Card',
                card: {
                    last4: cardDetails.last4,
                },
                paymentMethodData: {
                    billingDetails,
                },

            });
            if (error) {
                console.log(error);
                toast.show({
                    description: error.message,
                    placement: "top",
                    backgroundColor: "red.500",
                    duration: 2000,
                });
            } else {
                console.log('Payment method created:', paymentMethod);
                try {
                    const currentService = await AsyncStorage.getItem('currentService');
                    const isTransportAvailed = await AsyncStorage.getItem("isTransportAvailed");
                    const storedNumberOfSeats = await AsyncStorage.getItem("numberOfSeats");
                    const isAccommodationAvailed = await AsyncStorage.getItem("isAccommodationAvailed");
                    const numberOfRooms = await AsyncStorage.getItem("numberOfRooms");
                    const customerContact = await AsyncStorage.getItem("customerContact");
                    const numberOfPeople = await AsyncStorage.getItem("numberOfPeople");
                    const tp = JSON.parse(currentService).service;
                    const parsedTransportAvailed = JSON.parse(isTransportAvailed);
                    const parsedNumberOfSeats = JSON.parse(storedNumberOfSeats);
                    const parsedisAccommodationAvailed = JSON.parse(isAccommodationAvailed);
                    const parsednumberOfRooms = JSON.parse(numberOfRooms);
                    console.log("this is tp", tp);
                    console.log(userId);
                    console.log(sellerId);
                    console.log(tp.arrivalDate);
                    console.log(tp.departureDate);
                    console.log(customerContact);
                    console.log(amount);
                    console.log(tp.contact);


                    console.log("Current Service Type:", JSON.parse(currentService).serviceType);
                    console.log(JSON.parse(await AsyncStorage.getItem('updateTpBooking')));

                    if (!JSON.parse(await AsyncStorage.getItem('updateTpBooking'))) {
                        await axios.post(`${apiUrl}/savePayment`, {
                            serviceId,
                            serviceType,
                            serviceName,
                            userId,
                            amount,
                            status: "not reviewed",
                            username: buyerName,
                        });
                    }
                    if (JSON.parse(await AsyncStorage.getItem('updateTpBooking'))) {
                        console.log("inside tp booking")
                        const updateTpBooking = JSON.parse(await AsyncStorage.getItem('updateTpBooking'))
                        const { action, numberOfPeople, id, serviceId, buyerId, previousAmount } = updateTpBooking;
                        if (action == "Avail Hotel") {
                            console.log("inside the avail hotel")
                            await axios.post(`${apiUrl}/updateTpBookingHotel`, {
                                _id: id,
                                isAccommodationAvailed: true,
                                numberOfRooms: numberOfPeople,
                                amountPaid: parseFloat(amount) + parseFloat(previousAmount),
                            });
                            console.log("inside the avail hotel")
                        }
                        if (action == "Avail Transport") {
                            await axios.post(`${apiUrl}/updateTpBookingTransport`, {
                                _id: id,
                                isTransportAvailed: true,
                                numberOfSeats: numberOfPeople,
                                amountPaid: parseFloat(amount) + parseFloat(previousAmount),
                            });
                        }
                        await axios.post(`${apiUrl}/updatePaymentAfterAvailing`, {
                            userId: buyerId,
                            serviceId,
                            amountPaid: parseFloat(amount) + parseFloat(previousAmount),
                        });
                        console.log("payment updated")
                    }
                    else if (JSON.parse(currentService).serviceType === "Tour Package") {
                        console.log("inside the booking ")
                        await axios.post(`${apiUrl}/bookTourPackage`, {
                            buyerId: userId,
                            sellerId,
                            serviceId,
                            buyerName,
                            sellerName,
                            serviceName,
                            buyerEmail,
                            sellerEmail,
                            amountPaid: amount,
                            sellerContact: tp.contact,
                            buyerContact: customerContact,
                            departureDate: tp.departureDate,
                            arrivalDate: tp.arrivalDate,
                            summary: tp.summary || "-",
                            inclusions: tp.inclusions || "-",
                            exclusions: tp.exclusions || "-",
                            hotelCompanyName: tp.hotelCompanyName,
                            hotelRoomExpensePerPerson: tp.hotelRoomExpensePerPerson,
                            transportExpensePerPerson: tp.transportExpensePerPerson,
                            foodPricePerPerson: tp.foodPrice,
                            numberOfSeats: parsedTransportAvailed && parsedNumberOfSeats,
                            numberOfRooms: parsedisAccommodationAvailed && parsednumberOfRooms,
                            price: tp.price,
                            destination: tp.destination,
                            province: tp.province,
                            country: tp.country,
                            departureCity: tp.departureCity,
                            breakfast: tp.breakfast,
                            lunch: tp.lunch,
                            dinner: tp.dinner,
                            foodPrice: tp.foodPrice * JSON.parse(storedNumberOfSeats),
                            transportType: tp.transportType,
                            status: "Pending",
                            city: tp.city,
                            tourDuration: tp.tourDuration,
                            businessName: tp.businessName,
                            imageUrls: tp.imageUrls,
                            isTransportAvailed: JSON.parse(isTransportAvailed),
                            isAccommodationAvailed: JSON.parse(isAccommodationAvailed),
                            numberOfPeople: JSON.parse(numberOfPeople),
                        });

                        axios.post(`${apiUrl}/sendMail`, {
                            to: buyerEmail,
                            subject: "Tour Package Booking Success!",
                            body: `<p>Dear ${buyerName},</p>
                       <p>Your booking of tour package "${serviceName}" has been successfully confirmed.</p>
                       <br/>
                       <p><b>Departure City:</b> ${tp.departureCity}</p>
                       <p><b>Destination City:</b> ${tp.city}</p>
                       <p><b>Destination(s):</b> ${tp.destination}</p>
                       <p><b>Departure Date:</b> ${tp.departureDate}</p>
                       <p><b>Arrival Date:</b> ${tp.arrivalDate}</p>
                       <p><b>Number of People:</b> ${numberOfPeople}</p>
                       <p><b>Amount Paid:</b> Rs.${amount}</p>
                       <br/>
                       <p>Thank you for using our service!</p>`,
                        });
                    }
                    await axios.post(`${apiUrl}/savePurchasedService`, {
                        buyerId: userId,
                        sellerId,
                        serviceId,
                        serviceName,
                        buyerName,
                        sellerName,
                        buyerEmail,
                        sellerEmail,
                        serviceType,
                        amountPaid: amount,
                    });
                    console.log("done")
                    toast.show({
                        description: 'Booking successful, you will shortly recieve a mail',
                        placement: "top",
                        backgroundColor: "green.600",
                        duration: 2000,
                    });

                    navigation.navigate('BookedPackages');
                    await AsyncStorage.removeItem('currentService');
                    await AsyncStorage.removeItem('isTransportAvailed');
                    await AsyncStorage.removeItem('numberOfSeats');
                    await AsyncStorage.removeItem('isAccommodationAvailed');
                    await AsyncStorage.removeItem('numberOfRooms');
                    await AsyncStorage.removeItem('customerContact');
                    await AsyncStorage.removeItem('numberOfPeople');
                    await AsyncStorage.removeItem('updateTpBooking');
                    console.log('Items removed from AsyncStorage successfully.');

                } catch (axiosError) {
                    console.error('Error', axiosError);
                }

            }
        }
        catch (error) {
            console.log('Error handling payment:', error);
            toast.show({
                description: 'Failed to handle payment',
                placement: "top",
                backgroundColor: "red.500",
                duration: 2000,
            });
        }
        finally {
            setIsLoading(false); // Hide loader overlay after payment handling completes
        }
    };



    return (
        <NativeBaseProvider>
            <Box style={styles.container}>
                <Heading size="xl" color={'black'}>Payment Details</Heading>
                <Text marginTop={'1%'} color={'black'} fontSize={16} fontWeight={'800'}>Total Amount: Rs.{paymentPrice}</Text>
                <Divider marginTop={6} width={'80%'} bg="lightgrey" thickness="1" marginBottom={'5%'} />
                <Box width={'100%'} height={'100%'}>
                    <Box style={styles.shadow}>
                        <ScrollView>
                            <Box style={styles.form}>
                                <Heading size="md">Credit/Debit payment</Heading>
                                <FontAwesomeIcon
                                    icon={faCreditCard}
                                    size={25}
                                    color="black"
                                    style={{ bottom: 25, left: "90%" }}
                                />
                                <Box marginTop={'1%'} paddingRight={'2%'}>
                                    <Text fontSize={17} fontWeight={'700'} top={'2%'}>Cardholder's Name <Text color={'red.500'} marginLeft={'1%'} >*</Text></Text>
                                    <Input
                                        placeholder="Enter Cardholder's Name"
                                        value={cardHolderName}
                                        onChangeText={handleCardHolderNameChange}
                                        variant="underlined"
                                        style={{ fontSize: 15 }}
                                        borderColor={'black'}
                                    />
                                </Box>
                                <Box marginTop={'4%'} width={'100%'}>
                                    <Text fontSize={17} fontWeight={'700'} top={'2%'}>Card Details <Text color={'red.500'}>*</Text></Text>
                                    <Text color={'black'}>Only master or visa Card is applicable</Text>
                                    <CardField
                                        postalCodeEnabled={false}
                                        placeholders={{
                                            number: '4242 4242 4242 4242',
                                        }}
                                        cardStyle={{
                                            backgroundColor: '#FFFFFF',
                                            textColor: '#000000',
                                            borderWidth: 1,
                                            borderColor: "grey",
                                            borderRadius: 4,
                                            placeholderColor: "grey"
                                        }}
                                        style={{
                                            width: '100%',
                                            height: 50,
                                            marginVertical: 20,
                                        }}
                                        onCardChange={handleCardChange}
                                        onFocus={(focusedField) => {
                                            console.log('focusField', focusedField);
                                        }}
                                    />
                                </Box>
                                <TouchableOpacity onPress={handlePayNow} style={styles.button}>
                                    <Text fontSize={21} color={'white'} >Submit Payment</Text></TouchableOpacity>
                            </Box>
                        </ScrollView>
                    </Box>
                </Box>
                {isLoading &&
                    <Box style={styles.overlay}>
                        <ActivityIndicator size="large" color="white" />
                    </Box>}
            </Box >
        </NativeBaseProvider >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        paddingTop: "16%",
        alignItems: 'center',
        backgroundColor: 'white',
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        top: 45,
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: '#fff',
        margin: '3%',
        width: '93%',
        height: "60%",
        backgroundColor: "#F4F2F2"
    },
    form: {
        marginTop: '7%',
        marginLeft: '2%',
        marginBottom: '1%',
        paddingLeft: '2%',
        width: '95%',
        // backgroundColor:"blue"
    },
    cardField: {
        height: 50,
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
    },
    button: {
        backgroundColor: "#143E56",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 7
    }, overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Payment;




