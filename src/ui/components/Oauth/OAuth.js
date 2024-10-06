import React, { Component } from 'react'
import { rootUrl } from '../../../configs/config';
import { connect } from 'react-redux';
import {soclialAuthStart} from '../../../store/actions'
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import Hoc from '../../globalComponent/Hoc'

class OAuth extends Component {

    state = {
        disabled: ''
    }

    componentDidMount() {
        const { socket, provider } = this.props

        socket.on(provider, user => {
            console.log(user)
            this.popup.close()
            const { name, photo } = user;
            this.props.onLogin(name, photo)
        })
    }

    checkPopup = () => {
        const check = setInterval(() => {
            const { popup } = this
            if (!popup || popup.closed || popup.closed === undefined) {
                clearInterval(check)
                this.setState({ disabled: '' })
            }
        }, 1000)
    }

    openPopup = () => {
        const { provider, socket } = this.props
        const width = 600, height = 600
        const left = (window.innerWidth / 2) - (width / 2)
        const top = (window.innerHeight / 2) - (height / 2)
        const url = `${rootUrl}/api/auth/${provider}?socketId=${socket.id}`

        return window.open(url, '',
            `toolbar=no, location=no, directories=no, status=no, menubar=no, 
      scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
      height=${height}, top=${top}, left=${left}`
        )
    }

    startAuth = () => {
        if (!this.state.disabled) {
            this.popup = this.openPopup()
            this.checkPopup()
            this.setState({ disabled: 'disabled' })
        }
    }

    render() {
        const { provider } = this.props
        const { disabled } = this.state

        return (
            <Hoc>
                {provider ==="google"&&<GoogleLoginButton disabled={disabled} onClick={this.startAuth} iconSize="23px" />}
                {provider ==="facebook"&&<FacebookLoginButton disabled={disabled} onClick={this.startAuth} iconSize="23px" />}
            </Hoc>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogin: (name, photo) => dispatch(soclialAuthStart(name, photo))
    }
}

export default connect(null, mapDispatchToProps)(OAuth)