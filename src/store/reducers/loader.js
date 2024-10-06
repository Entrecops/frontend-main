import * as actionTypes from '../actions/actionsTypes';

const initialState = {
    loading: false
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.START_LOADING:
            return {
                ...state,
                loading: true
            };
        case actionTypes.STOP_LOADING:
            return {
                ...state,
                loading: false
            };
        default:
            return state;
    }
}

export default reducer;