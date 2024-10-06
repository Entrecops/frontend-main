import * as actionTypes from '../actions/actionsTypes';
import {clearLoader} from '../actions'
import axios from 'axios';

export const signup = (data) => {
    return dispatch => {
        try {
            axios.post('/api/user/signup', {
                "email": data.email,
                "password": data.password,
                "name": data.name,
                "tel": data.tel
            })
            .then(res => {
                // Save in localstorage
                localStorage.setItem('authData', JSON.stringify(res.data));
                dispatch(startSignup(res.data))
                dispatch(clearLoader())
            })
            .catch(err => {
                // User already Exist
                if (err.response.data.message === 'EMAIL_EXIST') {
                    dispatch(authError("Adresse Email déja utilisée"))
                } else {
                    dispatch(authError("Une érreur s'est produite, Veuillez reéssayer"))
                }
                dispatch(clearLoader())
            })
        } catch (error) {
            dispatch(authError("Problème de connection."))
            dispatch(clearLoader())
        }
    }
};

export const startSignup = (data) => {
    return {
        type: actionTypes.SIGNUP,
        data: data
    }
};


export const login = (data) => {
    return dispatch => {
        try {
            axios.post('/api/user/login', {
                "email": data.email,
                "password": data.password
            })
            .then(res => {
                // Save in localstorage
                localStorage.setItem('authData', JSON.stringify(res.data));
                // Get reservation listing (admin or supplier)
                if( res.data.user.role === 'admin') {
                    axios.get('/api/user/admin-reservations/noview' )
                    .then( result => {
                        const reservations = result.data.body;
                        dispatch( countNotViewedReservations( reservations, res.data.user.role));
                    });
                } else if( res.data.user.role === 'supplier') {
                    axios.get('/api/user/supplier-reservations/' + res.data.user._id + '/noview' )
                    .then( result => {
                        const reservations = result.data.body;
                        dispatch( countNotViewedReservations( reservations, res.data.user.role));
                    });
                }
                dispatch(startLogin(res.data))
                dispatch(clearLoader())
            })
            .catch(err => {
                if (err.response.data.message === 'WRONG_PASSWORD'
                    || err.response.data.message === 'EMAIL_NOT_EXIST') {
                    dispatch(authError("Vos informations sont Incorrectes."))
                } else {
                    dispatch(authError("Une érreur s'est produite, Veuillez reéssayer"))
                }
                dispatch(clearLoader())
            })
        } catch (error) {
            dispatch(authError("Erreur de connexion. Veuillez reéssayer."))
            dispatch(clearLoader())
        }
    }
};

export const countNotViewedReservations = ( reservations, type = "admin" ) => {
    let count;
    if( type === 'admin') {
        count = reservations.filter( res => !res.adminViewed ).length;
    } else {
        count = reservations.filter( res => !res.partnerViewed ).length;
    }
    return {
        type: actionTypes.COUNT_RESERVATION,
        data: { reservationCount : count}
    }
}

export const incrementReservation = () => {
    return {
        type: actionTypes.INCREMENT_RESERVATION,
        data: { new_reservation: 1 }
    }
}

export const startLogin = (data) => {
    return {
        type: actionTypes.LOGIN,
        data: data
    }
};

export const authError = (type) => {
    return {
        type: actionTypes.AUTH_ERROR,
        errorType: type
    }
};

export const clearError = () => {
    return {
        type: actionTypes.CLEAR_ERROR
    }
};


export const logout = () => {
    localStorage.removeItem('authData')
    return {
        type: actionTypes.LOGOUT
    }
};

// Auto signin the user when the token expires
export const autoSignIn = () => {
    let authData = localStorage.getItem("authData");
    authData = JSON.parse(authData);
    return dispatch => {
        const now = new Date();
        if (authData && authData.token && authData.user) {
            const parsedExpiryDate = new Date(parseInt(authData.expiresDate));
            if (parsedExpiryDate > now) {
                // Get user data and update the local storage/ The localstorage can be outdated
                axios.get('/api/user/' + authData.user._id)
                .then(res => {
                    const newAuthData = {...authData};
                    newAuthData.user = res.data.user;
                    localStorage.setItem("authData", JSON.stringify(newAuthData));
                    dispatch(startLogin(newAuthData));
                    // Get reservation listing (admin or supplier)
                    if( newAuthData.user.role === 'admin') {
                        axios.get('/api/user/admin-reservations/noview' )
                        .then( res => {
                            const reservations = res.data.body;
                            dispatch( countNotViewedReservations( reservations, newAuthData.user.role));
                        });
                    } else if( newAuthData.user.role === 'supplier') {
                        axios.get('/api/user/supplier-reservations/' + newAuthData.user._id + '/noview' )
                        .then( res => {
                            const reservations = res.data.body;
                            dispatch( countNotViewedReservations( reservations, newAuthData.user.role));
                        });
                    }
                    console.log("Auto sign")
                })
                .catch(err => {

                })
            } else {
                // Generate a new token and login the user
                const user = {
                    email: authData.user.email,
                    name: authData.user.name,
                    userId: authData.user.userId,
                }
                axios.post('/api/user/generatetoken', user)
                .then(res => {
                    console.log("Re signin");
                    // Update the localstorage localstorage
                    let previousData = JSON.parse(localStorage.getItem('authData'));
                    previousData.token = res.data.token;
                    previousData.expiresDate = res.data.expiresDate;
                    localStorage.setItem('authData', JSON.stringify(previousData));
                    const newData = {
                        ...user,
                        token: res.data.token,
                        expiresDate: res.data.expiresDate
                    }
                    dispatch(startLogin(newData))
                })
                .catch(err => {
                    dispatch(authError("Erreur de connexion. Veuillez reéssayer."))
                })
            }
        } else {
            console.log("Logout")
            dispatch(logout());
        }
    }
};


export const soclialAuthStart = (name, photo) => {
    return dispatch => {
        try {
            axios.post('/api/user/socialauth', {
                "name": name,
                "photo": photo
            })
            .then(res => {
                // Save in localstorage
                localStorage.setItem('authData', JSON.stringify(res.data));
                dispatch(startLogin(res.data))
            })
            .catch(err => {
                console.log({err})
            })
        } catch (error) {
            console.log(error)
        }
    }
};