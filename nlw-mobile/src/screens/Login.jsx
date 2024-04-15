import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Linking } from 'react-native';
import config from '../../config/config.js'; 

const Login = () => {
    const handleGoogleSignIn = async () => {
        try {
            const authUrl = `${config.SERVER_URL}/auth/google`;
            const supported = await Linking.canOpenURL(authUrl);
            if (supported) {
                await Linking.openURL(authUrl);
            } else {
                console.log(`Cannot open URL: ${authUrl}`);
            }
        } catch (error) {
            console.log(`An error occurred: ${error}`);
        }
    };

    return (
        <ImageBackground source={require('../assets/nlwmobile.png')} style={styles.backgroundImage}>
            <View style={styles.loginContainer}>
                <Text style={styles.title}>Nick Lift Weight</Text>
                <TouchableOpacity style={styles.googleSignInBtn} onPress={handleGoogleSignIn}>
                    <Text style={styles.buttonText}>Sign in with Google</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    loginContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        color: 'rgb(88, 255, 249)',
        textShadowColor: '#000',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 1,
        marginBottom: 20,
    },
    googleSignInBtn: {
        backgroundColor: '#00b4d8',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Login;