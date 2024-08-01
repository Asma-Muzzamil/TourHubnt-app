import React, { useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import { NativeBaseProvider, Box, Center, Heading } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import Swiper from 'react-native-swiper';


export default function SplashScreen() {
    const navigation = useNavigation();


    const handleLoginPress = () => {
        navigation.navigate('Login');
    };

    const handleSignupPress = () => {
        navigation.navigate('Signup');
    };

    return (
        <NativeBaseProvider>
            <View style={styles.container}>
                <Box style={styles.imageContainer}>
                    <Swiper
                        style={styles.wrapper}
                        loop={true}
                        showsPagination={false}
                        autoplay={true}
                        autoplayTimeout={5}
                        removeClippedSubviews={false}
                       >
                        <View style={styles.slide}>
                            <Image source={require('../../assets/Image/TOUR2.png')} style={styles.image} />
                        </View>
                        <View style={styles.slide}>
                            <Image source={require('../../assets/Image/splash2.jpg')} style={styles.image} />
                        </View>
                        <View style={styles.slide}>
                            <Image source={require('../../assets/Image/TOUR.jpg')} style={styles.image} />
                        </View>
                    </Swiper>
                </Box>

                <Box style={styles.box}>
                    <Center>
                        <Box style={styles.heading_box}>
                            <Text style={styles.headingOne}>Welcome To </Text>
                            <Text style={styles.heading}>  TOUR HUNT</Text>
                        </Box>
                        <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
                            <Text style={styles.buttonText}>Login Through Email or Goggle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.reg]} onPress={handleSignupPress}>
                            <Text style={[styles.buttonText, styles.reg_Text]}>Register Thourgh Email</Text>
                        </TouchableOpacity>
                    </Center>
                </Box>
            </View>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    wrapper: {},
    container: {
        flex: 1,
        backgroundColor: "#adecf3",
        position: "relative",
    },
    imageContainer: {
        width: '100%',
        height: '65%',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        position: "relative",
        width: '100%',
        height: "100%"
    },
    box: {
        height: "50%",
        width: "94%",
        marginTop: "2%",
        position: "absolute",
        backgroundColor: "white",
        bottom: 0,
        left: 11,
        paddingTop: "4%",
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
    button: {
        backgroundColor: '#FFBF00', // Golden yellow color
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 5,
        marginTop: "9%",
        width: "90%"
    },
    buttonText: {
        color: 'white', // Black text color
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: "center"
    },
    heading: {
        fontFamily: 'IrishGrover-Regular', // Use the font family name,
        textAlign: "center",
        color: "#143E56",
        fontSize: 50,
        marginLeft: "5%",
    },
    headingOne: {
        marginLeft: "5%",
        color: "#143E56",
        fontSize: 30,
        fontWeight: "700",

    },
    heading_box: {
        width: "100%",
        paddingTop: "2%",
        paddingBottom: "2%"
    },
    reg: {
        backgroundColor: "#C0C0C0",
    },
    reg_Text: {
        color: 'black'
    }
});
