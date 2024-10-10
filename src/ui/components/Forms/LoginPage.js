import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import Hoc from '../../globalComponent/Hoc'
import LoginForm from './LoginForm';
import { connect } from 'react-redux';

class LoginPage extends Component {

    render() {
        return (
            <Hoc>
                {this.props.token ? this.props.history.goBack(): null}
                <Header />
                <LoginForm />
            </Hoc>
        );
    }
}

const mapPropsToState = state => {
    return {
        token: state.auth.token,
    }
}

export default connect(mapPropsToState)(LoginPage);