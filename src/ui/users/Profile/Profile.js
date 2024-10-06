import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import Header from '../../globalComponent/Header';
import Loader from '../../globalComponent/Loader';
import Upload from '../../components/Forms/Upload';
import {rootUrl} from '../../../configs/config';
import userImg from '../../../assets/images/user.png';
import './Profile.scss';
import Hoc from '../../globalComponent/Hoc';

class Profile extends Component {

    state = {
        user: null,
        email: '',
        password: '',
        name: '',
        tel: '',
        isTyping: false,
        isTyping2: false,
        formErrors: { email: '', password: '', name: '' },
        emailValid: false,
        nameValid: false,
        formValid: false,
        location: '',
        loading: false,
        successReset: false, 
        successModify: false,
        error: '',
        error2: '',

        /* Password change */
        password1: '',
        newpassword1: '',
        newpassword2: '',
        newpassword1Valid: false,
        passwordValid: false,
        passwordMatch: false,
        changingPassword: false
    }

    componentDidUpdate(prevProps) {
        if(this.props.user !== prevProps.user) {
            const { name, email, location, tel} = this.props.user
            this.setState({
                name: name,
                email: email === null ? "" : email,
                location: location,
                tel: tel === null ? "" : tel,
                formValid: name&&email ? true: false,
                nameValid: name ? true : false,
                emailValid: email ? true: false,
                user: this.props.user
            })
        }
    }

    componentDidMount() {
        if (this.props.user) {
            const { name, email, location, tel } = this.props.user
            this.setState({
                name: name,
                email: email === null ? "" : email,
                location: location,
                tel: tel === null ? "" : tel,
                formValid: name && email ? true : false,
                nameValid: name ? true : false,
                emailValid: email ? true : false,
                user: this.props.user
            })
        }
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
        let nameValid = this.state.nameValid;
        let newpassword1Valid = this.state.newpassword1Valid;

        switch (fieldName) {
            case 'email':
                emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
                fieldValidationErrors.email = emailValid ? '' : ' is invalid';
                break;
            case 'name':
                nameValid = value.trim().length >= 6;
                fieldValidationErrors.name = nameValid ? '' : ' is too short';
                break;
            case 'newpassword1':
                newpassword1Valid = value.trim().length >= 6;
                break;
            case 'password1':
                passwordValid = value.trim().length >= 6;
                break;
            default:
                break;
        }
        this.setState({
            formErrors: fieldValidationErrors,
            emailValid: emailValid,
            passwordValid: passwordValid,
            nameValid: nameValid,
            newpassword1Valid: newpassword1Valid
        }, this.validateForm);
    }

    validateForm() {
        this.setState({ formValid: this.state.emailValid && this.state.nameValid,
            passwordMatch: this.state.passwordValid && this.state.newpassword1Valid && (this.state.newpassword2 === this.state.newpassword1) });
    }

