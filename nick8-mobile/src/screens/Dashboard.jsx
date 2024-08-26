import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import config from '../../config/config.js';
import * as SecureStore from 'expo-secure-store';

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
    const [workoutData, setWorkoutData] = useState(null);
    const [inProgressWorkout, setInProgressWorkout] = useState(null);
    const initialCategories = {
        'Chest': ['InclineChest', 'ChestPress', 'Flys', 'ShoulderPress'],
        'Arms': ['Bis', 'TriPress', 'TriPullDown', 'TriExtension', "LateralRaise"],
        'Back': ['PullDown', 'RearDelt', 'Rows'],
        'Legs': ['HipAbductor', 'SeatedLegCurl', 'LegExtension', 'HipAdductor', 'LegPress'],
        'Abs': ['Abdominal', 'BackExtension', 'TorsoRotation']
    };

    const [categories, setCategories] = useState(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(initialCategories)[0]);
    const navigation = useNavigation();

    const fetchWorkoutData = useCallback(() => {
        SecureStore.getItemAsync('user')
            .then((user) => {
                const parsedUser = JSON.parse(user);
                fetch(config.SERVER_URL + '/dashboard-load/mobile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: {
                            email: parsedUser.emails[0].value
                        }
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const parsedData = data.map(workout => {
                        workout.Exercises = Object.fromEntries(
                            Object.entries(workout.Exercises).map(([key, value]) => [
                                key,
                                value.map(set => ({ ...set, weight: parseFloat(set.weight) }))
                            ])
                        );
                        return workout;
                    });
                    setWorkoutData(parsedData);

                    // Check for an in-progress workout
                    const today = new Date().toISOString().substring(0, 10);
                    const inProgress = parsedData.find(workout => workout.WorkoutDate === today && !workout.Submitted);
                    setInProgressWorkout(inProgress);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            });
    }, []);

    // Fetch the workout data when the component is mounted
    useEffect(() => {
        fetchWorkoutData();
    }, [fetchWorkoutData]);

    // Refetch the workout data when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchWorkoutData();
        }, [fetchWorkoutData])
    );

    // Fetch custom exercises and merge them with the hardcoded categories
    useEffect(() => {
        SecureStore.getItemAsync('user')
        .then((user) => {
            const parsedUser = JSON.parse(user);
            fetch(config.SERVER_URL + '/load-exercises/mobile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: {
                        email: parsedUser.emails[0].value
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                const fetchedExercises = data.exercises;
                const updatedCategories = { ...initialCategories };
    
                fetchedExercises.forEach(exercise => {
                    const { ExerciseCategory, ExerciseName } = exercise;
    
                    if (!updatedCategories[ExerciseCategory]) {
                        updatedCategories[ExerciseCategory] = [];
                    }
    
                    if (!updatedCategories[ExerciseCategory].includes(ExerciseName)) {
                        updatedCategories[ExerciseCategory].push(ExerciseName);
                    }
                });
    
                setCategories(updatedCategories);
    
                if (!updatedCategories[selectedCategory]) {
                    setSelectedCategory(Object.keys(updatedCategories)[0]);
                }
            })
            .catch(error => console.error('Error loading exercises:', error));
        });
    }, []);

    const prepareGraphData = (workoutData) => {
        if (!selectedCategory || !categories[selectedCategory]) return {};
        workoutData.sort((a, b) => {
            const dateA = new Date(a.WorkoutDate + 'T00:00:00');
            const dateB = new Date(b.WorkoutDate + 'T00:00:00');
            return dateA - dateB;
        });
        const processedData = workoutData.reduce((acc, workout) => {
            Object.entries(workout.Exercises).forEach(([exercise, sets]) => {
                if (!categories[selectedCategory].includes(exercise)) {
                    return;
                }

                if (!acc[exercise]) {
                    acc[exercise] = { dates: [], maxWeights: [], avgWeights: [] };
                }

                const weights = sets.map(set => set.weight);
                const maxWeight = Math.max(...weights);
                const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

                acc[exercise].dates.push(new Date(workout.WorkoutDate + 'T00:00:00'));
                acc[exercise].maxWeights.push(maxWeight);
                acc[exercise].avgWeights.push(avgWeight);
            });
            return acc;
        }, {});

        return processedData;
    };

    if (!workoutData) {
        return (
            <View>
              <Text>Loading...</Text>
            </View>
          );
    }

    const graphData = prepareGraphData(workoutData);

    return (
        <ImageBackground source={require('../assets/dashboard.png')} style={styles.backgroundImage}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Dashboard</Text>
                {inProgressWorkout && (
                    <View style={styles.inProgressContainer}>
                        <Text style={styles.inProgressText}>You have an in-progress workout for today.</Text>
                        <TouchableOpacity 
                            style={styles.inProgressButton} 
                            onPress={() => navigation.navigate('LogWorkoutForm', { workout: inProgressWorkout })}
                        >
                            <Text style={styles.inProgressButtonText}>Continue Workout</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <TouchableOpacity style={styles.logWorkoutButton} onPress={() => navigation.navigate('LogWorkoutForm')}>
                    <Text style={styles.buttonText}>Log Workout</Text>
                </TouchableOpacity>
                <View style={styles.categoryButtons}>
                    {Object.keys(categories).map(category => (
                        <TouchableOpacity 
                            key={category} 
                            style={[
                                styles.categoryButton, 
                                selectedCategory === category && styles.selectedCategoryButton
                            ]} 
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text style={[
                                styles.buttonText, 
                                selectedCategory === category && styles.selectedButtonText
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.chartContainer}>
                    {Object.entries(graphData).map(([exercise, data]) => (
                        <View key={exercise} style={styles.chartBox}>
                            <Text style={styles.exerciseTitle}>{exercise}</Text>
                            <LineChart
                                data={{
                                    labels: data.dates.map((date, index) => 
                                        index % Math.ceil(data.dates.length / 6) === 0 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
                                    ),
                                    datasets: [
                                        {
                                            data: data.maxWeights,
                                            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                                        },
                                        {
                                            data: data.avgWeights,
                                            color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                                        },
                                    ],
                                }}
                                width={screenWidth * 0.85}
                                height={200}
                                yAxisLabel=""
                                yAxisSuffix=""
                                yAxisInterval={1}
                                fromZero={true}
                                chartConfig={{
                                    backgroundColor: '#ffffff',
                                    backgroundGradientFrom: '#ffffff',
                                    backgroundGradientTo: '#ffffff',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: "#ffa726",
                                    },
                                    propsForLabels: {
                                        fontSize: 10,
                                    },
                                    paddingRight: 30,
                                    paddingLeft: 20,
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                }}
                                xLabelsOffset={-10}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    pageHeader: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'rgb(88, 255, 249)',
        textShadowColor: '#000',
        textShadowOffset: { width: -2, height: 2 },
        textShadowRadius: 3,
        textAlign: 'center',
        marginBottom: 20,
    },
    inProgressContainer: {
        backgroundColor: 'rgba(255, 165, 0, 0.8)',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    inProgressText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    inProgressButton: {
        backgroundColor: '#0057e7',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    inProgressButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logWorkoutButton: {
        backgroundColor: '#0057e7',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 5,
        marginBottom: 20,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    categoryButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    categoryButton: {
        backgroundColor: '#0f3443',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 5,
        margin: 5,
    },
    selectedCategoryButton: {
        backgroundColor: '#add8e6', // Highlighted color for selected category
    },
    selectedButtonText: {
        color: '#000000', // Text color for selected category
    },
    chartContainer: {
        alignItems: 'center',
    },
    chartBox: {
        width: '95%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    exerciseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#ffffff',
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff',
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    }
});

export default Dashboard;
