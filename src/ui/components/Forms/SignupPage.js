import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import Hoc from '../../globalComponent/Hoc';
import SignupForm from './SignupForm';
import { connect } from 'react-redux';

class SigninPage extends Component {

    render() {
        return (
            <Hoc>
                {this.props.token ? this.props.history.goBack(): null}
                <Header />
                <SignupForm />
            </Hoc>
        );
    }
}

const mapPropsToState = state => {
    return {
        token: state.auth.token,
    }
}

export default connect(mapPropsToState)(SigninPage);