import React from 'react';
import {Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import useConfig from '../hooks/useConfig';
import {Order} from '../redux/slices/order';

interface Props {
  item: Order;
}

function EachComplete({item}: Props) {
  const URL = useConfig();
  return (
    <FastImage
      source={{uri: `${URL}/${item.image}`}}
      resizeMode="contain"
      style={{
        height: Dimensions.get('window').width / 3,
        width: Dimensions.get('window').width / 3,
        backgroundColor: 'skyblue',
      }}
    />
  );
}

export default EachComplete;
