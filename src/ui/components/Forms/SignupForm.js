import React, { Component } from 'react';
import './Forms.scss';
import { connect } from 'react-redux';
import {Link} from 'react-router-dom';
import { signup, renderLoader, clearError } from '../../../store/actions';
import Loader from '../../globalComponent/Loader';
import OAuth from '../Oauth/OAuth'
import io from 'socket.io-client';
import { rootUrl } from '../../../configs/config'

import userLogo from '../../../assets/images/logo.png';
const socket = io(rootUrl);

class SignUpForm extends Component {
    state = {
        email: '',
        password: '',
        name: '',
        tel: '',
        isTyping: false,
        formErrors: {email: '', password: '', name: ''},
        emailValid: false,
        passwordValid: false,
        nameValid: false,
        formValid: false
    }

    componentDidMount() {
        this.props.onClearError();
    }

    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        this.setState({[name]: value}, 
            () => { this.validateField(name, value) });
    }

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let emailValid = this.state.emailValid;
        let passwordValid = this.state.passwordValid;
        let nameValid = this.state.nameValid;
      
        switch(fieldName) {
          case 'email':
            emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
            fieldValidationErrors.email = emailValid ? '' : ' is invalid';
            break;
          case 'password':
            passwordValid = value.length >= 6;
            fieldValidationErrors.password = passwordValid ? '': ' is too short';
            break;
          case 'name':
            nameValid = value.trim().length >= 6;
            fieldValidationErrors.name = nameValid ? '': ' is too short';
            break;
          default:
            break;
        }
        this.setState({formErrors: fieldValidationErrors,
                        emailValid: emailValid,
                        passwordValid: passwordValid,
                        nameValid: nameValid
                      }, this.validateForm);
    }
      
    validateForm() {
        this.setState({formValid: this.state.emailValid && this.state.passwordValid && this.state.nameValid});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({isTyping: true});
        if (this.state.formValid) {
            // Display Loader
            this.props.onRenderLoader();
            const data = {
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
                tel: this.state.tel
            }
            // Launch the signup
            this.props.onSignUp(data);
        }
    }

    render() {
        const { isTyping, emailValid, passwordValid, nameValid , name, email, password, tel } = this.state;
        const { error, loader } = this.props;
        
        return (
            <div className="wrapper fadeInDown">
                <div id="formContent">
                    <div className="fadeIn first mt-5">
                    <img src={userLogo} id="icon" alt="User Icon" />
                    </div>
                    <form>
                        {error&&error.length ? <div className="alert alert-danger">{error}</div>:null}
                        <input type="text" value={name} onChange={(e) => this.handleInputChange(e)} id="nom" className="fadeIn second" name="name" placeholder="Nom"/>
                        {isTyping&&!nameValid ? <div style={{color: "red"}}>Invalide. Min 6 caratères</div>:null}
                        <input type="email" value={email} onChange={(e) => this.handleInputChange(e)} id="email" className="fadeIn second" name="email" placeholder="Adresse Email"/>
                        {isTyping&&!emailValid ? <div style={{color: "red"}}>Email non valide.</div>:null}
                        <input type="password" value={password} onChange={(e) => this.handleInputChange(e)} id="password" className="fadeIn third" name="password" placeholder="Mot de passe"/>
                        {isTyping&&!passwordValid ? <div style={{color: "red"}}>Invalide. Min 6 caratères</div>:null}
                        <input type="text" value={tel} onChange={(e) => this.handleInputChange(e)} id="tel" className="fadeIn second" name="tel" placeholder="Numéro Whatsapp" />
                        <button disabled={loader} type="submit" onClick={(e) => this.handleSubmit(e)} id="signBtn" className="button fadeIn fourth mt-4 mb-5">{loader ? <Loader color="white" />:"S'inscrire"}</button>
                    </form>

                    <p>Ou bien inscrivez vous avec:</p>
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
                        <Link to="/auth/login" className="underlineHover">Déja inscrit ? Connectez vous.</Link>
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
        onSignUp: (data) => dispatch(signup(data)),
        onRenderLoader: () => dispatch(renderLoader()),
        onClearError: () => dispatch(clearError()),
    }
}

export default connect(mapPropsToState, mapDispatchToState)(SignUpForm);