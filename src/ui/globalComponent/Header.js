import React, { PureComponent } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { logout } from '../../store/actions';
import { faSearch, faBookmark, faBell} from '@fortawesome/free-solid-svg-icons';
import './Header.scss';
import logo from '../../assets/images/logo.png';
// import socketIOClient from 'socket.io-client';

import Notifications from '../users/Notifications/Notifications';
// import { rootUrl } from '../../configs/config';
import {autoSignIn} from '../../store/actions';
import SearchResult from '../components/SearchResult/SearchResult'
import Hoc from './Hoc';
import SocketNotification from './SocketNotification/SocketNotification';

class Header extends PureComponent {

    state = {
        user: null,
        name: "",
        token: null,
        role: "",
        accountValidated: null,
        redirect: false,
        query: "",
        newReservationCount: 0
    }

    componentDidMount() {
        const authData = JSON.parse(localStorage.getItem("authData"));
        if (authData && authData.user) {
            this.setState({
                user: authData.user,
                name: authData.user.name,
                token: authData.token,
                role: authData.user.role,
                accountValidated: authData.user.accountValidated
            })
        }

    }

    componentDidUpdate(prevProps) {
        this.setState({
            user: this.props.user,
            name: this.props.name,
            token: this.props.token,
            role: this.props.role,
            accountValidated: this.props.accountValidated,
            newReservationCount: this.props.newReservationCount
        });
        // if(prevProps.user !== this.props.user || prevProps.newReservationCount !== this.props.newReservationCount ) {
        // }
    }

    logout = () => {
        this.props.onLogout();
    }

    handleInputChange = (e) => {
        const value = e.target.value;
        this.setState({ query: value})
    }

    render() {
        const {
            name,
            token,
            role,
            accountValidated,
            user,
            newReservationCount
        } = this.state;
        let nNotifications = 0;
        if (user && user.recommandations && user.recommandations.length) {
            let unOpened = user.recommandations.filter(rec => {
                return rec.visited === false;
            })
            nNotifications = unOpened.length;
        }
        return (
            <Hoc>
                <SocketNotification user={user} />
                <nav className={this.props.home ? "navbar navbar-expand-lg navbar-light bg-light navbar-shadow": "navbar navbar-expand-lg navbar-light bg-light navbar-shadow" }>
                    <div className="container">
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="search-wrapper">
                            <form className="form-inline d-lg-none my-2 my-lg-0 navbar-brand form-mobile">
                                <input onChange={(e) => this.handleInputChange(e)} className="form-control mr-sm-2" type="text" placeholder="Rechercher..." aria-label="Rechercher..." />
                                <FontAwesomeIcon icon={faSearch} size={"2x"} />
                            </form>
                            {this.state.query.trim().length > 0 ?
                                <SearchResult query={this.state.query} className="d-lg-none" />:null
                            }
                        </div>
                        {
                            token ?
                            <div className="dropdown-mobile mt-2">
                                 {token && role !== "admin"?
                                <a href="/recommandations" className=""  id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <FontAwesomeIcon icon={faBookmark} size={"1x"} /><sup className="ml-1">{user.recommandations && user.recommandations.length ? user.recommandations.length:0}</sup>
                                </a>:null}

                                    {user.recommandations && user.recommandations.length ?
                                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                            <Notifications recommandations={user.recommandations.reverse()} />
                                            <div className="notifications-link py-2">
                                                <a id="notifications-link" className="notifications-link pt-3 text-center" href="/user/notifications">Voir toutes les notifications</a>
                                            </div>
                                        </div> : null
                                    }
                            </div>:null

                        }
                        <Link className="navbar-brand" to="/">
                            <img src={logo} width="110" height="100%" alt="Logo" />
                        </Link>
                        <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                            <div className="ml-auto search-wrapper">
                                <form className="form-inline d-none d-lg-block my-2 my-lg-0 ml-auto mr-4 form-desktop">
                                    <input onChange={(e) => this.handleInputChange(e)} className="form-control mr-sm-2" type="text" placeholder="Rechercher..." aria-label="Rechercher..." />
                                    <FontAwesomeIcon icon={faSearch} size={"2x"} />
                                </form>
                                {this.state.query.trim().length > 0 ?
                                <SearchResult query={this.state.query} className="d-none d-lg-block" />:null
                                }
                            </div>
                            <ul className="navbar-nav  mt-2 mt-lg-0">
                                {
                                    token && role === "admin" ?
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/admin/home">
                                            Dashboard
                                        </NavLink>
                                    </li>:null
                                }
                                {
                                    token && role === "supplier" && accountValidated ?
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/dashboard/reservations">
                                            Dashboard
                                        </NavLink>
                                    </li>:null
                                }
                                {
                                    token && (role === "user" || role === "supplier") ?
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/user/reservations">Mon activité</NavLink>
                                    </li>:null
                                }
                                {
                                    token && (role === "user" || role === "supplier") ?
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/user/gallery">Ma Galerie</NavLink>
                                    </li>:null
                                }
                                {
                                    token && role !== "admin"?
                                    <li className="nav-item rec-item-desktop">
                                        <div className="dropdown mt-2">
                                            <a href="/recommandations" className=""  id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <FontAwesomeIcon icon={faBell} size={"1x"} /><sup className="ml-1">{nNotifications}</sup>
                                            </a>
                                            {user.recommandations && user.recommandations.length ?
                                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                    <Notifications recommandations={user.recommandations.filter( rec => rec.visited !== true ).reverse()} />
                                                    <div className="notifications-link py-2">
                                                        <Link id="notifications-link" className="notifications-link pt-3 text-center" to="/user/notifications">Voir toutes les notifications</Link>
                                                    </div>
                                                </div> : null
                                            }
                                        </div>
                                    </li>: null

                                }
                                {
                                    !token ?
                                        <Hoc>
                                            <li className="nav-item">
                                                <NavLink className="nav-link" to="/auth/signup"><i className="fa fa-user"></i>Créer un compte</NavLink>
                                            </li>
                                            <li className="nav-item">
                                                <NavLink className="nav-link" to="/auth/login"><i className="fa fa-user"></i>Se connecter</NavLink>
                                            </li>
                                        </Hoc>
                                        :null
                                }
                            </ul>
                                {
                                    token ?
                                    <div className="dropdown">
                                        <p className="dropbtn">{name}</p>
                                        <div className="dropdown-content">
                                            <NavLink className="nav-link" to="/user/profile"><i className="fa fa-user"></i>Mon profil</NavLink>
                                            <a href="/auth/login" onClick={this.logout}><i className="fa fa-sign-out"></i>Logout</a>
                                        </div>
                                    </div>: null
                                }
                        </div>
                    </div>
                </nav>
            </Hoc>
        );
    }
}

const mapStateToProps = state => {
    return {
        userId: state.auth.email,
        email: state.auth.email,
        name: state.auth.name,
        token: state.auth.token,
        role: state.auth.role,
        accountValidated: state.auth.accountValidated,
        user: state.auth.user,
        newReservationCount: state.auth.reservationCount
    }
}

const mapDispatchToState = dispatch => {
    return {
        onLogout: () => dispatch(logout()),
        onAutoSign: () => dispatch(autoSignIn())
    }
}


export default connect(mapStateToProps, mapDispatchToState)(Header);