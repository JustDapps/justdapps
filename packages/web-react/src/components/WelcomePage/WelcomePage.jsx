import React from 'react';
import {GoogleLogin} from 'react-google-login';

const WelcomePage = (props) => {
    const onGoogleResponse = res => {
        console.log(res);
    }

    const onGoogleFailure = res => {
        console.log(res);
    }

    return <>
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
}

export default WelcomePage;