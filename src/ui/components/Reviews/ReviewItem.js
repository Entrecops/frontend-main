import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import {ForNowDateFormat} from '../../utils/DateFormat';
import './ReviewItem.scss';

const ReviewItem = (props) => {
    return (
        <div className="row review-item">
            <div className="col-sm-12">
                <div className="box-head d-flex">
                    <FontAwesomeIcon icon={faUserCircle} size={"3x"} />
                    <div className="box-body">
                        <h5>@{props.comment.name}</h5>
                        <p className="mt-3 pb-3 mb-1">{props.comment.message}</p>
                        {(props.role === "admin")&&<button disabled={props.deletingComment} className="btn btn-danger mb-4" onClick={() => props.deleteComment(props.comment._id)}>Supprimer</button>}
                    </div>
                    <span className="ml-auto flex-shrink-0 pl-3"><ForNowDateFormat date={props.comment.date} /></span>
                </div>
            </div>
        </div>
    );
}

export default ReviewItem;