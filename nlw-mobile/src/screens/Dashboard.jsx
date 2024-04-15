import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { enUS } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
    const [workoutData, setWorkoutData] = useState(null);
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

    // Fetch the workout data
    useEffect(() => {
        fetch(process.env.REACT_APP_SERVER_URL + '/dashboard-load', {
            credentials: 'include'
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
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, []);

    // Fetch custom exercises and merge them with the hardcoded categories
    useEffect(() => {
        fetch(process.env.REACT_APP_SERVER_URL + '/load-exercises', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            const fetchedExercises = data.exercises; // Unwrap the 'exercises' from the response
            const updatedCategories = { ...initialCategories };
    
            // Iterate over each fetched exercise
            fetchedExercises.forEach(exercise => {
                const { ExerciseCategory, ExerciseName } = exercise;
    
                // Check if the ExerciseCategory already exists, if not, initialize it
                if (!updatedCategories[ExerciseCategory]) {
                    updatedCategories[ExerciseCategory] = [];
                }
    
                // Add the ExerciseName to the appropriate category if it's not already there
                if (!updatedCategories[ExerciseCategory].includes(ExerciseName)) {
                    updatedCategories[ExerciseCategory].push(ExerciseName);
                }
            });
    
            // Debugging tip: Log the final structure of updatedCategories
            console.log("Updated categories after merge:", updatedCategories);
    
            // Update the categories state with the newly combined categories
            setCategories(updatedCategories);
    
            // Check if the selectedCategory is still valid, otherwise set it to the first category
            if (!updatedCategories[selectedCategory]) {
                setSelectedCategory(Object.keys(updatedCategories)[0]);
            }
        })
        .catch(error => console.error('Error loading exercises:', error));
    }, []);

    const prepareGraphData = (workoutData) => {
        if (!selectedCategory || !categories[selectedCategory]) return {};
        workoutData.sort((a, b) => {
            const dateA = new Date(a.WorkoutDate + 'T00:00:00'); // Parse date as local
            const dateB = new Date(b.WorkoutDate + 'T00:00:00'); // Parse date as local
            return dateA - dateB;
        });
        const processedData = workoutData.reduce((acc, workout) => {
            Object.entries(workout.Exercises).forEach(([exercise, sets]) => {
                // Only process exercises in the selected category
                if (!categories[selectedCategory].includes(exercise)) {
                    return;
                }

                if (!acc[exercise]) {
                    acc[exercise] = { dates: [], maxWeights: [], avgWeights: [] };
                }

                const weights = sets.map(set => set.weight); // Weights are already floats
                const maxWeight = Math.max(...weights);
                const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

                acc[exercise].dates.push(new Date(workout.WorkoutDate + 'T00:00:00')); // Push parsed date
                acc[exercise].maxWeights.push(maxWeight);
                acc[exercise].avgWeights.push(avgWeight);
            });
            return acc;
        }, {});

        return processedData;
    };

    if (!workoutData) {
        return <div>Loading...</div>;
    }

    const graphData = prepareGraphData(workoutData);

    return (
        <ImageBackground source={require('../assets/dashboard.png')} style={styles.backgroundImage}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.pageHeader}>Nick Lift Weight</Text>
                <TouchableOpacity style={styles.logWorkoutButton} onPress={() => navigation.navigate('LogWorkout')}>
                    <Text style={styles.buttonText}>Log Workout</Text>
                </TouchableOpacity>
                <View style={styles.categoryButtons}>
                    {Object.keys(categories).map(category => (
                        <TouchableOpacity key={category} style={styles.categoryButton} onPress={() => setSelectedCategory(category)}>
                            <Text style={styles.buttonText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.chartContainer}>
                    {Object.entries(graphData).map(([exercise, data]) => (
                        <View key={exercise} style={styles.chartBox}>
                            <Text style={styles.exerciseTitle}>{exercise}</Text>
                            <LineChart
                                data={{
                                    labels: data.dates.map(date => date.toLocaleDateString()), // Format dates
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
                                width={300}
                                height={200}
                                yAxisLabel=""
                                yAxisSuffix=""
                                yAxisInterval={1}
                                chartConfig={{
                                    backgroundColor: '#ffffff',
                                    backgroundGradientFrom: '#ffffff',
                                    backgroundGradientTo: '#ffffff',
                                    decimalPlaces: 2,
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
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                }}
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
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    pageHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'rgb(88, 255, 249)',
        textShadowColor: '#000',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 1,
        textAlign: 'center',
        marginBottom: 20,
    },
    logWorkoutButton: {
        backgroundColor: '#0f3443',
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
    chartContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    chartBox: {
        width: '48%',
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
});

export default Dashboard;