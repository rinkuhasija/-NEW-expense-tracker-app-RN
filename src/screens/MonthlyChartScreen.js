// src/screens/MonthlyChartScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';

// Function to generate random colors (or use a predefined palette)
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    // Avoid colors that are too light to see legend text
    const brightness = parseInt(color.substring(1), 16);
    const r = (brightness >> 16) & 0xff;
    const g = (brightness >> 8) & 0xff;
    const b = brightness & 0xff;
    // Basic check for brightness (adjust threshold as needed)
    if (r * 0.299 + g * 0.587 + b * 0.114 > 200) {
        return getRandomColor(); // Recursively find a darker color
    }
    return color;
};

const screenWidth = Dimensions.get('window').width;

const MonthlyChartScreen = () => {
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalForMonth, setTotalForMonth] = useState(0);

    const processExpensesForChart = useCallback(async () => {
        setIsLoading(true);
        setChartData([]); // Clear previous data
        setTotalForMonth(0);

        try {
            const storedExpenses = await AsyncStorage.getItem('expenses');
            const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0-indexed (0 for Jan, 11 for Dec)

            // 1. Filter expenses for the current month and year
            const monthlyExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth;
            });

            if (monthlyExpenses.length === 0) {
                 console.log("No expenses found for the current month.");
                 setIsLoading(false);
                 return;
            }

            // 2. Group by category and sum amounts
            const groupedData = monthlyExpenses.reduce((acc, expense) => {
                const category = expense.category || 'General';
                acc[category] = (acc[category] || 0) + expense.amount;
                return acc;
            }, {});

             // Calculate total for the month
            const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            setTotalForMonth(total);

            // 3. Format for PieChart
            const formattedChartData = Object.keys(groupedData).map(category => ({
                name: category,
                population: parseFloat(groupedData[category].toFixed(2)), // Ensure it's a number
                color: getRandomColor(),
                legendFontColor: '#333', // Darker legend text
                legendFontSize: 14,
            }));

            // Sort data for consistent color assignment (optional but good practice)
            formattedChartData.sort((a, b) => b.population - a.population);

            setChartData(formattedChartData);
            console.log("Chart data processed:", formattedChartData);

        } catch (error) {
            console.error("Error processing expenses for chart:", error);
            // Optionally show an error message to the user
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reload data when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            processExpensesForChart();
        }, [processExpensesForChart])
    );

    const chartConfig = {
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Color for labels, not slices
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false // optional
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Expenses This Month by Category</Text>

            {isLoading ? (
                <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
            ) : chartData.length > 0 ? (
                <>
                    <Text style={styles.totalText}>
                        Total Spent This Month: ₹{totalForMonth.toFixed(2)}
                    </Text>
                    <PieChart
                        data={chartData}
                        width={screenWidth - 16} // Adjust width as needed
                        height={250}
                        chartConfig={chartConfig}
                        accessor={"population"} // Key to extract value from data objects
                        backgroundColor={"transparent"} // Background of the chart container
                        paddingLeft={"15"} // Offset chart from left edge
                       // center={[10, 10]} // Adjust center position [x, y] if needed
                        absolute // Show absolute values instead of percentages
                        // hasLegend={false} // Hide built-in legend if you want to create a custom one
                    />
                    {/* Optional: Custom Legend */}
                    <View style={styles.legendContainer}>
                         {chartData.map(item => (
                              <View key={item.name} style={styles.legendItem}>
                                   <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                                   <Text style={styles.legendText}>{item.name}: ₹{item.population.toFixed(2)}</Text>
                              </View>
                         ))}
                    </View>
                </>

            ) : (
                <Text style={styles.noDataText}>No expenses recorded for the current month.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
        color: '#333',
    },
     totalText: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 15,
        color: '#555',
    },
    loader: {
        marginTop: 50,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
    },
    legendContainer: {
         marginTop: 20,
         paddingHorizontal: 10,
    },
    legendItem: {
         flexDirection: 'row',
         alignItems: 'center',
         marginBottom: 8,
    },
    legendColorBox: {
         width: 15,
         height: 15,
         marginRight: 10,
         borderRadius: 3,
    },
    legendText: {
         fontSize: 14,
         color: '#333',
    }
});

export default MonthlyChartScreen;