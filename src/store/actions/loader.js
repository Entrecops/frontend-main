import * as actionTypes from '../actions/actionsTypes';

export const renderLoader = () => {
    return {
        type: actionTypes.START_LOADING
    }
};

export const clearLoader = () => {
    return {
        type: actionTypes.STOP_LOADING
    }
};

