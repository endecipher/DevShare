import React, {Fragment, useEffect} from 'react';
import Spinner from '../layout/Spinner';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ProfileItem from './ProfileItem';
import {getProfiles} from '../../actions/profile';


const Profiles = ({
    getProfiles,
    profile: { profiles, loading}
}) => {

    useEffect(()=>{
        getProfiles();
    }, [getProfiles]);

    return (
        <Fragment>
            {loading ? <Spinner/> : 
                <Fragment>
                    <h1 className="large text-primary">Developers</h1>
                    <p className="lead">
                        <i className="fab fa-connectdevelop"></i>
                        Browse and Connect with Developers
                    </p>
                    <Fragment>
                    <div className="profiles">
                        { profiles.length > 0 ? (
                            profiles.map( profile=> (
                                <ProfileItem key={profile._id} profile={profile} />
                            ))
                        ) : <h4>No Profiles found</h4> }
                    </div>
                    </Fragment>
                </Fragment>}
        </Fragment>
    )
}

Profiles.propTypes = {
    profile: PropTypes.object.isRequired,
    getProfiles: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    profile: state.profile
});

export default connect(mapStateToProps, {getProfiles})(Profiles);
