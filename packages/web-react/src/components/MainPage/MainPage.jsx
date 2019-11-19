import React from 'react';
import { connect } from 'react-redux';
import ModelsBrowser from '../ModelsBrowser/ModelsBrowser';

const MainPage = ({ userName }) => {
    return (
        <div>
            {`Welcome, ${userName}`}
            <ModelsBrowser>

            </ModelsBrowser>
        </div>
    );
};

const mapStateToProps = (state) => ({
    userName: state.auth.user.name
});

export default connect(mapStateToProps)(MainPage);