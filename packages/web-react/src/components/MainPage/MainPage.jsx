import React from 'react';
import {connect} from 'react-redux';

const MainPage = ({userName}) => {
    return (
        <div>
            {`Welcome, ${userName}`}
        </div>
    );
};

const mapStateToProps = (state) => ({
    userName: state.auth.user.name
});

export default connect(mapStateToProps)(MainPage);