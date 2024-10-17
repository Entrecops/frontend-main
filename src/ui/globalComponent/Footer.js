import React, { Component } from 'react';
import { SocialIcon } from 'react-social-icons';
import './Footer.scss';
import orange from '../../assets/images/orange-money.jpg'
import mtn from '../../assets/images/mobile-money.jpg'
import yup from '../../assets/images/logoyup.png'

class Footer extends Component {
    render() {
        return (
            <footer className="bg-dark footer">
                <div className="container py-3">
                   <div className="row pt-5 pb-3">
                        <div className="col-sm-12 col-md-3">
                            <h4 className="text-white">Liens Rapides</h4>
                            <ul>
                                <li><a href="/auth/login">Mon Compte</a></li>
                                <li><a href="/services">Services</a></li>
                                <li><a href="/events">Annonces</a></li>
                                <li><a href="/gallery">Galerie</a></li>
                            </ul>
                        </div>
                        <div className="col-sm-12 col-md-3">
                            <h4 className="text-white">Société</h4>
                            <ul>
                                <li><a href="/#">Contact</a></li>
                                <li><a href="/#">A propos</a></li>
                                <li><a href="/#">Confidentialité</a></li>
                                <li><a href="/#">Termes & Conditions</a></li>
                            </ul>
                        </div>                        
                        <div className="col-sm-12 col-md-3">
                            <h4 className="text-white">Contact</h4>
                            <ul>
                                <li>Entre Cops, Yaoundé Cameroun</li>
                                <li>Appelez-nous: 697395271</li>
                                <li>Email: dtamamot@gmail.com</li>
                            </ul>

                           
                        </div>
                        <div className="col-sm-12 col-md-3 conten">
                            <h4 className="text-white">Paiement</h4>
                            <ul>
                                <li>Paiment sécurisé avec:</li>
                                <li className='col-sm-9'>
                                    <img src={orange} className="img-fluid" alt="orange money" />
                                    <img src={mtn} className="img-fluid" alt="Mtn MOMO" />
                                </li>
                            </ul>
                        </div>
                    </div>
                   <div className="row py-4">
                   <div className="col-sm-12">
                        <ul className="row pt-1">

                            <li className='col-sm-1 social'><SocialIcon url="https://www.facebook.com/Entre-Cops-101914647857273/" target="_blank" size={5} /></li>
                            <li className='col-sm-1 social'><SocialIcon url="https://www.instagram.com/xxxxx/" target="_blank" size={5} /></li>
                            <li className='col-sm-1 social'><SocialIcon url="https://www.linkedin.com/xxxxx/" target="_blank" size={5}/></li>
                            <li className='col-sm-1 social'><SocialIcon url="https://wa.me/237xxxxxxx" target="_blank" size={5}/></li>

                        </ul>
                        </div>
                        <div className="text-center col-sm-12">
                            <h5 className="text-white mt-5">Copyright @2019. All rights Reserved.</h5>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;