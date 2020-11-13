import React, {Fragment} from 'react';
import spinner from '../../img/spinner.gif';

const Spinner = () => {
    console.log('Spinner initiated');
    
    return (
    <Fragment>
        <img 
            src = {spinner}
            style = {
                {
                    width: '200px', margin: 'auto', display: 'black'
                }
            }
            alt = 'Loading...'
        />
    </Fragment>
    );
};

export default Spinner;