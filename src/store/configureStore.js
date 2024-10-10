import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'; 

import authReducer from './reducers/auth';
import loaderReducer from './reducers/loader';
const rootReducer = combineReducers({
    auth: authReducer,
    loader: loaderReducer
});

let composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = () => {
    return createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
};

export default configureStore;