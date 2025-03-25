import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { View, Text, TextInput, Button, StyleSheet, Alert, Animated } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MultiSelect from 'react-native-multiple-select';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrencies, setTargetCurrencies] = useState<string[]>([]);
  const [convertedAmounts, setConvertedAmounts] = useState<{ [key: string]: string }>({});
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const colorScheme = useColorScheme();
  const fadeAnim = useState(new Animated.Value(0))[0];

  const currencyOptions = [
    { id: 'USD', name: 'USD' },
    { id: 'EUR', name: 'EUR' },
    { id: 'GBP', name: 'GBP' },
    { id: 'LKR', name: 'LKR' },
  ];

  useEffect(() => {
    fetchExchangeRates();
  }, [baseCurrency]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [convertedAmounts]);

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );
      const data = await response.json();
      setRates(data.rates);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch exchange rates. Please try again.');
    }
  };

  const convertCurrency = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Invalid Input', 'Please enter a valid number.');
      return;
    }
    const newConvertedAmounts: { [key: string]: string } = {};
    targetCurrencies.forEach((currency) => {
      if (rates[currency]) {
        newConvertedAmounts[currency] = (parseFloat(amount) * rates[currency]).toFixed(2);
      }
    });
    setConvertedAmounts(newConvertedAmounts);
  };

  return (
    <View style={[styles.container, colorScheme === 'dark' ? styles.darkMode : styles.lightMode]}>
      <Text style={styles.title}>Currency Converter</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
      />
      
      <Text>Select Base Currency:</Text>
      <Picker selectedValue={baseCurrency} onValueChange={setBaseCurrency}>
        {currencyOptions.map((currency) => (
          <Picker.Item key={currency.id} label={currency.name} value={currency.id} />
        ))}
      </Picker>
      
      <Text>Select Target Currencies:</Text>
      <MultiSelect
        items={currencyOptions}
        uniqueKey="id"
        onSelectedItemsChange={(items) => setTargetCurrencies(items)}
        selectedItems={targetCurrencies}
        selectText="Pick Currencies"
        searchInputPlaceholderText="Search Currencies..."
        tagRemoveIconColor="#CCC"
        tagBorderColor="#CCC"
        tagTextColor="#000"
        selectedItemTextColor="#CCC"
        selectedItemIconColor="#CCC"
        itemTextColor="#000"
        displayKey="name"
        searchInputStyle={{ color: '#CCC' }}
        submitButtonText="Confirm"
      />
      
      <Button title="Convert" onPress={convertCurrency} />
      {Object.keys(convertedAmounts).length > 0 && (
        <Animated.View style={{ opacity: fadeAnim }}>
          {Object.entries(convertedAmounts).map(([currency, value]) => (
            <Text key={currency} style={styles.result}>
              Converted Amount: {value} {currency}
            </Text>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  lightMode: {
    backgroundColor: '#fff',
  },
  darkMode: {
    backgroundColor: '#333',
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  result: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default CurrencyConverter;