    // Update profile
    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({ isTyping: true });
        if (this.state.formValid) {
            // Display Loader
            this.setState({ loading: true });
            const { name, email, tel, location, profileImage } = this.state;
            let url = '/api/user/' + this.props.user._id;
            if (profileImage&&profileImage.type) {
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('location', location.trim().length < 0 ? "" : location);
                formData.append('tel', tel.length < 0 ? "" : tel);
                formData.append('profileImage', profileImage);
                const config = {
                    headers: {
                        'content-type': 'multipart/form-data'
                    }
                };
                url = '/api/user/' + this.props.user._id + '/image';
                axios.patch(url, formData, config)
                .then(res => {
                    this.setState({ loading: false, successModify: true, profileImage: "" })
                })
                .catch(err => {
                    this.setState({error: "Une érreur s'est produite", loading: false})
                })
            } else {
                axios.patch(url, {
                    name: name,
                    email: email,
                    tel: tel&&tel.length < 0 ? "" : tel,
                    location: location&&location.trim().length < 0 ? "" : location
                })
                .then(res => {
                    this.setState({ loading: false, successModify: true })
                })
                .catch(err => {
                    this.setState({error: "Une érreur s'est produite", loading: false})
                })
            }
        }
    }

    // Reset password
    handleSubmit2 = (e) => {
        e.preventDefault();
        this.setState({ isTyping2: true });
        if(this.state.passwordMatch) {
            this.setState({ changingPassword: true });
            const { password1, newpassword1 } = this.state;
            axios.patch('/api/user/' + this.props.user._id + '/password/update', {
                    password: password1,
                    newpassword: newpassword1
                })
                .then(res => {
                    this.setState({ changingPassword: false, successReset: true, error2: '' })
                })
                .catch(err => {
                    if (err.response.data.message === 'WRONG_PASSWORD') {
                        this.setState({error2: "Mot de Passe non reconnue.", changingPassword: false})
                    } else {
                        this.setState({ error2: "Une erreur s'est produite, Veuillez reéssayer.", changingPassword: false })
                    }
                })
        }
    }

    setFile = (name, file) => {
        this.setState({
            [name]: file,
            imageValid: true,
            error: ''
        }, this.validateForm);
    }


    render() {
        const { isTyping, isTyping2, emailValid, passwordValid, nameValid, name, email, tel, passwordMatch, loading, user, error2,
            changingPassword, password1, newpassword1, newpassword2, location, profileImage, error, successReset, successModify } = this.state;

        return (
            <Hoc>
                <Header />
                <section className="profile-section">
                    <div className="container my-5">
                        <div className="row justify-content-between">
                            <div className="col-sm-12 text-center pb-4">
                                <h3>Paramètres du compte</h3>
                                <h5 className="pb-3">Editez votre compte ici.</h5>
                                <hr/>
                            </div>
                            <div className="col-sm-12 col-md-2 col-lg-2 mt-3 d-flex flex-column align-items-center">
                                {user&&user.provider!=="social"&&<img src={user&& user.profileImage ? rootUrl+'/'+user.profileImage: userImg} 
                                className="rounded-circle" alt="" width="200" height="200" />}
                                {user&&user.provider==="social"&&<img src={user&& user.profileImage ? user.profileImage: userImg} 
                                className="rounded-circle" alt="" width="200" height="200" />}
                                <h4 className="mt-3 text-center"><strong>{user ? user.name :null}</strong></h4>
                                <h5 className="text-center">{user ? user.email: null}</h5>
                            </div>
                            <div className="col-sm-12 col-md-5 col-lg-5">
                                <h4 className="py-3">Mettre à jour mes informations</h4>
                                <form>
                                    {successModify ? <div className="alert alert-success">Profil modifié avec succès.</div> : null}
                                    {error&&error.length ? <div className="alert alert-danger">{error}</div> : null}
                                    <input type="text" value={name} onChange={(e) => this.handleInputChange(e)} name="name" placeholder="Nom" />
                                    {isTyping && !nameValid ? <div style={{ color: "red" }}>Invalide. Min 6 caratères</div> : null}
                                    <input type="email" value={email} onChange={(e) => this.handleInputChange(e)} name="email" placeholder="Adresse Email" />
                                    {isTyping && !emailValid ? <div style={{ color: "red" }}>Email non valide.</div> : null}
                                    <input type="text" value={location} onChange={(e) => this.handleInputChange(e)}  name="location" placeholder="Adresse" />
                                    <input type="text" value={tel} onChange={(e) => this.handleInputChange(e)} name="tel" placeholder="Numéro de Téléphone" />
                                    <div className="py-3 justify-content-center">
                                        {user && user.provider !== "social"&&<Upload type="image" oldUrl={profileImage} setFile={(name, file) => this.setFile(name, file)} name="profileImage" label={"Importer une image de profile"} />}
                                    </div>
                                    <button disabled={loading} type="submit" onClick={(e) => this.handleSubmit(e)} id="signBtn" className="button mt-4 mb-5">{loading ? <Loader color="white" /> : "Enregistrer"}</button>
                                </form>
                            </div>
                            <div className="col-sm-12 col-md-5 col-lg-4">
                                <h4 className="py-3">Réinitialiser votre mot de passe</h4>
                                <form>
                                    {successReset ? <div className="alert alert-success">Mot de passe modifié avec succès.</div> : null}
                                    {error2&&error2.length ? <div className="alert alert-danger">{error2}</div> : null}
                                    <input type="password" value={password1} onChange={(e) => this.handleInputChange(e)}  name="password1" placeholder="Ancien Mot de passe" />
                                    {isTyping2 && !passwordValid ? <div style={{ color: "red" }}>Invalide. Min 6 caratères</div> : null}
                                    <input type="password" value={newpassword1} onChange={(e) => this.handleInputChange(e)} name="newpassword1" placeholder="Nouveau mot de passe" />
                                    <input type="password" value={newpassword2} onChange={(e) => this.handleInputChange(e)} name="newpassword2" placeholder="Confirmation" />
                                    {isTyping2 && !passwordMatch ? <div style={{ color: "red" }}>Les mots de passes ne correspondent pas.</div> : null}
                                    <button disabled={changingPassword} type="submit" onClick={(e) => this.handleSubmit2(e)}  className="button mt-4 mb-5">{changingPassword ? <Loader color="white" /> : "Réinitialiser"}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </Hoc>
        );
    }
}

const mapPropsToState = state => {
    return {
        user: state.auth.user
    }
}

export default connect(mapPropsToState)(Profile);
