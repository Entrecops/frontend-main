import React, { Component } from 'react';
import './Forms.scss'; 
import { connect } from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import { login, renderLoader, clearError } from '../../../store/actions';
import Loader from '../../globalComponent/Loader';
import OAuth from '../Oauth/OAuth'
import io from 'socket.io-client';
import { rootUrl } from '../../../configs/config'

import userLogo from '../../../assets/images/logo.png';
const socket = io(rootUrl);

class LoginForm extends Component {

    state = {
        email: '',
        password: '',
        isTyping: false,
        formErrors: { email: '', password: '' },
        emailValid: false,
        passwordValid: false,
        formValid: false,
        loading: false
    }

    componentDidMount() {
        this.props.onClearError();
    }

    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value },
            () => { this.validateField(name, value) });
    }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let emailValid = this.state.emailValid;
        let passwordValid = this.state.passwordValid;

        switch (fieldName) {
            case 'email':
                emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
                fieldValidationErrors.email = emailValid ? '' : ' is invalid';
                break;
            case 'password':
                passwordValid = value.length >= 6;
                fieldValidationErrors.password = passwordValid ? '' : ' is too short';
                break;
            default:
                break;
        }
        this.setState({
            formErrors: fieldValidationErrors,
            emailValid: emailValid,
            passwordValid: passwordValid
        }, this.validateForm);
    }

    validateForm() {
        this.setState({ formValid: this.state.emailValid && this.state.passwordValid });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        // Display Loader
        this.setState({isTyping: true});
        if(this.state.formValid) {
            this.props.onRenderLoader();
            const data = {
                email: this.state.email,
                password: this.state.password
            }
            // Launch the signup
            this.props.onLogin(data);
        }
    }

    render() {
        const { isTyping, emailValid, email, password } = this.state;
        const { error, loader } = this.props;
        
        return (
            <div className="wrapper fadeInDown">
                <div id="formContent">
                    <div className="fadeIn first mt-5">
                    <img src={userLogo} id="icon" alt="User Icon" />
                    </div>

                    <form className="pr-4 pl-4">
                        {error && error.length ? <div className="alert alert-danger">{error}</div> : null}
                        <input type="email" value={email} onChange={(e) => this.handleInputChange(e)} id="email" className="fadeIn second" name="email" placeholder="Adresse Email" />
                        {isTyping && !emailValid ? <div style={{ color: "red" }}>Email non valide.</div> : null}
                        <input type="password" value={password} onChange={(e) => this.handleInputChange(e)} id="password" className="fadeIn third" name="password" placeholder="Mot de passe" />
                        {isTyping && !this.state.passwordValid ? <div style={{ color: "red" }}>Invalide. Min 6 caratères</div> : null}
                        <button disabled={loader} type="submit" onClick={(e) => this.handleSubmit(e)} id="signBtn" className="button fadeIn fourth mt-4 mb-5">{loader ? <Loader color="white" /> : "Se connecter"}</button>
                    </form>
                    <p>Ou bien connectez vous avec:</p>
                    <div className="d-flex socialWrapper">
                        <OAuth
                            provider={"google"}
                            key={"google"}
                            socket={socket}
                        />
                        <OAuth
                            provider={"facebook"}
                            key={"facebook"}
                            socket={socket}
                        />
                    </div>

                    <div id="formFooter">
                        <Link to="/auth/signup" className="underlineHover">Ou bien Inscrivez vous Ici.</Link>
                    </div>

                </div>
            </div>
        );
    }
}

const mapPropsToState = state => {
    return {
        loader: state.loader.loading,
        error: state.auth.error
    }
}

const mapDispatchToState = dispatch => {
    return {
        onLogin: (data) => dispatch(login(data)),
        onRenderLoader: () => dispatch(renderLoader()),
        onClearError: () => dispatch(clearError()),
    }
}

export default connect(mapPropsToState, mapDispatchToState)(withRouter(LoginForm));