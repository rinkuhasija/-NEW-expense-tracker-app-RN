// src/screens/AddExpenseScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    Platform,
    ScrollView,
    TouchableOpacity, // Make sure TouchableOpacity is imported
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker

const AddExpenseScreen = ({ navigation }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date()); // State for the date, default to today
    const [showDatePicker, setShowDatePicker] = useState(false); // State to control picker visibility

    // --- Date Picker Handler ---
    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date; // Keep current date if user cancels (Android)
        setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until done, hide on Android immediately
        setDate(currentDate);
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    // --- Add Expense Handler ---
      // --- Add Expense Handler (with Debug Logs) ---
      // --- Add Expense Handler (with More Debug Logs) ---
    const handleAddExpense = async () => {
        ('handleAddExpense function started...');

        // Trim inputs
        const trimmedDescription = description.trim();
        const trimmedAmount = amount.trim();
        const trimmedCategory = category.trim();

        // --- Validation ---
        if (!trimmedDescription || !trimmedAmount) {
            ('Validation Failed: Description or Amount empty.');
            Alert.alert('Error', 'Please enter description and amount.');
            return;
        }
        ('Validation Passed: Description and Amount are present.');

        // --- Amount Parsing ---
        const parsedAmount = parseFloat(trimmedAmount.replace(',', '.'));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            ('Amount Parsing Failed: Invalid amount.', parsedAmount);
            Alert.alert('Error', 'Please enter a valid positive amount.');
            return;
        }
        ('Amount Parsing Succeeded:', parsedAmount);

        // --- !! NEW DEBUG LOGS !! ---
        try {
            ('Checking date state before creating object:', date); // Log the date object
            ('Attempting to generate UUID...'); // Log before calling uuid
            const generatedId = uuidv4(); // Try generating ID separately
            ('UUID generated successfully:', generatedId); // Log if successful
            ('Attempting to format date...'); // Log before calling toISOString
            const formattedDate = date.toISOString(); // Try formatting date separately
            ('Date formatted successfully:', formattedDate); // Log if successful
             // --- End of New Debug Logs ---


            // --- Create Expense Object ---
            ('Now attempting to create the newExpense object...'); // Log right before creation
            const newExpense = {
                id: generatedId, // Use the pre-generated ID
                description: trimmedDescription,
                amount: parsedAmount,
                category: trimmedCategory || 'General',
                date: formattedDate, // Use the pre-formatted date
            };
            // If the script fails *during* object creation, the next log won't show
            ('Created new expense object:', JSON.stringify(newExpense, null, 2)); // The original log that wasn't reached

            // --- Save to AsyncStorage ---
            ('Attempting to access AsyncStorage...');
            // ... (rest of the try block remains the same)
            const existingExpensesJSON = await AsyncStorage.getItem('expenses');
            ('Raw data from AsyncStorage:', existingExpensesJSON);
            const expenses = existingExpensesJSON ? JSON.parse(existingExpensesJSON) : [];
            ('Parsed existing expenses:', expenses.length, 'items');
            expenses.push(newExpense);
            ('Added new expense to array. Total items now:', expenses.length);
            await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
            ('Successfully saved updated expenses to AsyncStorage.');
            ('Navigating back to previous screen...');
            navigation.goBack();
            ('Navigation command issued.');

        } catch (error) {
            console.error("!!! Error during handleAddExpense:", error); // Log: Catch block error
             // Better error reporting in catch block
             if (error.message.includes('uuid') || error.message.includes('v4')) {
                Alert.alert('Error', `UUID generation failed: ${error.message}. Is the 'uuid' library installed correctly?`);
             } else if (error.message.includes('toISOString')) {
                 Alert.alert('Error', `Date formatting failed: ${error.message}. Is the date state valid?`);
             } else if (error instanceof SyntaxError) {
                 Alert.alert('Storage Error', 'Failed to parse existing expense data. Data might be corrupted.');
             } else {
                 Alert.alert('Error', `Failed to save expense: ${error.message}`);
             }
        }
    };

    // --- Render ---
    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
            {/* Description Input */}
            <Text style={styles.label}>Description:</Text>
            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="e.g., Coffee, Lunch"
            />

            {/* Amount Input */}
            <Text style={styles.label}>Amount:</Text>
            <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="e.g., 5.50"
                keyboardType="numeric"
            />

            {/* Category Input */}
            <Text style={styles.label}>Category (Optional):</Text>
            <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g., Food, Transport"
            />

            {/* Date Picker Input */}
            <Text style={styles.label}>Date:</Text>
            <TouchableOpacity onPress={showDatepicker} style={styles.dateInputTouchable}>
                <Text style={styles.dateInputText}>
                    {date.toLocaleDateString()} {/* Display selected date */}
                </Text>
            </TouchableOpacity>

            {/* Conditionally render the DateTimePicker */}
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={'date'} // Can be 'time' or 'datetime'
                    is24Hour={true} // Use 24hr format (optional)
                    display="default" // 'default', 'spinner', 'calendar', 'clock'
                    onChange={onChangeDate}
                />
            )}


            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
                <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    container: {
        flexGrow: 1,
        padding: 25,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#444',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
        color: '#333',
    },
    // Style for the date touchable to make it look like an input
    dateInputTouchable: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center' // Center text vertically
    },
    dateInputText: {
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#6200ee',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default AddExpenseScreen;