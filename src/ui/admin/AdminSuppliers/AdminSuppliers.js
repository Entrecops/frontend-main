import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import {DateFormat} from '../../utils/DateFormat'
import Button from 'react-bootstrap/Button';
import Loader from '../../globalComponent/Loader';
import Hoc from '../../globalComponent/Hoc';
import SupplierForm from '../../components/Forms/SuplierForm';
import {rootUrl} from '../../../configs/config';


class AdminSupplier extends Component {

    state = {
        showModal: false,
        suppliers: [],
        suppliersAll: [],
        currentPage: 1,
        suppliersPerPage: 15,


        loading: true,
        supplier: null,
        editableSupplier: null,
        validating: false,
        deleting: false,
        loadinSingle: false,


        error: '',
        fetcherror: '',
        showSupplierCreationModal: false,
        showSupplierEditModal: false,
        thresholdDays: 7 // Default threshold duration
    }

    closeSupplierModal = () => {
        this.setState({showSupplierCreationModal: false, showSupplierEditModal: false});
        axios.get('/api/supplier/all')
        .then(res => {
            this.setState({
                loading: false,
                suppliersAll: res.data.suppliers.reverse(),
                suppliers: res.data.suppliers.reverse(),
                'fetcherror': ''
            })
        })
        .catch(err => {
            this.setState({
                loading: false,
                'fetcherror': "Erreur survenue, veuillez actualiser"
            })
        });
    }

    openSupplierEditModal = ( supplier ) => {
        this.setState({showSupplierEditModal: true, editableSupplier: supplier});
    }

    componentDidMount() {
        this.retrieveSuppliers();
    }

    retrieveSuppliers = () => {
        axios.get('/api/supplier/all')
            .then(res => {
                this.setState({
                    loading: false,
                    suppliersAll: res.data.suppliers.reverse(),
                    suppliers: res.data.suppliers.reverse(),
                    fetcherror: ''
                });
            })
            .catch(err => {
                this.setState({
                    loading: false,
                    fetcherror: "Erreur survenue, veuillez actualiser"
                });
            });
    };

    paginate = pageNumber => {
        this.setState({ currentPage: pageNumber });
    };



    getSingleSupplier = (id) => {
        this.setState({ loadinSingle: true, showModal: true })
        axios.get('/api/supplier/'+id)
        .then(res => {
            this.setState({
                loadinSingle: false,
                supplier: res.data.supplier,
                'error': ''
            })
        })
        .catch(err => {
            this.setState({
                loadinSingle: false,
                'error': 'Erreur survenue, veuillez actualiser'
            })
        })
    }

    validateSupplier = (supplier) => {
        this.setState({ validating: true, supplier: supplier })
        axios.patch('/api/supplier/validate/' +supplier._id)
        .then(res => {
            let suppliers = this.state.suppliers.map(supplier => {
                let newSupplier = { ...supplier};
                if (supplier._id === this.state.supplier._id) {
                    newSupplier.accountValidated = true;
                }
                return newSupplier;
            })
            this.setState({
                suppliers: suppliers,
                validating: false,
                showModal: false,
                'error': ''
            })
            // Send Email to Supplier with link to set his password
            const subject = "Validation de votre compte fournisseur";
            axios.post('/api/email/sendmail/' +supplier.email+ '/' +subject+ '/' +supplier.name+ '/' +supplier._id+ '/validatesupplier');
        })
        .catch(err => {
            this.setState({
                validating: false,
                'error': 'Erreur survenue, veuillez actualiser'
            })
        })
    }

    deleteSupplier = (supplier) => {
        this.setState({ deleting: true, supplier: supplier })
        axios.delete('/api/user/'+supplier._id)
        .then(res => {
            let suppliers = this.state.suppliers.filter(supplier => {
                return JSON.stringify(supplier) !== JSON.stringify(this.state.supplier)
            })
            this.setState({
                deleting: false,
                showModal: false,
                suppliers: suppliers
            })
        })
        .catch(err => {
            this.setState({
                deleting: false,
                error: err
            })
        })
    }

