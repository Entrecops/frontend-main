import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../globalComponent/Loader'
import {addNotification} from '../../globalComponent/Notifications'
import axios from 'axios';

import './Stars.scss';

class Stars extends Component {
    state = { voting: false, success: false, rate: this.props.rate }

    vote = (value) => {
        let authData = JSON.parse(localStorage.getItem("authData"))
        if(authData&&authData.token) {
            this.setState({voting: true})
            let previousValue = this.state.rate&&this.state.rate.value ? this.state.rate.value : 0;
            // For the first time, dont divide by 2
            let newValue = 0;
            if(!this.state.rate) {
                newValue = value;
            } else {
                newValue = (Number(previousValue) + value) / 2;
            }
            // persons that have already voted
            let clients = this.state.rate&&this.state.rate.clients ? this.state.rate.clients : [];
            clients.push(authData.user._id)
            axios.patch('/api/' + this.props.anounceType + '/' + this.props.id + '/vote/' + newValue, {clients: clients})
            .then(data => {
                this.setState({ voting: false, success: true, rate: {value: newValue, clients: clients } })
                // Display success button for 1.5 seconds
                setTimeout(() => {
                    this.setState({ success: false })
                }, 1500)
            })
            .catch(err => {
                this.setState({ voting: false })
            })
        } else {
            addNotification("warning", "Authentification!", "Veuillez vous connecté")
        }
    }

    render() {
        let value = this.state.rate&&this.state.rate.value ? this.state.rate.value : 0;
        let number = this.state.rate&&this.state.rate.clients ? this.state.rate.clients.length : 0;
        return (
            !this.props.isSupplierDashboard ?
                <div className="stars">
                    {this.state.voting&&<div className="mr-2"><Loader /></div>}
                    {this.state.success && <FontAwesomeIcon className="voted mr-2" icon={faCheckCircle} size="2x" />}
                    <FontAwesomeIcon onClick={() => this.vote(1)} icon={faStar} className={value < 1 ? "dark" : ""} size="2x" />
                    <FontAwesomeIcon onClick={() => this.vote(2)} icon={faStar} className={value < 2 ? "dark" : ""} size="2x" />
                    <FontAwesomeIcon onClick={() => this.vote(3)} icon={faStar} className={value < 3 ? "dark" : ""} size="2x" />
                    <FontAwesomeIcon onClick={() => this.vote(4)} icon={faStar} className={value < 4 ? "dark" : ""} size="2x" />
                    <FontAwesomeIcon onClick={() => this.vote(5)} icon={faStar} className={value < 5 ? "dark" : ""} size="2x" />
                    <span className={this.props.isSupplierDashboard ? "voteswhite" : "votes"}>({number} votes)</span>
                </div>:
                <div className="stars">
                    <FontAwesomeIcon icon={faStar} className={value < 1 ? "dark" : ""} size="1x" />
                    <FontAwesomeIcon icon={faStar} className={value < 2 ? "dark" : ""} size="1x" />
                    <FontAwesomeIcon icon={faStar} className={value < 3 ? "dark" : ""} size="1x" />
                    <FontAwesomeIcon icon={faStar} className={value < 4 ? "dark" : ""} size="1x" />
                    <FontAwesomeIcon icon={faStar} className={value < 5 ? "dark" : ""} size="1x" />
                    <span className={this.props.isSupplierDashboard ? "voteswhite" : "votes"}>({number} votes)</span>
                </div>
            
        )
    }
}

export default Stars;