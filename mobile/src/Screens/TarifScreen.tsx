import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Card, Text} from 'react-native-paper';
import Header from '../Components/Header';
import BottomNavbar from '../Components/BottomNavbar';

const Tarif = ({navigation}) => {
    return (
        <View style={styles.container}>
            <Header navigation={navigation}/>

            <ScrollView style={styles.content}>

            </ScrollView>

            <BottomNavbar navigation={navigation}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f8f9fa'},
    content: {flex: 1, padding: 16},
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#2e7d32'
    },
    mealCard: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 3,
        backgroundColor: '#ffffff'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18
    }
});

export default Tarif;