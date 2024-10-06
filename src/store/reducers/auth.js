import * as actionTypes from '../actions/actionsTypes';

const initialState = {
    name: '',
    email: '',
    token: null,
    error: '',
    reservationCount: null,
    expiresDate: '',
    userId: null,
    role: ''
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.LOGIN:
            return {
                ...state,
                userId: action.data.user._id,
                name: action.data.user.name,
                email: action.data.user.email,
                token: action.data.token,
                accountValidated: action.data.user.accountValidated,
                expiresDate: action.data.expiresDate,
                role: action.data.user.role,
                user: action.data.user,
                error: ''
            };
        case actionTypes.SIGNUP:
            return {
                ...state,
                userId: action.data.user._id,
                name: action.data.user.name,
                email: action.data.user.email,
                token: action.data.token,
                accountValidated: action.data.user.accountValidated,
                expiresDate: action.data.expiresDate,
                role: action.data.user.role,
                user: action.data.user,
                error: ''
            };
        case actionTypes.LOGOUT:
            return {
                ...state,
                userId: null,
                name: '',
                email: '',
                token: null,
                expiresDate: null,
                role: '',
                error: ''
            };
        case actionTypes.AUTH_ERROR:
            return {
                ...state,
                error: action.errorType
            };
        case actionTypes.CLEAR_ERROR:
            return {
                ...state,
                error: ''
            };
        case actionTypes.COUNT_RESERVATION:
            return {
                ...state,
                reservationCount: action.data.reservationCount
            };
        case actionTypes.INCREMENT_RESERVATION:
            console.log("caledd incrementation");
            return {
                ...state,
                reservationCount: state.reservationCount + 1            };
        default:
            return state;
    }
}

export default reducer;