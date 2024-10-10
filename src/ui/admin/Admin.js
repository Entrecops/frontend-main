import React, { Component, Suspense, lazy  } from 'react';
import { NavLink, Route, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { logout } from '../../store/actions'
import axios from 'axios';
import './Admin.scss';
import logo from '../../assets/images/logo.png';
import Hoc from '../globalComponent/Hoc';

import Loader from '../globalComponent/Loader';
import ReactLoader from '../globalComponent/ReactLoader';
//import SocketNotification from '../globalComponent/SocketNotification/SocketNotification';
import AdminMenus from './AdminMenus/AdminMenus';

const AdminCoupons = lazy(() => import('./AdminCoupons/AdminCoupons'))
const AdminReservations = lazy(() => import('./AdminReservations/AdminReservations'))
const AdminHome = lazy(() => import('./Home/Home'))
const AdminAnnonces = lazy(() => import('./AdminAnnonces/AdminAnnonces'))
const AdminServices = lazy(() => import('./AdminServices/AdminServices'))
const AdminSuppliers = lazy(() => import('./AdminSuppliers/AdminSuppliers'))
const AdminUsers = lazy(() => import('./AdminUsers/AdminUsers'))
const AdminSlider = lazy(() => import('./AdminSlider/AdminSlider'))
const AdminEmails = lazy(() => import('./AdminEMails/AdminEMails'))
const AdminPayments = lazy(() => import('./AdminPayments/AdminPayments'))
const AdminBackup = lazy(() => import('./AdminBackup/AdminBackup'))

class Admin extends Component {


    state = {
        showModal: false,
        nSuppliers: null,
        nUsers: null,
        loadingSuppliers: true,
        loadingUsers: true,
        error: '',
        redirect: false
    }

    componentDidMount() {
        //Get number of supplier
        axios.get('/api/supplier/count/all')
            .then(res => {
                this.setState({ nSuppliers: res.data.n, loadingSuppliers: false, error: '' })
            })
            .catch(err => {
                this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", loadingSuppliers: false })
            })

        //Get number of users
        axios.get('/api/user/count/all')
            .then(res => {
                this.setState({ nUsers: res.data.n, loadingUsers: false, error: '' })
            })
            .catch(err => {
                this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", loadingUsers: false })
            })
    }

    logout = () => {
        this.props.onLogout();
        this.setState({ redirect: true })
    }

    render() {
        const {user} = this.props;
        const {nSuppliers, nUsers, loadingSuppliers, loadingUsers} = this.state;
        return (
            <Hoc>
                {user&&user.role !== "admin" ? <Redirect to="/" />:null }
                {this.state.redirect ? <Redirect to="/" /> : null}
                <section className="admin">
                    <div className="main-container">
                        <div className="left-content d-flex flex-column">
                            <div className="logoWrapper">
                                <a href="/"><img src={logo} width="110" height="50" alt="LOGO" /></a>
                            </div>
                            <div className="menu mt-5">
                                <NavLink className="navbar-brand" to="/admin/home">
                                    <h3 className="d-inline align-middle">ACCUEIL</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/annonces">
                                    <h3 className="d-inline align-middle">ACTUALITES</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/services">
                                    <h3 className="d-inline align-middle">SERVICES</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/coupons">
                                    <h3 className="d-inline align-middle">COUPONS</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/menus">
                                    <h3 className="d-inline align-middle">MENUS</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/reservations">
                                    <h3 className="d-inline align-middle">RESERVATIONS</h3>
                                </NavLink>
                                {/* <NavLink className="navbar-brand" to="/admin/payments">
                                    <h3 className="d-inline align-middle">PAIEMENTS</h3>
                                </NavLink>  */}
                                <NavLink className="navbar-brand" to="/admin/emails">
                                    <h3 className="d-inline align-middle">ENVOI DES EMAILS</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/suppliers">
                                    <h3 className="d-inline align-middle">FOURNISSEURS</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/users">
                                    <h3 className="d-inline align-middle">UTILISATEURS</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/slider">
                                    <h3 className="d-inline align-middle">BANNIERE</h3>
                                </NavLink>
                                <NavLink className="navbar-brand" to="/admin/backup">
                                    <h3 className="d-inline align-middle"> DATA BACKUP</h3>
                                </NavLink>
                                <a href="#logout" onClick={this.logout} className="mt-auto btn btn-outline-light btn-lg logout">DECONNEXION</a>
                            </div>
                        </div>
                        <div className="right-content">
                            <div className="container">
                                <div className="row justify-content-end">
                                    <div className="col d-flex justify-content-end mb-3">
                                        <div className="stat-item">
                                            <FontAwesomeIcon icon={faUserCircle} size={"2x"} />
                                            {loadingSuppliers ? <Loader /> : <h4>{nSuppliers} Fournisseurs</h4>}
                                        </div>
                                        <div className="stat-item">
                                            <FontAwesomeIcon icon={faUserFriends} size={"2x"} />
                                            {loadingUsers ? <Loader /> : <h4>{nUsers} Utilisateurs</h4>}
                                        </div>
                                    </div>
                                </div>
                                <hr/>
                            </div>
                            {/* Admin Component */}
                            <Suspense fallback={<ReactLoader />}>
                                <Route exact path="/admin/home" component={AdminHome} />
                                <Route exact path="/admin/coupons" component={AdminCoupons} />
                                <Route exact path="/admin/menus" component={AdminMenus} />
                                <Route exact path="/admin/reservations" component={AdminReservations} />
                                <Route exact path="/admin/annonces" component={AdminAnnonces} />
                                <Route exact path="/admin/services" component={AdminServices} />
                                <Route exact path="/admin/suppliers" component={AdminSuppliers} />
                                <Route exact path="/admin/users" component={AdminUsers} />
                                <Route exact path="/admin/slider" component={AdminSlider} />
                                <Route exact path="/admin/emails" component={AdminEmails} />
                                <Route exact path="/admin/payments" component={AdminPayments} />
                                <Route exact path="/admin/backup" component={AdminBackup} />

                            </Suspense>
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

const mapDispatchToState = dispatch => {
    return {
        onLogout: () => dispatch(logout())
    }
}

export default connect(mapPropsToState, mapDispatchToState)(Admin);