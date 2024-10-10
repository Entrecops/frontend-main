import React from 'react'
import ReactNotification from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import 'animate.css/animate.css'
import { store } from 'react-notifications-component';

export const Notification = (props) => {
    return (
        <ReactNotification />
    )
};

export const addNotification = (type, title, message) => {
    store.addNotification({
        title: title,
        message: message,
        type: type,
        insert: "top",
        container: "top-center",
        animationIn: ["animated", "bounceIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
            duration: 4000,
            onScreen: false
        }
    });
} 