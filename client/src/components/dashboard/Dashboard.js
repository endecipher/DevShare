import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { deleteAccount, getCurrentProfile } from '../../actions/profile';
import Spinner from '../layout/Spinner';
import DashboardActions from './DashboardActions';
import Experience from './Experience';
import Education from './Education';

const Dashboard = ({
    getCurrentProfile,
    auth : {
        user
    },
    profile: {
        profile,
        loading
    },
    deleteAccount
}) => {

    useEffect(() => {
        getCurrentProfile();
    }, [getCurrentProfile]);

    return loading && profile === null ? <Spinner /> : <Fragment>
            <h1 className="large text-primary">Dashboard</h1>
            <p className="lead">
                <i className="fas fa-user"></i> Welcome { user && user.name }
            </p>
            { profile !== null ? 
            <Fragment>
                <DashboardActions/>
                <Experience experience={profile.experience}/>
                <Education education={profile.education}/>
                <div className="my-2" onClick={() => deleteAccount()}>
                    <button className="btn btn-danger">
                        <i className="fas fa-user-minus"></i>{' '}
                        Delete Account
                    </button>
                </div>
            </Fragment> : 
            <Fragment>
                <p>You have not setup your profile. Please add info.</p>
                <Link to="/create-profile" className="btn btn-primary my-1">
                    Create Profile
                </Link>
            </Fragment>}
        </Fragment>;
}

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    auth: state.auth,
    profile: state.profile,
    deleteAccount: PropTypes.func.isRequired,
});

export default connect(mapStateToProps, {getCurrentProfile, deleteAccount})(Dashboard)
