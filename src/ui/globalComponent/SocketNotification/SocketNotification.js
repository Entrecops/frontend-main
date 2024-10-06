import React, { Component } from 'react';
import { addNotification, Notification } from '../Notifications';
import {rootUrl} from '../../../configs/config';
import { connect } from 'react-redux';
import socketIOClient from "socket.io-client";
import { incrementReservation } from '../../../store/actions/auth';

class SocketNotification extends Component {
    socket = socketIOClient(rootUrl);
    componentDidMount() {
        this.socket.on('new_notification', data => {
            const user = this.props.user
            let allowed = false;
            if( data.receiver.toString() === user._id.toString() || data.receiver.toString() === user.role.toString() ){
                allowed = true;
            }
            if( allowed ){
                console.log( data );
                if( data.type === "new_reservation" ){
                    addNotification("success", "Nouvelle reservation", data.data.announce.title);
                    this.props.onNotification();
                }
            }
        });
    }

    render() {
        return( 
            <Notification />
        );
    }
}


const mapDispatchToState = dispatch => {
    return {
        onNotification: () => dispatch( incrementReservation()),
    }
}

export default connect(null, mapDispatchToState)(SocketNotification);