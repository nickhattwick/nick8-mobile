import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

const Exercise = ({ exercise, exerciseIndex, control, register, removeExercise, categories, handleNewExerciseSubmit, newExerciseName, setNewExerciseName, newExerciseCategory, setNewExerciseCategory }) => {
    const { fields: pairFields, append: appendPair, remove: removePair } = useFieldArray({
        control,
        name: `exercises[${exerciseIndex}].pairs`
    });

    const [isAddingCustomExercise, setIsAddingCustomExercise] = useState(false);

    const handleAddCustomExerciseClick = () => {
        setIsAddingCustomExercise(true);
    };

    const handleAddCustomExerciseCancel = () => {
        setIsAddingCustomExercise(false);
    };

    return (
        <View key={exercise.id} style={styles.exerciseGroup}>
            <Text>Exercise:</Text>
            <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                    <View style={styles.selectContainer}>
                        <Picker
                            selectedValue={value}
                            onValueChange={onChange}
                            style={styles.select}
                        >
                            {Object.values(categories).flat().map((category) => (
                                <Picker.Item key={category} label={category} value={category} />
                            ))}
                        </Picker>
                    </View>
                )}
                name={`exercises[${exerciseIndex}].name`}
            />

            <Button title="Add Custom Exercise" onPress={handleAddCustomExerciseClick} />

            {isAddingCustomExercise && (
                <View style={styles.customExercise}>
                    <Text>Name:</Text>
                    <TextInput
                        value={newExerciseName}
                        onChangeText={setNewExerciseName}
                        style={styles.input}
                    />
                    <Text>Category:</Text>
                    <TextInput
                        value={newExerciseCategory}
                        onChangeText={setNewExerciseCategory}
                        style={styles.input}
                    />
                    <Button title="Add" onPress={handleNewExerciseSubmit} />
                    <Button title="Cancel" onPress={handleAddCustomExerciseCancel} />
                </View>
            )}

            {pairFields.map((pair, pairIndex) => (
                <View key={pair.id} style={styles.pairGroup}>
                    <Text>Weight:</Text>
                    <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        )}
                        name={`exercises[${exerciseIndex}].pairs[${pairIndex}].weight`}
                    />
                    <Text>Reps:</Text>
                    <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        )}
                        name={`exercises[${exerciseIndex}].pairs[${pairIndex}].reps`}
                    />
                    <Button
                        title="Remove Pair"
                        onPress={() => removePair(pairIndex)}
                        style={styles.removeButton}
                    />
                </View>
            ))}

            <Button
                title="Add Pair"
                onPress={() => appendPair({ weight: '', reps: '' })}
                style={styles.addButton}
            />
            <Button
                title="Remove Exercise"
                onPress={() => removeExercise(exerciseIndex)}
                style={styles.removeButton}
            />
        </View>
    );
};

const LogWorkoutForm = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState({
        'Chest': ['InclineChest', 'ChestPress', 'Flys', 'ShoulderPress'],
        'Arms': ['Bis', 'TriPress', 'TriPullDown', 'TriExtension', "LateralRaise"],
        'Back': ['PullDown', 'RearDelt', 'Rows'],
        'Legs': ['HipAbductor', 'SeatedLegCurl', 'LegExtension', 'HipAdductor', 'LegPress'],
        'Abs': ['Abdominal', 'BackExtension', 'TorsoRotation']
    });
    const { control, handleSubmit } = useForm({
        defaultValues: {
            date: new Date().toISOString().substring(0, 10),
            exercises: [{ name: '', pairs: [{ weight: '', reps: '' }] }]
        }
    });
    const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
        control,
        name: 'exercises'
    });
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseCategory, setNewExerciseCategory] = useState('');

    useEffect(() => {
        const loadUserExercises = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_SERVER_URL + '/load-exercises', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const jsonResponse = await response.json();
                                
                setCategories(prevCategories => {
                    const updatedCategories = { ...prevCategories };
                    jsonResponse.exercises.forEach(exercise => {
                        const category = exercise.ExerciseCategory;
                        const name = exercise.ExerciseName;
                        console.log(`category: ${category}, name: ${name}`);
                        if (!updatedCategories[category]) updatedCategories[category] = [];
                        if (!updatedCategories[category].includes(name)) {
                            updatedCategories[category].push(name);
                        }
                    });
                    console.log(updatedCategories);
                    return updatedCategories;
                });
            } catch (error) {
                console.error('Error loading exercises:', error);
            }
        };
        loadUserExercises();
    }, []);

    const onSubmit = async (data) => {    
        try {
            const response = await fetch(process.env.REACT_APP_SERVER_URL + '/log-workout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ ...data }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const jsonResponse = await response.json();
            console.log(jsonResponse.message);

            navigation.navigate('Dashboard');
        } catch (error) {
            console.error('Error logging workout:', error);
        }
    };

    const handleNewExerciseSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/add-exercise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newExerciseName,
                category: newExerciseCategory,
            }),
            credentials: 'include',
        });

        if (response.ok) {
            // Reset the form
            setNewExerciseName('');
            setNewExerciseCategory('');
        } else {
            console.error('Failed to add exercise');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Button title="Back to Dashboard" onPress={() => navigation.navigate('Dashboard')} />
            <Text style={styles.pageHeader}>Log Workout</Text>
            <Text>Date:</Text>
            <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        style={styles.input}
                    />
                )}
                name="date"
            />

            {exerciseFields.map((exercise, index) => (
                <Exercise
                    key={exercise.id}
                    exercise={exercise}
                    exerciseIndex={index}
                    control={control}
                    register={register}
                    removeExercise={() => removeExercise(index)}
                    categories={categories}
                    newExerciseName={newExerciseName}
                    setNewExerciseName={setNewExerciseName}
                    newExerciseCategory={newExerciseCategory}
                    setNewExerciseCategory={setNewExerciseCategory}
                    handleNewExerciseSubmit={handleNewExerciseSubmit}
                />
            ))}

            <Button
                title="Add Exercise"
                onPress={() => appendExercise({ name: '', pairs: [{ weight: '', reps: '' }] })}
                style={styles.addButton}
            />

            <Button title="Submit" onPress={handleSubmit(onSubmit)} style={styles.submitButton} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgba(44, 62, 80, 0.9)',
    },
    pageHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#0293a7',
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
    },
    selectContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        marginVertical: 8,
    },
    select: {
        padding: 10,
        color: '#0293a7',
    },
    exerciseGroup: {
        borderWidth: 1,
        borderColor: '#eee',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#e8e5e5de',
        marginBottom: 20,
    },
    pairGroup: {
        borderWidth: 1,
        borderColor: '#eee',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#c0cad1de',
        marginBottom: 10,
    },
    customExercise: {
        borderWidth: 1,
        borderColor: '#eee',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#797979de',
        marginVertical: 10,
    },
    removeButton: {
        backgroundColor: '#666668',
        marginVertical: 10,
    },
    addButton: {
        backgroundColor: '#0f3443',
        marginVertical: 10,
    },
    submitButton: {
        backgroundColor: '#2196F3',
        marginVertical: 10,
    },
});

export default LogWorkoutForm;