    exportSupplierListCSV = (data) => {
        let csvContent = "data:text/csv;charset=utf-8,";
        // Format our csv file content
        csvContent += "id , name, email, tel \r\n";
        data.forEach(function (rowArray, i) {
            let row = (i + 1) + " , " + rowArray.name + " , " + rowArray.email + " , " + rowArray.tel;
            csvContent += row + "\r\n";
        });

        // Creating the file
        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "fournisseurs.csv");
        link.click();
    }

    searchSuppliers = ( e ) => {
        const filterParam = e.target.value;
        this.setState({ suppliers: this.state.suppliersAll.filter(
            ev =>
                ev.name.toLowerCase().includes(filterParam.toLowerCase()) ||
                ev.email.toLowerCase().includes(filterParam.toLowerCase()) )});
    }

    handleThresholdChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            this.setState({ thresholdDays: value });
        }
    }

    render() {
        const { loading, suppliers, supplier, validating, currentPage, suppliersPerPage, deleting, error, fetcherror, loadinSingle, thresholdDays } = this.state;
        const currentDate = new Date();
        const thresholdDate = new Date(currentDate);
        thresholdDate.setDate(currentDate.getDate() - thresholdDays);

        const indexOfLastSupplier = currentPage * suppliersPerPage;
        const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
        const currentSuppliers = suppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);

        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(suppliers.length / suppliersPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <Hoc>
                <div className="container">
                    <div className="row mt-5">
                        <div className="col-sm-12 d-flex justify-content-between align-items-center mb-5">
                            <h3 className="title">FOURNISSEURS</h3>
                            <button onClick={() => this.setState({ showSupplierCreationModal: true })} className="button">Ajouter un Fournisseur</button>
                        </div>
                        <div className="col-sm-8 text-center mb-2">
                            <div className="d-flex align-items-center">
                                <input type="text" placeholder="Filtrer les fournisseurs" id="searchbar" onChange={this.searchSuppliers} className="col-12 form-control mr-5"/>
                                <h5 className="mb-0">Ancienneté: </h5>
                                <input type="number" id="thresholdDays" value={thresholdDays} onChange={this.handleThresholdChange} className="col-1 form-control ml-2 "/><h5 className="mb-0">Jours</h5>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            {fetcherror && fetcherror.length ? <div className="alert alert-danger">{fetcherror}</div> : null}
                            {
                                loading ? <div className="p-4 text-center"><Loader /></div> :
                                    suppliers&&suppliers.length ?
                                    <table className="table table-bordered">
                                        <thead className="thead-inverse thead-dark">
                                            <tr>
                                            <th>#</th>
                                            <th>Nom</th>
                                            <th>Email</th>
                                            <th>Tel</th>
                                            <th>Création</th>
                                            <th>Etat</th>
                                            <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            currentSuppliers.map((supplier, id) => (
                                                <tr key={supplier._id} style={{ backgroundColor: ( new Date(supplier.date) >= thresholdDate ) ? "#FFFF00" : "#fff"}}>
                                                    <th scope="row">{id+1}</th>
                                                    <td>{supplier.name}</td>
                                                    <td>{supplier.email}</td>
                                                    <td>{supplier.tel}</td>
                                                    <td className="date"><DateFormat date={supplier.date} /></td>
                                                    <td className="date">{supplier.accountValidated ? <span style={{ color: "green" }}>Compte Validé</span> : <b style={{ color: "#DC3545" }}>En attente</b>}</td>
                                                    <td className="actions">
                                                        <button className="btn btn-outline-dark btn-md ml-3" onClick={() => this.getSingleSupplier(supplier._id)}>Afficher</button>
                                                        <button onClick={() => this.openSupplierEditModal( supplier )} className="btn btn-dark btn-md ml-3">Modifier</button>
                                                    </td>
                                                </tr>
                                            ))
                                        }

                                        </tbody>
                                    </table>: null }
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
                        <button className="btn btn-danger btn-lg export-btn" onClick={() => this.exportSupplierListCSV(suppliers)}>Exporter la liste</button>
                    </div>
                </div>

                 {/* Validate/delete supplier */}
                 <Modal show={this.state.showModal} size="lg" onHide={() => this.setState({showModal: false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>Détails sur le Fournisseur</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="row">
                            <div className="col-sm-12 pl-4 pr-4 mt-4 mb-3">
                                    {error && error.length ? <div className="alert alert-danger">{error}</div>: null }
                                    {
                                        loadinSingle ? <div className="text-center"><Loader /></div> :
                                            supplier ?
                                            <table className="table table-bordered">
                                                <tbody className="thead-inverse">
                                                    <tr>
                                                        <th><h4><strong>Nom</strong></h4></th>
                                                        <th><h4>{supplier.name}</h4></th>
                                                    </tr>
                                                    <tr>
                                                        <th><h4><strong>Email</strong></h4></th>
                                                            <th><h4>{supplier.email}</h4></th>
                                                    </tr>
                                                    <tr>
                                                        <th><h4><strong>Tel</strong></h4></th>
                                                            <th><h4>{supplier.tel}</h4></th>
                                                    </tr>
                                                    <tr>
                                                        <th><h4><strong>Localisation</strong></h4></th>
                                                            <th><h4>{supplier.location}</h4></th>
                                                    </tr>
                                                    <tr>
                                                        <th><h4><strong>Lien google Map</strong></h4></th>
                                                        <th style={{width: "80%"}}><h4>{supplier.mapLink ? supplier.mapLink:null}</h4></th>
                                                    </tr>
                                                    <tr>
                                                        <th><h4><strong>Services</strong></h4></th>
                                                        <th style={{width: "80%"}}><h4>{supplier.services}</h4></th>
                                                    </tr>
                                                    <tr>
                                                        <th><h4><strong>Autres Infos</strong></h4></th>
                                                            <th><h4>{supplier.otherInfos}</h4></th>
                                                    </tr>
                                                    <tr>
                                                        <th><h4><strong>Profile</strong></h4></th>
                                                            <th>
                                                            <img src={rootUrl+"/"+supplier.profileImage} alt="" width="250" height="250"  className="img-fluid" />
                                                        </th>
                                                    </tr>
                                                </tbody>
                                                </table> : null
                                    }
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            {supplier&&!supplier.accountValidated ?
                                <Button variant="dark" className="mr-3" onClick={() => this.validateSupplier(supplier)}>
                                    {validating ? <Loader color="white" /> :"Valider ce compte"}
                                </Button>:null
                            }
                            <Button variant="danger" className="mr-3" onClick={() => this.deleteSupplier(supplier)}>
                                {deleting ? <Loader color="white" /> : "Supprimer"}
                            </Button>
                            <Button variant="default" onClick={() => this.setState({showModal: false, error: ''})}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Add a new Supplier Popup */}
                <Modal show={this.state.showSupplierCreationModal} size="lg" onHide={() => this.setState({ showSupplierCreationModal: false })} >
                    <Modal.Header closeButton>
                        <Modal.Title>Nouveau Fournisseur</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container supplier-form">
                            <SupplierForm closeModal={this.closeSupplierModal} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="outline" onClick={() => this.setState({ showSupplierCreationModal: false })}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Edit a Supplier Popup */}
                <Modal show={this.state.showSupplierEditModal} size="lg" onHide={() => this.setState({ showSupplierEditModal: false })} >
                    <Modal.Header closeButton>
                        <Modal.Title>Modifier les informations du Fournisseur</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container supplier-form">
                            <SupplierForm closeModal={this.closeSupplierModal} supplier={this.state.editableSupplier} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="py-3">
                            <Button variant="outline" onClick={() => this.setState({ showSupplierEditModal: false })}>
                                Fermer
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            </Hoc>
        );
    }
}

export default AdminSupplier;