// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Import useNavigation
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'; // Import Animated and specific animations

const HomeScreen = () => { // No need for navigation prop if using useNavigation hook
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigation = useNavigation(); // Hook to get navigation object

  // --- Data Loading ---
  const loadExpenses = useCallback(async () => {
    ("Loading expenses...");
    setIsLoading(true); // Start loading
    try {
      const storedExpenses = await AsyncStorage.getItem('expenses');
      const parsedExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
      // Sort by date, newest first
      parsedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(parsedExpenses);
      calculateTotal(parsedExpenses); // Calculate total after loading
      ("Expenses loaded:", parsedExpenses.length);
    } catch (error) {
      console.error("Error loading expenses:", error);
      Alert.alert('Error', 'Failed to load expenses.');
      setExpenses([]); // Clear expenses on error
      setTotalExpenses(0);
    } finally {
        setIsLoading(false); // Stop loading regardless of success/failure
    }
  }, []); // Empty dependency array means this function doesn't change

  // --- Load data when the screen comes into focus ---
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses]) // Depend on loadExpenses
  );

  // --- Calculate Total ---
  const calculateTotal = (currentExpenses) => {
    const total = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpenses(total);
  };

  // --- Deletion ---
  const handleDeleteExpense = (idToDelete) => { // No need for async here directly
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => { // Make the onPress async
            try {
              // Optimistic UI Update: Remove immediately from state for responsiveness
              const updatedExpenses = expenses.filter(expense => expense.id !== idToDelete);
              setExpenses(updatedExpenses); // Update state BEFORE async call
              calculateTotal(updatedExpenses); // Recalculate total

              // Persist the change
              await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
              ("Expense deleted:", idToDelete);
            } catch (error) {
              console.error("Error deleting expense:", error);
              Alert.alert('Error', 'Failed to delete expense.');
              // Optional: Rollback state if async operation fails (more complex)
              loadExpenses(); // Simple rollback: reload all data
            }
          }
        }
      ]
    );
  };


  // --- Render Item Component ---
  const renderExpenseItem = ({ item }) => (
    <Animated.View
      style={styles.itemContainer}
      layout={Layout.springify().damping(15).stiffness(100)} // Fine-tuned spring animation
      entering={FadeIn.duration(400)} // Slightly longer fade in
      exiting={FadeOut.duration(250)} // Slightly longer fade out
    >
      <View style={styles.itemDetails}>
        <Text style={styles.itemDescription} numberOfLines={1} ellipsizeMode='tail'>{item.description}</Text>
        <Text style={styles.itemCategory}>{item.category} - {new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.itemRight}>
          <Text style={styles.itemAmount}>₹{item.amount.toFixed(2)}</Text>
          <TouchableOpacity onPress={() => handleDeleteExpense(item.id)} style={styles.deleteButton}>
             <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // --- Render Content Based on Loading State ---
   const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />;
        }

        if (expenses.length === 0) {
            return <Text style={styles.emptyText}>No expenses added yet. Tap '+' to add one!</Text>;
        }

        return (
            <FlatList
                data={expenses}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
                itemLayoutAnimation={Layout.springify().damping(15).stiffness(100)} // Match item animation
            />
        );
    };

  return (
    <View style={styles.container}>
      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total Spent This Period:</Text>
        <Text style={styles.summaryAmount}>₹{totalExpenses.toFixed(2)}</Text>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
           {renderContent()}
      </View>


      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddExpense')}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  summaryContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3, // For Android shadow
  },
  summaryText: {
    fontSize: 16, // Slightly smaller
    color: '#666',
  },
  summaryAmount: {
    fontSize: 32, // Larger total
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
   contentArea: {
        flex: 1, // Take remaining space for the list or loader/empty text
   },
   loader: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
   },
  listContentContainer: {
      paddingHorizontal: 10,
      paddingTop: 10, // Add padding at the top of the list
      paddingBottom: 80, // Extra padding at the bottom to avoid FAB overlap
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 6, // Slightly more vertical margin
    borderRadius: 10, // More rounded corners
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.00,
    elevation: 2, // Subtle elevation
  },
   itemDetails: {
    flex: 1, // Take available space
    marginRight: 10,
  },
  itemDescription: {
    fontSize: 17, // Slightly larger description
    fontWeight: '500',
    color: '#222',
    marginBottom: 2, // Spacing below description
  },
  itemCategory: {
    fontSize: 13,
    color: '#888', // Lighter category text
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAmount: {
    fontSize: 17, // Match description size
    fontWeight: '600', // Bolder amount
    color: '#d9534f',
    marginRight: 15,
  },
  deleteButton: {
    padding: 8, // Slightly larger touch target
    marginLeft: 5, // Ensure space from amount
    borderRadius: 15, // Circular touch highlight area (visual only)
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
      fontSize: 20, // Larger 'x'
      color: '#cc0000',
      fontWeight: 'bold',
  },
  emptyText: {
    flex: 1, // Take up space to center vertically
    textAlign: 'center',
    textAlignVertical: 'center', // Center vertically on Android
    marginTop: Platform.OS === 'ios' ? 0 : -50, // Adjust vertical position if needed
    fontSize: 17,
    color: '#888',
    paddingHorizontal: 20,
  },
  addButton: {
      position: 'absolute',
      bottom: 25,
      right: 25,
      backgroundColor: '#6200ee', // Primary color
      width: 60,
      height: 60,
      borderRadius: 30, // Make it circular
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8, // Prominent shadow
  },
  addButtonText: {
      color: '#fff',
      fontSize: 30,
      lineHeight: 35, // Adjust line height for vertical centering
      fontWeight: 'bold',
  }
});

export default HomeScreen;