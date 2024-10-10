import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.scss';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import  {rootUrl} from './configs/config'
import Footer from './ui/globalComponent/Footer';

axios.defaults.baseURL = rootUrl;
// axios.defaults.headers.common['Authorization'] = "token";
axios.defaults.headers.post['Content-Type'] = "application/json";

const store = configureStore();

ReactDOM.render(
    <Provider store={store}>
        <div id="content">
            <App />
        </div>
        <Footer />
    </Provider>, 
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
