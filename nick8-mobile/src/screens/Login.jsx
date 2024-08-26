import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

const Login = ({ navigation }) => {
  
  const handleGoogleSignIn = () => {
    // Directly navigate to CameraScreen
    navigation.replace('CameraScreen');
  };

  return (
    <ImageBackground source={require('../assets/nick8mob.png')} style={styles.backgroundImage}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Nick8</Text>
        <TouchableOpacity style={styles.googleSignInBtn} onPress={handleGoogleSignIn}>
          <Text style={styles.buttonText}>Take A Picture</Text>
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
    width: '100%',
    height: '100%',
  },
  loginContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
