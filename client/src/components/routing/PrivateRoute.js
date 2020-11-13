import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import auth from '../../reducers/auth';

//Specifying Private Route for Dashboard will help us check to see if 
//user is authenticated. If user not authenticated, then /dashboard will serve the component
/*
The purpose of PrivateRoute is to create a custom component which will behave just like react-router Route, but the functionality will be extended to allow only authenticated users access private routes. In order to accomplish this:
- PrivateRoute accepts some arguments, one of them is component, when we pass "component" as an argument to route it has the lower case c, but when we render the component it has to be "Component" to let JSX know that we want to render a component and no an HTML element like "div", so that's why it's component: Component ,
- We pull out isAuthenticated and loading from auth. ...rest will grab the rest of the arguments to a single array called rest.
- Then we are returning route, {...rest}  now will spread the rest of the arguments to Route for example "to" and "exact".
- We are using property render instead of component because we can pass a function to a render, which will allow us to render conditionally based on "isAuthenticated" and "loading".
- Next, we are checking if a user is authenticated and the status of loading and either redirect the user to "/login" or render the Component passing the props {...props} from the function which are react-router specific properties like history.


*/

const PrivateRoute = ({component: Component, auth: { isAuthenticated, loading }, ...rest}) => 
{
    console.log('PrivateRoute Dashboard: isAuth: '+ isAuthenticated + ' and loading: '+ loading+' and thus->');
    !isAuthenticated && !loading ?
    console.log('Going to Login because yeah') : console.log('Render component');
    return (
        <Route {...rest} render={props => !isAuthenticated && !loading ? (
            
            <Redirect to="/login"/>
        ) : (<Component {...props}/>) } />
    )
}

PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute)
