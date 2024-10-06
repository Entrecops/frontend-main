import React from 'react';
import Moment from 'react-moment';
import 'moment/locale/fr';

export const DateFormat = (props) => (
    <Moment format="YYYY-MM-DD HH:mm">{props.date}</Moment>
)

export const ForNowDateFormat = props => (
    <Moment fromNow>{props.date}</Moment>
)