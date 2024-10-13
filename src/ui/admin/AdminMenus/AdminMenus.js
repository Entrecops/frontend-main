import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload} from '@fortawesome/free-solid-svg-icons';
import Loader from '../../globalComponent/Loader';
import Hoc from '../../globalComponent/Hoc';
import { rootUrl } from '../../../configs/config';

class AdminMenu extends Component {

    state = {
        showModal: false,
        menusLoading: true,
        showReservationListModal: false,
        menus: [],
        menusAll: [],
        error: '',
        menu: null,
        loading: false,
        showCreationModal: false,
        selectedReservations: [],
        deleting: false,
        currentPage: 1,
        menuPerPage: 15
    }

    componentDidMount() {
        this.getAllmenus();
    }

    getAllmenus = () => {
        //Get all menus
        axios.get('/api/gallery/menus/all')
            .then(res => {
                this.setState({ menusAll: res.data.menus, menus: res.data.menus, menusLoading: false, error: '' })
            })
            .catch(err => {
                this.setState({ error: "Une érreur s'est produite. Veuillez reéssayer.", menusLoading: false })
            })
    }

    refreshmenuList = () => {
        this.setState({ menusLoading: true })
        this.getAllmenus();
    }

    // Refresh view when delete or validate menu/menu
    refreshList = (list, name) => {
        this.setState({
            [name]: list
        })
    }

    paginate = pageNumber => {
        this.setState({ currentPage: pageNumber });
    };

    downloadMenu = ( menu, nom ) => {
        const element = document.createElement("a");
        element.href = rootUrl + '/' + menu;
        element.target = "_blank";
        element.download = nom.replace(/[/\\?%*:|"<>]/g, '-') + "_menu.pdf";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    searchmenus = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ menus: this.state.menusAll.filter( ev => ev.title.toLowerCase().includes(filterParam.toLowerCase()) )});
    }

    render() {
        const { error, menus, menusLoading, menuPerPage, currentPage } = this.state;

        const indexofLastmenu = currentPage * menuPerPage;
        const indexofFirstMenu = indexofLastmenu - menuPerPage;
        const currentMenus = menus.slice(indexofFirstMenu, indexofLastmenu);

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(menus.length / menuPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <Hoc>
                <div className="container">
                    <div className="row mt-5">
                        <div className="col-sm-12 text-center d-flex justify-content-between align-items-center mb-5">
                            <h3 className="title">TOUS LES MENUS</h3>
                        </div>
                        <div className="col-sm-12 text-center mb-2">
                            <input type="text" placeholder="Rechercher un menu" id="searchbar" onChange={this.searchmenus}/>
                        </div>
                        <div className="col-sm-12 text-center">
                            {error && error.length ? <div className="alert alert-danger" style={{ fontSize: "1.3rem" }}>{error}</div> : null}
                            {
                                menusLoading ? <Loader /> :
                                    menus && menus.length ?
                                    <table className="table table-bordered">
                                        <thead className="thead-inverse thead-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Service/Evenement</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                currentMenus.map((menu, i) => (
                                                    <tr key={menu._id}>
                                                        <th scope="row">{i + 1}</th>
                                                        <td>{menu.title}</td>
                                                        <td className="actions">
                                                            <button
                                                                onClick={() => this.downloadMenu( menu.menu, menu.title )}
                                                                className="btn btn-outline-dark btn-md ml-3"
                                                                value="download"
                                                            >
                                                                Télécharger
                                                                <FontAwesomeIcon icon={faDownload} size={"1x"} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table> : null}
                                    <div className='pagi'>
                                    <h5>Pagination</h5>
                                    <ul className="pagination">
                                        {pageNumbers.map(number => (
                                            <li key={number} className="page-item">
                                                <button onClick={() => this.paginate(number)} className="mr-3 page-link">
                                                    {number}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    </div>
                        </div>
                    </div>
                </div>
            </Hoc>
        );
    }
}

const mapPropsToState = state => {
    return {
        user: state.auth.user
    }
}
export default connect(mapPropsToState)(AdminMenu);