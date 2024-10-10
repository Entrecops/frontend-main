import React, { Component } from 'react';
import Header from '../../globalComponent/Header';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import Loader from '../../globalComponent/Loader';
import {connect} from 'react-redux';
import {login} from '../../../store/actions';
import './Supplier.scss';
import Hoc from '../../globalComponent/Hoc'

class SupplierConfirmationForm extends Component {

    state = {
        password: '', 
        password2: '', 
        passwordValid: '', 
        error: '', 
        isTyping: false, 
        submitting: false,
        formValid: false,
        loading: true,
        supplier: null,
        redirect: false
    }

    handleInputChange = (e) => {
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value, error: '' },
            () => { this.validateField(name, value) });
    }

    validateField = (fieldName, value) => {
        let { passwordValid} = this.state;
        switch (fieldName) {
            case 'password':
                passwordValid = value.length > 5;
                break;
            default:
                break;
        }
        this.setState({
            passwordValid: passwordValid,
        }, this.validateForm);
    }

    validateForm = () => {
        this.setState({ formValid: (this.state.password === this.state.password2) && this.state.passwordValid });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if(this.state.formValid) {
            const { password, supplier } = this.state;

            // Update the supplier
            this.setState({submitting: true});
            try {
                axios.patch('/api/supplier/'+supplier._id+'/confirmation', {password: password})
                .then(res => {
                    // Authenticate the user
                    const data = {email: supplier.email, password: password}
                    this.props.onLogin(data);
                    this.setState({ submitting: false, redirect: true });
                })
                .catch(err => {
                    console.log(err);
                    this.setState({ error: "Erreur de compte", submitting: false });
                })
            } catch (error) {
                this.setState({ error: "Erreur de connexion. Veuillez reéssayer", submitting: false });
            }
        } else {
            this.setState({ error: "Les champs ne correspondent pas", isTyping: true});
        }
    }

    componentWillMount() {
        // Fetch use infos by id
        this.setState({ loading: true});
        const id = this.props.location.pathname.split('/')[2]
        axios.get('/api/supplier/'+id)
        .then(res => {
            this.setState({ loading: false, supplier: res.data.supplier});
        })
        .catch(err => {
            console.log(err);
            this.setState({ error: "Une Erreur s'est produite. Veuillez reéssauer", loading: false });
        })
    }

    render() {
        const {password, password2, passwordValid, error, isTyping, submitting, supplier, loading, redirect} = this.state;
        return (
            <Hoc>
                {redirect ? <Redirect to="/dashboard/reservations" />:null}
                <Header />
                <section className="supplier-view-page">
                    <div className="container my-5">
                        <div className="row justify-content-center mt-5">
                            <div className="col-sm-11 col-md-10 col-lg-8 mb-5 supplier-registration-form">
                                <div className="row mb-5">
                                    <div className="col-sm-12">
                                        <h2 className="text-center mb-3">DESORMAIS UN PARTENAIRE</h2>
                                        <h5 className="text-center mb-5">Validez votre compte en entrant votre mot de passe.</h5>
                                        <hr />
                                    </div>
                                </div>
                                <div className="row mb-5">
                                    <div className="col-sm-12">
                                        {
                                            loading ? <div className="text-center d-flex justify-content-center"><Loader /> </div>:
                                            <form>
                                                {supplier ? <h3 className="py-3">{supplier.name} <span>({supplier.email})</span></h3>:null}
                                                {error && error.length ? <div className="alert alert-danger" style={{fontSize: "1.3rem"}}>{error}</div> : null}
                                                <div className="form-group">
                                                    <label for="name">Mot de passe</label>
                                                    <input type="password" className={isTyping && !passwordValid ? "form-control is-invalid" : "form-control"} value={password} onChange={(e) => this.handleInputChange(e)} name="password" placeholder="Mot de passe" />
                                                    {isTyping && !passwordValid ? <div className="invalid-feedback">Invalide</div> : null}
                                                </div>
                                                <div className="form-group">
                                                    <label for="name">Confirmation</label>
                                                    <input type="password" className="form-control" value={password2} onChange={(e) => this.handleInputChange(e)} name="password2" placeholder="Confirmation" />
                                                </div>
                                                <div className="d-flex justify-content-end">
                                                    <button disabled={submitting} type="submit" onClick={(e) => this.handleSubmit(e)} className="button fourth mt-4 mb-5">{submitting ? <Loader color="white" /> : "Valider"}</button>
                                                </div>
                                            </form>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Hoc>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogin: (data) => dispatch(login(data))
    }
}

export default connect(null, mapDispatchToProps)(SupplierConfirmationForm);