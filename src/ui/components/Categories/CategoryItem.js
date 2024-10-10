import React from 'react';
import { NavLink } from 'react-router-dom';
import imgSante from '../../../assets/icons/biceps.svg';
import imgShopping from '../../../assets/icons/shopping-store.svg';
import imgBar from '../../../assets/icons/meat.svg';
import imgVoyage from '../../../assets/icons/map-location.svg';
import imgSortir from '../../../assets/icons/idea.svg';
import imgCoupons from '../../../assets/icons/graphic-design.svg';
import madein from '../../../assets/icons/237maded.png';

const CategoryItem = (props) => {
    const {category} = props;
    const categoryName = category.name.split(" ").join("-");
    let url = "";
    if (window.location.pathname.split('/')[1] === "events") {
        url = "/events/category/" + categoryName;
    } else if (window.location.pathname.split('/')[1] === "services") {
        url = "/services/category/" + categoryName;
    } else {
        url = "/category/" + categoryName;
    }

    return (
        <div className="wrimagecard wrimagecard-topimage">
            <NavLink to={url}>
                <div className="wrimagecard-topimage_header">
                    <center>
                        {(category.name === "Coupons") && <img src={imgCoupons} alt="" />}
                        {(category.name === "Sortir") && <img src={imgSortir} alt="" />}
                        {(category.name === "Bar lounge & Restaurants") && <img src={imgSante} alt="" />}
                        {(category.name === "Beauté & Santé") && <img src={imgSante} alt="" />}
                        {(category.name === "Voyages") && <img src={imgVoyage} alt="" />}
                        {(category.name === "Shopping") && <img src={imgShopping} alt="" />}
                        {(category.name === "Made in 237") && <img src={madein} alt="" />}
                    </center>
                </div>
                <div className="wrimagecard-topimage_title">
                    <p className={props.selected ? "text-center selected": "text-center"}>{category.name}</p>
                </div>
            </NavLink>
        </div>
    );
}

export default CategoryItem;