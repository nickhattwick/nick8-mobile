import React, { useState } from 'react';
import { View, Text, Button, Modal, ScrollView, StyleSheet } from 'react-native';

const NutritionScreen = ({ route }) => {
  const { data, explanation } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  const renderExplanation = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|```json[\s\S]*?```)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Handle bold text
        return (
          <Text key={index} style={styles.bold}>
            {part.replace(/\*\*/g, '')}
          </Text>
        );
      } else if (part.startsWith('```json') && part.endsWith('```')) {
        // Handle code blocks
        return (
          <Text key={index} style={styles.codeBlock}>
            {part.replace(/```json|```/g, '')}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
    return parts;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition Facts</Text>
      <View style={styles.divider} />
      <Text style={styles.servingSize}>Serving Size: {data.servingSize}</Text>
      <View style={styles.divider} />

      <Text style={[styles.sectionHeader, styles.bold]}>Calories {data.calories}</Text>
      <View style={styles.divider} />

      <Text style={styles.bold}>Total Fat {data.totalFat}g</Text>
      <Text style={styles.indented}>Saturated Fat {data.saturatedFat}g</Text>
      <Text style={styles.indented}>Trans Fat {data.transFat}g</Text>
      <View style={styles.divider} />

      <Text style={styles.bold}>Cholesterol {data.cholesterol}mg</Text>
      <View style={styles.divider} />

      <Text style={styles.bold}>Sodium {data.sodium}mg</Text>
      <View style={styles.divider} />

      <Text style={styles.bold}>Total Carbohydrate {data.totalCarbohydrate}g</Text>
      <Text style={styles.indented}>Dietary Fiber {data.dietaryFiber}g</Text>
      <Text style={styles.indented}>Total Sugars {data.totalSugars}g</Text>
      <Text style={styles.indented}>Includes {data.addedSugars}g Added Sugars</Text>
      <View style={styles.divider} />

      <Text style={styles.bold}>Protein {data.protein}g</Text>
      <View style={styles.divider} />

      <Text style={styles.footer}>*Percent Daily Values are based on a 2,000 calorie diet.</Text>

      <Button title="SEE EXPLANATION" onPress={() => setModalVisible(true)} />

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalText}>{renderExplanation(explanation)}</Text>
          <Button title="Close" onPress={() => setModalVisible(!modalVisible)} />
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  servingSize: {
    fontSize: 16,
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 24,
    marginVertical: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  indented: {
    marginLeft: 16,
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
    backgroundColor: 'white',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  codeBlock: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
});

export default NutritionScreen;
