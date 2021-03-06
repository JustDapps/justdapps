import React from 'react';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import { startAuthGoogle, authGoogleFailure, loadModels } from '../../actions';

const WelcomePage = ({ startAuthGoogle, authGoogleFailure, loadModels }) => {
    const onGoogleResponse = (response) => {
        startAuthGoogle(response.accessToken);
        loadModels();
    };

    const onGoogleFailure = error => {
        authGoogleFailure(error);
    }

    return (
        <>
            <div>
                Welcome
        </div>
            <GoogleLogin
                clientId='1056858998168-fb2el4h0vc42f75f03a30dku0qids7uf.apps.googleusercontent.com'
                buttonText='Login'
                onSuccess={onGoogleResponse}
                onFailure={onGoogleFailure}
            />
        </>
    );
}

export default connect(
    null,
    { startAuthGoogle, authGoogleFailure, loadModels }
)(WelcomePage);