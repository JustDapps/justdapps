import React from 'react';
import { storiesOf } from '@storybook/react';
import ModelsList from '.';

const emptyList = [];
const nonEmptyList = [
  { name: 'test1' },
  { name: 'test2' },
  { name: 'test3' },
];

storiesOf('ModelsList', module)
  .add('EmptyList', () => (
      <ModelsList
          models={emptyList}
        />
  ))
  .add('FilledList', () => (
      <ModelsList
          models={nonEmptyList}
        />
  ));
