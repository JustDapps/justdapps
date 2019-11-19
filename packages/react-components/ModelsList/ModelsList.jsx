import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Input, List,
} from 'antd';


const ModelsList = ({ models }) => {
  const [search, setSearch] = useState('');

  const UpdateSearch = (event) => {
    setSearch(event.target.value);
  };

  const filteredModels = models.filter(
    (model) => model.name.indexOf(search) > -1,
  );


  return (
    <>
      <Input
        placeholder="Search"
        value={search}
        onChange={UpdateSearch}
      />
      <List
        size="small"
        header="Your models list"
        footer=""
      >
        {
          filteredModels.map((model) => (
            <List.Item>
              {model.name}
            </List.Item>
          ))
        }
      </List>
    </>
  );
};

ModelsList.propTypes = {
  models: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
  })).isRequired,

};
export default ModelsList;
