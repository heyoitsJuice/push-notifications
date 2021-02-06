import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

// Expo Modules
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'
import Constants from 'expo-constants'

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }
  }
})

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('')

  // Calls an async function to check the state of Permission and allow the population of an empty token if status is 'granted'
  useEffect(() => {
    registerForPushNotifications().then(token => setExpoPushToken(token))
  }, [])

  // Check state of Permission and allow trigger function to pass if status is 'granted'
  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS).then((statusObj) => {
      if (statusObj.status !== 'granted'){
        return Permissions.askAsync(Permissions.NOTIFICATIONS);
      }
      return statusObj;
    })
    .then(statusObj =>{
      if (statusObj.status !== 'granted'){
        return
      }
    })
  }, []);

  // Use a Push Token to send a Notification
  const registerForPushNotifications = async() => {
    let token
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    return token;
  }


 // Example of Trigger Customization that schedules a notification at the beginning of an hour
//  const trigger = new Date(Date.now() + 60 * 60 * 1000)
//  trigger.setMinutes(0)
//  trigger.setSeconds(0)

 // Using a Trigger Handler to send a Notification
 const triggerNotificationHandler = () => {
   Notifications.scheduleNotificationAsync({
     content: {
       title: "Test Notification",
       body: "Great Job! You're on your way to becoming a Push Notification Master!"
     }, 
    //  trigger,
     trigger: {
       seconds: 5,
     }
   })
 }

  return (
    <View style={styles.container}>

      <Text> Expo Push Token: {expoPushToken}</Text>

      <Button
        onPress = {async () => {await sendPushNotification(expoPushToken)}}
        title = "Send Notification Using A Token"
      />

      <Button 
        onPress = {triggerNotificationHandler}
        title = "Trigger Notification Handler"
      />
      <StatusBar style="auto" />
    </View>
  );
}

// Using a Push Token to send a Notification
const sendPushNotification = async(expoPushToken) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'This is with a token',
    body: 'Dude this actually worked LETS GOOOOOOOOOOOOOO',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
