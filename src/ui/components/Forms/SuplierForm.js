import React, { Component } from 'react';
import axios from 'axios';
import './SupplierForms.scss';
import {Redirect} from 'react-router-dom';
import Upload from '../Forms/Upload';
import Hoc from '../../globalComponent/Hoc'
import Loader from '../../globalComponent/Loader';

class SupplierForm extends Component {

    state = {
        name: '',
        email: '',
        tel: '',
        location: '',
        services: [],
        profileImage: '',
        otherInfos: '',
        mapLink: '',
        isTyping: false,
        formValid: false,
        emailValid: false,
        nameValid: false,
        telValid: false,
        locationValid: false,
        servicesValid: false,
        profileImageValid: false,
        otherInfosValid: false,
        loading: false,
        redirect: false,
        error: '',
        editMode: false
    }

    componentDidMount() {
        if( this.props.supplier !== undefined && this.props.supplier != null ){
            const editableSupplier = this.props.supplier;
            this.setState({
                name: editableSupplier.name,
                email: editableSupplier.email,
                tel: editableSupplier.tel,
                location: editableSupplier.location,
                mapLink: editableSupplier.mapLink,
                otherInfos: editableSupplier.otherInfos,
                services: editableSupplier.services,
                editMode: true
            });
        } else {
            this.setState({ editMode: false })
        }
    }

    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value, error: '' },
            () => { this.validateField(name, value) });
    }

    validateField = (fieldName, value) => {
        let { emailValid, nameValid, telValid, locationValid, servicesValid, profileImageValid, otherInfosValid, editMode} = this.state;

        switch (fieldName) {
            case 'email':
                emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
                break;
            case 'name':
                nameValid = value.length > 0;
                break;
            case 'tel':
                telValid = value.length > 0;
                break;
            case 'location':
                locationValid = value.length > 0;
                break;
            case 'services':
                servicesValid = value.length > 0;
                break;
            case 'profileImage':
                profileImageValid = value.length > 0;
                break;
            case 'otherInfos':
                otherInfosValid = value.length > 0;
                break;
            default:
                break;
        }
        this.setState({
            emailValid: emailValid,
            nameValid: nameValid,
            telValid: telValid,
            locationValid: locationValid,
            servicesValid: servicesValid,
            profileImageValid: profileImageValid,
            otherInfosValid: otherInfosValid,
        }, this.validateForm);
    }

    validateForm = () => {
        this.setState({ formValid:
            (this.state.emailValid&&this.state.emailValid.length === 4) &&
            this.state.nameValid &&
            this.state.telValid &&
            this.state.locationValid &&
            this.state.servicesValid &&
            this.state.profileImageValid &&
            this.state.otherInfosValid });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if(this.state.formValid || this.state.editMode ) {
            const formData = new FormData();
            const { email, name, tel, location, services, profileImage, otherInfos, mapLink, editMode } = this.state;
            const { supplier } = this.props;
            formData.append('name', name);
            formData.append('email', email);
            formData.append('tel', tel);
            if( editMode ) {
                formData.append('oldEmail', supplier.email );
            }
            formData.append('location', location);
            formData.append('services', services);
            formData.append('profileImage', profileImage);
            formData.append('otherInfos', otherInfos);
            formData.append('mapLink', mapLink);
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            };
            // Save the supplier
            this.setState({loading: true});
            try {
                axios.post(( !this.state.editMode ) ? '/api/supplier/new' : '/api/supplier/admin-edit', formData, config)
                .then(res => {
                    this.setState({
                        loading: false,
                        name: '',
                        email: '',
                        tel: '',
                        location: '',
                        services: '',
                        profileImage: '',
                        otherInfos: '',
                        mapLink: '',
                        isTyping: false,
                        formValid: false,
                        emailValid: false,
                        nameValid: false,
                        telValid: false,
                        locationValid: false,
                        servicesValid: false,
                        profileImageValid: false,
                        otherInfosValid: false,
                        error: '',
                    });
                    // if (this.props.closeModal) {
                    //     this.props.closeModal();
                    // }

                    this.props.addNotification("success", "Partenaire!", "Partenaire crée avec succès. En attente de validation");
                })
                .catch(err => {
                    if (err.response.data.message === 'EMAIL_EXIST') {
                        this.setState({ error: "Adresse Email déja utilisée", loading: false });
                    } else {
                        this.setState({ error: "Erreur de connexion. Veuillez reéssayer", loading: false });
                    }
                })
            } catch (error) {
                this.setState({ error: "Erreur de connexion. Veuillez reéssayer", loading: false });
            }
        } else {
            this.setState({ error: "Veuillez remplir tous les champs", isTyping: true});
        }
    }

    setFile(name,file) {
        this.setState({
            [name]: file,
            profileImageValid: true,
            error: ''
        }, this.validateForm);
    }

    render() {
        const {
            isTyping,
            name,
            tel,
            services,
            location,
            locationValid,
            otherInfos,
            emailValid,
            telValid,
            email,
            nameValid,
            profileImage,
            servicesValid,
            otherInfosValid,
            profileImageValid,
            loading,
            mapLink
        } = this.state;
        const { error, loader } = this.props;
        return (
            <Hoc>
                <div className="wrapper">
                <div id="formContent">
                {this.state.redirect ? this.props.closeTo ? <Redirect to={this.props.closeTo} />: null : null}
                <form id="supplierForm" className="pr-4 pl-4">
                    {error && error.length ? <div className="alert alert-danger" style={{fontSize: "1.3rem"}}>{error}</div> : null}
                    <input type="text" value={name} onChange={(e) => this.handleInputChange(e)} id="name" className="fadeIn second" name="name" placeholder="Nom complet"/>
                    {isTyping&&!nameValid ? <div style={{color: "red"}}>Invalide. Min 6 caratères</div>:null}
                    <input type="email" value={email} onChange={(e) => this.handleInputChange(e)} id="email" className="fadeIn second" name="email" placeholder="Adresse Email"/>
                    {isTyping&&!emailValid ? <div style={{color: "red"}}>Email non valide.</div>:null}
                    <input type="tel" value={tel} onChange={(e) => this.handleInputChange(e)} id="tel" className="fadeIn second" name="tel" placeholder="Numero de Téléphone"/>
                    {isTyping&&!telValid ? <div style={{color: "red"}}>Tel non valide.</div>:null}
                    <input type="text" value={location} onChange={(e) => this.handleInputChange(e)} id="location" className="fadeIn second" name="location" placeholder="Localisation"/>
                    {isTyping&&!locationValid ? <div style={{color: "red"}}>invalide.</div>:null}
                    <input type="text" value={mapLink} onChange={(e) => this.handleInputChange(e)} id="mapLink" className="fadeIn second" name="mapLink" placeholder="Inserer le lien Google Map"/>
                    <input type="text" value={services} onChange={(e) => this.handleInputChange(e)} id="services" className="fadeIn second" name="services" placeholder="Vos services (Séparez par des Virgules : ',')"/>
                    {isTyping&&!servicesValid ? <div style={{color: "red"}}>invalide.</div>:null}
                    <textarea type="text" value={otherInfos} onChange={(e) => this.handleInputChange(e)} id="otherInfos" className="fadeIn second" name="otherInfos" placeholder="Autres informations"/>
                    {isTyping&&!otherInfosValid ? <div style={{color: "red"}}>invalide.</div>:null}


                    <div className="upload row align-items-center justify-content-center py-3">
                        <div className="upload col-sm-8 col-md-8 col-lg-6 d-flex flex-column justify-content-center align-items-center">
                            <Upload type="image" oldUrl={profileImage} setFile={(name, file) => this.setFile(name, file)} name="profileImage" label={"Image de Profil"} />
                            {isTyping && !profileImageValid ? <p className="alert alert-danger">Image Requise</p>:null }
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                        <button disabled={loading} type="submit" onClick={(e) => this.handleSubmit(e)} className="button fourth mt-4 mb-5">{loading ? <Loader color="white" /> : "Valider"}</button>
                    </div>
                </form>
                </div>
                </div>
            </Hoc>
        );
    }
}

export default SupplierForm;